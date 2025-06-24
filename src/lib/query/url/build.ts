export function default_page_size(url: URL, size: number): URL {
	if (!url.searchParams.has('size')) url.searchParams.set('size', size.toString());
	return url;
}
