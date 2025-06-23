import { CH_DATABASE } from '$env/static/private';
import { sanitize_query } from '$lib/db/helpers';
import type { PaginationParams, OrderParams } from '$lib/types/common';

export function paginate_to_limit_offset(paginate: PaginationParams): {
	offset: number;
	limit: number;
} {
	return {
		offset: paginate.page * paginate.perpage,
		limit: paginate.perpage,
	};
}

export function order_to_str(order: OrderParams): string {
	const keys = Object.entries(order);
	if (!keys.length) return '';
	return `ORDER BY ${Object.entries(order)
		.map(([key, order]) => `${key} ${order}`)
		.join(', ')}`;
}

export function sql_select_paginated(
	table_name: string,
	paginate: PaginationParams,
	order: OrderParams,
	columns: string[] = ['*']
): string {
	const colstr: string = columns.join(', ');
	const orderstr: string = order_to_str(order);
	const { limit, offset } = paginate_to_limit_offset(paginate);
	const query = sanitize_query(
		`SELECT ${colstr} FROM ${CH_DATABASE}.${table_name} ${orderstr} LIMIT ${limit} OFFSET ${offset}`
	);
	return query;
}
