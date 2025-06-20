import type { Role } from './users';

export type DateString = string;

export function strptime_ch_utc(dt: DateString): Date {
	return new Date(Date.parse(`${dt.replace(' ', 'T')}Z`));
}

export interface UserSessionCh {
	id: string;
	google_id?: string;
	discord_id?: string;
	email: string;
	role_id: Role;
	username: string;
	avatar_url: string;
	user_id: string;
	expires_at: DateString;
	token?: string;
}

export interface UserPermissionsCh {
	id: string;
	username?: string;
	role_id: Role;
	expires_at: DateString;
	tables: string;

	select: boolean;
	insert: boolean;
	update: boolean;
	delete: boolean;
	select_self: boolean;
	insert_self: boolean;
	update_self: boolean;
	delete_self: boolean;
	all: boolean;
}
