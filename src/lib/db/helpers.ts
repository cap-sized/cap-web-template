export function sanitize_query(query: string): string {
	if (query.length == 0) {
		throw 'Empty query string';
	}
	return query.split(';')[0];
}

export function sanitize_int_list(nums: string, separator: string = ','): number[] {
	return nums
		.split(separator)
		.map((x) => parseInt(x))
		.filter((x) => !isNaN(x));
}
