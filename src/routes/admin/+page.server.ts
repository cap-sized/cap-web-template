import { select_user_by_id, select_user_from_hashed_secret } from '$lib/auth/db.js';
import { session_token_to_hashed_secret, validate_session_permissions } from '$lib/auth/session.js';
import { SESSION_COOKIE_NAME, unauthorized_msg } from '$lib/common.js';
import { clickhouse_client } from '$lib/db/clickhouse.js';
import type { Transaction } from '$lib/types/custom.js';
import { Role } from '$lib/types/users.js';
import type { ResponseJSON } from '@clickhouse/client-web';
import { error } from '@sveltejs/kit';
import type { Schema } from 'zod';

export const load = async ({ cookies, url }) => {
	const session_token = cookies.get(SESSION_COOKIE_NAME);
	const { allowed, username, role_id } = await validate_session_permissions(session_token ?? '', {
		table: '*',
		permissions: ['select', 'insert', 'update', 'delete'],
	});
	if (!allowed) {
		return error(403, unauthorized_msg(username));
	}

	let client = clickhouse_client(role_id);
	let response = await client.query({ query: 'SELECT * FROM default.transactions LIMIT 10' });
	let { data } = (await response.json<Transaction>()) as ResponseJSON<Transaction>;
	return { table_data: data ?? [], type_name: "transaction" };
};
