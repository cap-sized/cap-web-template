export function snake_to_capitalize(snake: string): string {
	return snake
		.split('_')
		.map((x: string) => `${x[0].toLocaleUpperCase()}${x.slice(1)}`)
		.join(' ');
}

export function datetime_utc_to_nyt_str(date: Date): string {
	const nyt = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/New_York',
		timeStyle: 'long',
		dateStyle: 'short',
	});
	return nyt.format(date);
}
