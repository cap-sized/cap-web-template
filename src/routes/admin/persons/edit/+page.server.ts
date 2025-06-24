import { validate_session_permissions } from '$lib/auth/session';
import { SESSION_COOKIE_NAME, unauthorized_msg } from '$lib/common.js';
import { clickhouse_client } from '$lib/db/clickhouse.js';
import { sanitize_int_list } from '$lib/db/helpers.js';
import { Logger } from '$lib/logger.js';
import {
	sql_select_person_raw,
	sql_select_person_view,
	sql_select_player_raw,
} from '$lib/query/sql/persons.js';
import { parse_pagination_params, parse_order_params } from '$lib/query/url/parse.js';
import type { DataSet } from '$lib/types/common.js';
import type { PersonRaw, PlayerRaw } from '$lib/types/db_persons.js';
import type { ResponseJSON } from '@clickhouse/client-web';
import { error } from '@sveltejs/kit';

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

	// TODO: generalise this
	let id_filter = url.searchParams.get('id');
	let ids = sanitize_int_list(id_filter ?? '');
	let person_query = sql_select_person_raw(paginate, order, ids);
	let player_query = sql_select_player_raw(paginate, order, ids);
	// let staff_query = sql_select_staff_raw(paginate, order, ids);
	// let agent_query = sql_select_staff_raw(paginate, order, ids);

	new Logger(url.pathname).debug(person_query);

	const person_resp = await client.query({ query: person_query });
	const { data: person_raw } = (await person_resp.json<PersonRaw>()) as ResponseJSON<PersonRaw>;

	const player_resp = await client.query({ query: player_query });
	const { data: player_raw } = (await player_resp.json<PersonRaw>()) as ResponseJSON<PersonRaw>;

	return {
		tables: [
			{ table_data: person_raw ?? [], type_name: 'person_raw' },
			{ table_data: player_raw ?? [], type_name: 'player_raw' },
		] as DataSet<any>[],
	};
};
