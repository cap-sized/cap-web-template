import { validate_session_permissions } from '$lib/auth/session';
import { SESSION_COOKIE_NAME, unauthorized_msg } from '$lib/common.js';
import { clickhouse_client } from '$lib/db/clickhouse.js';
import { Logger } from '$lib/logger.js';
import { sql_select_person_view } from '$lib/query/sql/persons.js';
import { parse_pagination_params, parse_order_params } from '$lib/query/url/parse.js';
import type { PersonView } from '$lib/types/db_persons.js';
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

	let full_name_filter = url.searchParams.get('full_name') ?? '';
	let query = sql_select_person_view(paginate, order, full_name_filter);

	new Logger(url.pathname).debug(query);

	const response = await client.query({ query });
	const { data } = (await response.json<PersonView>()) as ResponseJSON<PersonView>;

	return {
		table_data: data ?? [],
		type_name: 'person_view',
	};
};
