import { sql_select_basic_player_view } from '$lib/query/sql/persons';
import { expect, test } from 'vitest';
import { TEST_PAGINATION } from './tools.test';
import { paginate_to_limit_offset } from '$lib/query/sql/tools';
import { CH_DATABASE } from '$env/static/private';

test('sql_select_player_view', () => {
	const { limit, offset } = paginate_to_limit_offset(TEST_PAGINATION);
	const query_order_full = sql_select_basic_player_view(
		TEST_PAGINATION,
		{
			height_cm: 'ASC',
		},
		['full_name', 'person_id', 'height_cm']
	);
	const order_str = 'height_cm ASC';
	expect(
		query_order_full ==
			`SELECT * FROM ${CH_DATABASE}.v_players ORDER BY ${order_str} LIMIT ${limit} OFFSET ${offset}`
	);
});

test('sql_select_player_raw', () => {
	const { limit, offset } = paginate_to_limit_offset(TEST_PAGINATION);
	const query_order_full = sql_select_basic_player_view(
		TEST_PAGINATION,
		{
			height_cm: 'ASC',
		},
		['full_name', 'person_id', 'height_cm']
	);
	const order_str = 'height_cm ASC';
	expect(
		query_order_full ==
			`SELECT * FROM ${CH_DATABASE}.v_players ORDER BY ${order_str} LIMIT ${limit} OFFSET ${offset}`
	);
});
