import {
	SESSION_ID_LENGTH,
	SESSION_REFRESH_WINDOW,
	SESSION_SECRET_LENGTH,
	rng_str,
} from '$lib/common';
import {
	TimeSpan,
	create_datetime_after,
	get_now_utc,
	now_is_before,
	strftime,
	time_span_between,
} from '$lib/datetime';
import { DB_TABLES, clickhouse_client } from '$lib/db/clickhouse';
import { sanitize_query } from '$lib/db/helpers';
import { Logger } from '$lib/logger';
import { strptime_ch_utc, type UserSessionCh } from '$lib/types/clickhouse';
import { Role, type Session, type User } from '$lib/types/users';
import type { ClickHouseClient, ResponseJSON } from '@clickhouse/client-web';
import { delete_session, select_user_from_hashed_secret } from './login';

async function hash_secret(secret: string): Promise<Uint8Array> {
	const secret_bytes = new TextEncoder().encode(secret);
	const secret_hash_buffer = await crypto.subtle.digest('SHA-256', secret_bytes);
	return new Uint8Array(secret_hash_buffer);
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

	// TODO: Catch errors here. (check privileges)
	let resp = await ch.insert({
		table: session_table,
		values: [
			{
				id,
				hashed_secret: new Array(...hashed_secret),
				role_id,
				expires_at: strftime(expires_at, 'ISO_UTC'),
			},
		],
		format: 'JSONEachRow',
	});

	new Logger('create_session').success(
		`Created session (${token}) [q: ${resp.query_id}]: ${resp.executed}`
	);

	return session;
}

export async function session_token_to_hashed_secret(token: string) : Promise<Uint8Array | null> {
	const parts = token?.split('.');
	if (!parts || parts?.length < 2) {
		return null;
	}

	const secret: string = parts[1];
	return await hash_secret(secret);
}


export async function validate_session(
	session_token: string
): Promise<{ user: User | null; session: Session | null; must_refresh: boolean }> {
	const logger = new Logger('validate_session');
	const anon_client = clickhouse_client(Role.anon);
	const hashed_secret = await session_token_to_hashed_secret(session_token);
	if (!hashed_secret) {
		return { user: null, session: null, must_refresh: false };
	}
	try {
		const users = await select_user_from_hashed_secret(anon_client, hashed_secret);
		if (users.length >= 2) {
			logger.error(
				'2 or more sessions matched. Somebody has cloned a session in the database somehow.',
				users
			);
		} else if (users.length == 0) {
			// token dropped, do not autorefresh
			return { user: null, session: null, must_refresh: false };
		}

		const { id, email, role_id, username, avatar_url, expires_at } = users[0] as UserSessionCh;
		const user_client = clickhouse_client(role_id);
		const expires_at_dt = strptime_ch_utc(expires_at);

		if (!now_is_before(expires_at_dt)) {
			// token expired, do not autorefresh
			let response = await delete_session(user_client, hashed_secret);
			logger.debug('deleted session', response.summary);
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
			must_refresh: ttl.lte(SESSION_REFRESH_WINDOW),
		};
	} catch (e) {
		logger.error(e);
		return { user: null, session: null, must_refresh: false };
	} 
}
