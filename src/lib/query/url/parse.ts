import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START } from '$lib/common';
import type { PaginationParams, OrderParams } from '$lib/types/common';

export function parse_pagination_params(
	url: URL,
	default_page_start: number = DEFAULT_PAGE_START,
	default_page_size = DEFAULT_PAGE_SIZE
): PaginationParams {
	const page_num_str = url.searchParams.get('page') ?? url.searchParams.get('p') ?? '';
	const pn = parseInt(page_num_str);
	const page_num = isNaN(pn) || pn < 0 ? default_page_start : parseInt(page_num_str);
	const page_size_str = url.searchParams.get('size') ?? url.searchParams.get('s') ?? '';
	const ps = parseInt(page_size_str);
	const page_size = isNaN(ps) || ps < 0 ? default_page_size : parseInt(page_size_str);
	return { page: page_num, perpage: page_size };
}

export function parse_order_params(url: URL, default_sort_by: OrderParams = {}): OrderParams {
	const has_sorting_params = url.searchParams.has('asc') || url.searchParams.has('desc');
	if (!has_sorting_params) return {};
	const order = has_sorting_params ? {} : default_sort_by;
	(url.searchParams.get('asc') ?? '').split(',').forEach((key) => {
		if (key.length) order[key] = 'ASC';
	});
	(url.searchParams.get('desc') ?? '').split(',').forEach((key) => {
		if (key.length) order[key] = 'DESC';
	});
	return order;
}
