export type DateString = string;

export function strptime_ch_utc(dt: DateString): Date {
	return new Date(Date.parse(`${dt.replace(' ', 'T')}Z`));
}

export interface Raw {
	created_by: string;
	created_at: DateString;
	updated_by: string;
	updated_at?: DateString;
}
