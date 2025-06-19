import { SessionCookieController } from '$lib/auth/cookie';
import { verify_password } from '$lib/auth/passwords';
import { create_session, sanitize_query } from '$lib/auth/session';
import { SESSION_TIMEOUT_SPAN } from '$lib/common';
import { DB_DATABASES, DB_TABLES, clickhouse_client } from '$lib/db/clickhouse';
import { schema_user_login } from '$lib/form_schemas/users';
import { Logger } from '$lib/logger';
import { Role, type User } from '$lib/types/users';
import type { ResponseJSON } from '@clickhouse/client-web';
import type { Actions } from '@sveltejs/kit';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async () => {
	const form = await superValidate(zod(schema_user_login));
	form.errors = {};
	return { form };
};

export const actions: Actions = {
	default: async ({ request, url, cookies }) => {
		const logger = new Logger(url.pathname);
		const form = await superValidate(request, zod(schema_user_login));
		if (!form.valid) {
			return fail(400, { form });
		}
		const { username, password } = form.data;
		const ch = clickhouse_client(Role.anon);
		const query = sanitize_query(
			`SELECT * FROM ${DB_DATABASES['default']}.${DB_TABLES['users']} where (username = '${username}' or email = '${username}')`
		);

		const response = await ch.query({ query });
		let { data } = (await response.json<User>()) as ResponseJSON<User>;
		if (data.length > 1) {
			logger.warning(`Multiple users for ${username} found:`, data);
		} else if (data.length == 0) {
			form.errors.username = ['Please enter a valid username (or email)'];
			return fail(400, { form });
		}

		const user = data[0];
		if (!(await verify_password(password, user.password_hash ?? ''))) {
			form.errors.password = ['Invalid password'];
			return fail(400, { form });
		}
		const client = clickhouse_client(user.role_id);
		const timespan = SESSION_TIMEOUT_SPAN;
		const session = await create_session(client, user, timespan, DB_TABLES['sessions']);
		const cookie = new SessionCookieController(timespan).create_cookie(session.token ?? '');
		cookies.set(cookie.name, cookie.value, {
			path: '.',
			...cookie.attributes,
		});

		return message(form, `Login successful (role level: ${user.role_id})`);
	},
};
