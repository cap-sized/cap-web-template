import { SESSION_ID_LENGTH, SESSION_REFRESH_WINDOW, SESSION_SECRET_LENGTH, rng_str } from '$lib/common';
import { TimeSpan, create_datetime_after, get_now_utc, now_is_before, strftime, time_span_between } from '$lib/datetime';
import { DB_TABLES, clickhouse_client } from '$lib/db/clickhouse';
import { Logger } from '$lib/logger';
import { strptime_ch_utc, type UserSessionCh } from '$lib/types/clickhouse';
import { Role, type Session, type User } from '$lib/types/users';
import type { ClickHouseClient, ResponseJSON } from '@clickhouse/client-web';

async function hash_secret(secret: string): Promise<Uint8Array> {
	const secret_bytes = new TextEncoder().encode(secret);
	const secret_hash_buffer = await crypto.subtle.digest('SHA-256', secret_bytes);
	return new Uint8Array(secret_hash_buffer);
}

export function sanitize_query(query: string): string {
	if (query.length == 0) {
		throw 'Empty query string';
	}
	return query.split(';')[0];
}

export async function create_session(
	ch: ClickHouseClient,
	user: User,
	timespan: TimeSpan,
	session_table: string
): Promise<Session> {
	const expires_at = create_datetime_after(new Date(), timespan);
	const { id, role_id } = user;
	const secret = rng_str(SESSION_SECRET_LENGTH);
	const hashed_secret = await hash_secret(secret);
	const token = `${id}.${secret}`;
	const session: Session = {
		user_id: id,
		hashed_secret,
		expires_at,
		token,
	};

	new Logger('create_session').info("session", session, strftime(expires_at, "ISO_UTC"));

	let resp = await ch.insert({
		table: session_table,
		values: [{ id, hashed_secret: new Array(...hashed_secret), role_id, expires_at: strftime(expires_at, "ISO_UTC") }],
		format: 'JSONEachRow',
	});

	new Logger('create_session').success(`Created session [q: ${resp.query_id}]: ${resp.executed}`);

	return session;
}

export async function parse_session_as_query(session_token: string, query_type: "select" | "delete" ): Promise<string | null> {
	const parts = session_token?.split('.');
	if (!parts || parts?.length < 2) {
		return null;
	}

	const secret: string = parts[1];

	const l_sessions = DB_TABLES['sessions'];
	const l_users = DB_TABLES['users'];

	const hashed_secret = await hash_secret(secret);

	switch (query_type) {
		case "select":
			return sanitize_query(
				`SELECT id, email, role_id, username, avatar_url, expires_at FROM 
				${l_sessions} LEFT JOIN ${l_users} ON ${l_sessions}.id = ${l_users}.id 
				WHERE hashed_secret = [${hashed_secret}]`
			);
		case "delete":
			return sanitize_query(
				`DELETE FROM ${l_sessions} WHERE hashed_secret = [${hashed_secret}]`
			);
	}
}

export async function validate_session(
	session_token: string
): Promise<{ user: User | null; session: Session | null, must_refresh: boolean }> {
	const logger = new Logger('validate_session');
	const anon_client = clickhouse_client(Role.anon);
	const query = await parse_session_as_query(session_token, "select");
	if (!query) {
		return { user: null, session: null, must_refresh: false };
	}
	const response = await anon_client.query({ query, });
	const { data } = (await response.json<UserSessionCh>()) as ResponseJSON<UserSessionCh>;
	if (data.length >= 2) {
		logger.error(
			'2 or more sessions matched. Somebody has cloned a session in the database somehow.',
			data
		);
	} else if (data.length == 0) {
		// token dropped, do not autorefresh
		return { user: null, session: null, must_refresh: false };
	}

	const { id, email, role_id, username, avatar_url, expires_at, } = data[0] as UserSessionCh;
	const user_client = clickhouse_client(role_id);
	const expires_at_dt = strptime_ch_utc(expires_at);

	if (!now_is_before(expires_at_dt)) {
		// token expired, do not autorefresh
		const delete_q = await parse_session_as_query(session_token, "delete") ?? '';
		const response = await user_client.exec({ query: delete_q, });
		logger.debug("deleted session", response.summary);
		return { user: null, session: null, must_refresh: false };
	}

	const ttl = time_span_between(expires_at_dt, new Date());

	return {
		user: {
			id,
			email,
			role_id,
			username,
			avatar_url,
		},
		session: {
			user_id: id,
			expires_at: expires_at_dt,
			token: session_token,
		},
		// TODO: autorefresh if under a certain TTL left
		must_refresh: ttl.lte(SESSION_REFRESH_WINDOW)
	};
}
