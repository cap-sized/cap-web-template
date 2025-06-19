export type User = {
	id: string;
	google_id?: string;
	discord_id?: string;
	email: string;
	role_id: Role;
	username: string;
	avatar_url: string;
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
	admin = 2,
	superadmin = 3,
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
