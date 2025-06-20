export type User = {
	id: string;
	google_id?: string;
	discord_id?: string;
	email: string;
	role_id: Role;
	username: string;
	avatar_url?: string;
	password_hash?: string;
};

export type Session = {
	user_id: string;
	expires_at: Date;
	hashed_secret?: Uint8Array;
	token?: string;
};

export enum Role {
	anon = 0,
	authenticated = 1,
	admin = 14,
	superadmin = 15,
}

export type DatabaseUser = {
	username: string;
	password?: string;
	role: Role;
};

export namespace Role {
	export function toString(role: Role): string {
		switch (role) {
			case Role.anon:
				return 'anon';
			case Role.authenticated:
				return 'authenticated';
			case Role.admin:
				return 'admin';
			case Role.superadmin:
				return 'superadmin';
		}
	}
}

export type AccessLevel =
	| 'select'
	| 'insert'
	| 'update'
	| 'delete'
	| 'select_self'
	| 'insert_self'
	| 'update_self'
	| 'delete_self'
	| 'all';

export type Access = {
	table: string;
	permissions: AccessLevel[];
};

export type RolePermissions = {
	role_id: number;
	user_id?: string;
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
};
