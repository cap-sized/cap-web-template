import { CH_DATABASE } from '$env/static/private';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START } from '$lib/common';
import { order_to_str, paginate_to_limit_offset, sql_select_paginated } from '$lib/query/sql/tools';
import type { PaginationParams, OrderParams } from '$lib/types/common';
import { expect, test } from 'vitest';

export const TEST_PAGINATION: PaginationParams = {
	page: DEFAULT_PAGE_START,
	perpage: DEFAULT_PAGE_SIZE,
};

const TEST_ORDER: OrderParams = {
	key1: 'ASC',
	key2: 'DESC',
	abc: 'ASC',
	one: 'DESC',
};

test('paginate_to_limit_offset', () => {
	const { limit, offset } = paginate_to_limit_offset(TEST_PAGINATION);
	expect(limit == TEST_PAGINATION.perpage);
	expect(offset == TEST_PAGINATION.page * TEST_PAGINATION.perpage);
});

test('order_to_str', () => {
	const actual = order_to_str(TEST_ORDER);
	expect(actual == 'ORDER BY key1 ASC, key2 DESC, abc ASC, one DESC');
	expect(order_to_str({}) == '');
});

test('sql_select_paginated', () => {
	const { limit, offset } = paginate_to_limit_offset(TEST_PAGINATION);
	const name = 'table_name';
	const order_str = 'key1 ASC, key2 DESC, abc ASC, one DESC';
	const query_basic = sql_select_paginated(name, TEST_PAGINATION, {});
	expect(query_basic == `SELECT * FROM ${CH_DATABASE}.${name} LIMIT ${limit} OFFSET ${offset}`);
	const query_order = sql_select_paginated(name, TEST_PAGINATION, TEST_ORDER);
	expect(
		query_order ==
			`SELECT * FROM ${CH_DATABASE}.${name} ORDER BY ${order_str} LIMIT ${limit} OFFSET ${offset}`
	);
	const query_cols = sql_select_paginated(name, TEST_PAGINATION, {}, ['test', 'again']);
	expect(
		query_cols == `SELECT test, again FROM ${CH_DATABASE}.${name} LIMIT ${limit} OFFSET ${offset}`
	);
	const query_order_cols = sql_select_paginated(name, TEST_PAGINATION, TEST_ORDER, [
		'test',
		'again',
	]);
	expect(
		query_order_cols ==
			`SELECT test, again FROM ${CH_DATABASE}.${name} ORDER_BY ${order_str} LIMIT ${limit} OFFSET ${offset}`
	);
});
