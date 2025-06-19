import type { Session, User } from '$lib/types/users';
import type { ClickHouseClient, ResponseJSON } from '@clickhouse/client-web';
import { create_session, sanitize_query } from './session';
import { DB_DATABASES, DB_TABLES } from '$lib/db/clickhouse';

export async function fetch_users(ch: ClickHouseClient, username: string): Promise<User[]> {
	const query = sanitize_query(
		`SELECT * FROM ${DB_DATABASES['default']}.${DB_TABLES['users']} FINAL WHERE (username = '${username}' OR email = '${username}')`
	);

	const response = await ch.query({ query });
	let { data } = (await response.json<User>()) as ResponseJSON<User>;
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
