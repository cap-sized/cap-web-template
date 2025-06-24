import type { DateString } from './db';
import type { Role } from './users';

export interface UserSessionView {
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

export interface UserPermissionsView {
	user_id: string;
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
