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
import { strptime_ch_utc } from '$lib/types/db';
import { Role, type AccessLevel, type Session, type User, type Access } from '$lib/types/users';
import type { ClickHouseClient, ResponseJSON } from '@clickhouse/client-web';
import {
	delete_session,
	select_role_permissions_from_hashed_secret,
	select_user_from_hashed_secret,
} from './db';
import type { Cookies } from '@sveltejs/kit';
import { SessionCookieController } from './cookie';
import type { UserSessionView } from '$lib/types/db_users';

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
				user_id: id,
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

export async function session_token_to_hashed_secret(token: string): Promise<Uint8Array | null> {
	const parts = token?.split('.');
	if (!parts || parts?.length < 2) {
		return null;
	}

	const secret: string = parts[1];
	return await hash_secret(secret);
}

export function invalidate_session(cookies: Cookies) {
	const blank_cookie = new SessionCookieController(new TimeSpan(1, 'd')).create_blank_cookie();

	cookies.set(blank_cookie.name, blank_cookie.value, {
		path: '/',
		...blank_cookie.attributes,
	});
}

export async function validate_session_permissions(
	session_token: string,
	access: Access
): Promise<{ allowed: boolean; username?: string; role_id: Role }> {
	// const logger = new Logger('validate_session_permissions');
	const hashed_secret = await session_token_to_hashed_secret(session_token);

	const permissions = await select_role_permissions_from_hashed_secret(
		clickhouse_client(Role.anon),
		hashed_secret,
		access.table
	);
	if (permissions.length == 0) {
		return { allowed: false, role_id: Role.anon };
	}

	// logger.debug('session permissions', permissions[0]);

	const allowed = access.permissions.reduce((allowed, lvl) => {
		return allowed && permissions[0][lvl];
	}, true);
	return { allowed, username: permissions[0].username, role_id: permissions[0].role_id };
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

		const { user_id, email, role_id, username, avatar_url, expires_at } =
			users[0] as UserSessionView;
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
				id: user_id,
				email,
				role_id,
				username,
				avatar_url,
			},
			session: {
				user_id,
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
