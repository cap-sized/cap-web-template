import { CH_DATABASE } from '$env/static/private';
import { select_user_by_id, select_user_from_hashed_secret } from '$lib/auth/db.js';
import { session_token_to_hashed_secret, validate_session_permissions } from '$lib/auth/session.js';
import { SESSION_COOKIE_NAME, unauthorized_msg } from '$lib/common.js';
import { clickhouse_client } from '$lib/db/clickhouse.js';
import { sql_select_full_player_view } from '$lib/query/sql/persons.js';
import { parse_pagination_params, parse_order_params } from '$lib/query/url/parse.js';
import type { FullPlayerView } from '$lib/types/db_persons.js';
import { Role } from '$lib/types/users.js';
import type { ResponseJSON } from '@clickhouse/client-web';
import { error } from '@sveltejs/kit';
import type { Schema } from 'zod';

export const load = async ({ cookies, url }) => {
	// Parse token for permissions
	const session_token = cookies.get(SESSION_COOKIE_NAME);
	const { allowed, username, role_id } = await validate_session_permissions(session_token ?? '', {
		table: '*',
		permissions: ['select', 'insert', 'update', 'delete'],
	});
	if (!allowed) {
		return error(403, unauthorized_msg(username));
	}

	// Instantiate client and query
	let client = clickhouse_client(role_id);
	let paginate = parse_pagination_params(url);
	let order = parse_order_params(url);
	let query = sql_select_full_player_view(paginate, order);

	const response = await client.query({ query });
	const { data } = (await response.json<FullPlayerView>()) as ResponseJSON<FullPlayerView>;

	return {
		table_data: data ?? [],
		type_name: 'full_player_view',
	};
};
