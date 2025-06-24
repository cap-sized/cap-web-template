import { Role, type DatabaseUser } from '$lib/types/users';
import {
	CH_PUBLIC_USER,
	CH_ADMIN_USER,
	CH_ADMIN_PASSWORD,
	CH_SUPERADMIN_USER,
	CH_SUPERADMIN_PASSWORD,
	CH_AUTH_USER,
	CH_AUTH_PASSWORD,
	CH_DATABASE,
} from '$env/static/private';
import { createClient, type ClickHouseClient } from '@clickhouse/client-web';

export const DB_DATABASES: { [n: string]: string } = {
	default: CH_DATABASE,
};

export const DB_TABLES: { [n: string]: string } = {
	users: 'users',
	sessions: 'sessions',
	role_permissions: 'role_permissions',
};

type DbUserMap = { [n: string]: DatabaseUser };
const DEFAULT_DB_USERS: DbUserMap = {
	0: {
		username: CH_PUBLIC_USER,
		role: Role.anon,
	},
	1: {
		username: CH_AUTH_USER,
		password: CH_AUTH_PASSWORD,
		role: Role.authenticated,
	},
	14: {
		username: CH_ADMIN_USER,
		password: CH_ADMIN_PASSWORD,
		role: Role.admin,
	},
	15: {
		username: CH_SUPERADMIN_USER,
		password: CH_SUPERADMIN_PASSWORD,
		role: Role.superadmin,
	},
};

export function clickhouse_client(role_id: number): ClickHouseClient {
	let dbuser = DEFAULT_DB_USERS[role_id];
	return createClient({
		username: dbuser?.username,
		password: dbuser?.password,
		database: DB_DATABASES['default'],
	});
}
