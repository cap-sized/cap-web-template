export function sanitize_query(query: string): string {
	if (query.length == 0) {
		throw 'Empty query string';
	}
	return query.split(';')[0];
}
