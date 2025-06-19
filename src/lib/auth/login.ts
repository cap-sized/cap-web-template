import type { Session, User } from '$lib/types/users';
import type { ClickHouseClient, ResponseJSON } from '@clickhouse/client-web';
import { DB_DATABASES, DB_TABLES } from '$lib/db/clickhouse';
import { sanitize_query } from '$lib/db/helpers';
import { session_token_to_hashed_secret } from './session';
import type { UserSessionCh } from '$lib/types/clickhouse';


// TODO: Make this login.ts only provide built queries 
export async function select_users_by_username(ch: ClickHouseClient, username: string): Promise<User[]> {
	const query = sanitize_query(
		`SELECT * FROM ${DB_DATABASES['default']}.${DB_TABLES['users']} FINAL WHERE (username = '${username}' OR email = '${username}')`
	);

	const response = await ch.query({ query });
	let { data } = (await response.json<User>()) as ResponseJSON<User>;
	return data ?? [];
}

export async function delete_session(ch: ClickHouseClient, hashed_secret: Uint8Array): Promise<{ok: boolean, summary?: any }> {
	const query = sanitize_query(
		`DELETE FROM ${DB_DATABASES['default']}.${DB_TABLES['sessions']} WHERE hashed_secret = [${hashed_secret}]`
	);

	try {
		const response = await ch.exec({ query });
		return { ok: true, summary: response.summary };
	} catch (e) {
		return { ok: false, summary: e};
	}
	
}

export async function select_user_from_hashed_secret(ch: ClickHouseClient, hashed_secret: Uint8Array) : Promise<User[]> {
	const l_sessions = DB_TABLES['sessions'];
	const l_users = DB_TABLES['users'];
	const query =  sanitize_query(`SELECT id, email, role_id, username, avatar_url, expires_at FROM 
		${l_sessions} LEFT JOIN ${l_users} ON ${l_sessions}.id = ${l_users}.id 
		WHERE hashed_secret = [${hashed_secret}]`);

	const response = await ch.query({ query });
	const { data } = (await response.json<UserSessionCh>()) as ResponseJSON<UserSessionCh>;
	return data ?? [];
}

export async function upsert_user(
	ch: ClickHouseClient,
	user: User
): Promise<{ ok: boolean; summary?: any }> {
	const response = await ch.insert({
		table: DB_TABLES['users'],
		values: [user],
	});
	return {
		ok: response.executed,
		summary: response.summary,
	};
}
