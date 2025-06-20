import { SessionCookieController } from '$lib/auth/cookie';
import { select_users_by_username, upsert_user } from '$lib/auth/db';
import { hash_password, verify_password } from '$lib/auth/passwords';
import { create_session } from '$lib/auth/session';
import { SESSION_TIMEOUT_SPAN, USER_ID_LENGTH, rng_str } from '$lib/common';
import { DB_DATABASES, DB_TABLES, clickhouse_client } from '$lib/db/clickhouse';
import { schema_user_login, schema_user_register } from '$lib/form_schemas/users';
import { Logger } from '$lib/logger';
import { Role, type User } from '$lib/types/users';
import { error, type Actions } from '@sveltejs/kit';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async () => {
	const form = await superValidate(zod(schema_user_register));
	form.errors = {};
	return { form };
};

export const actions: Actions = {
	default: async ({ request, url, cookies }) => {
		const logger = new Logger(url.pathname);
		const form = await superValidate(request, zod(schema_user_register));
		if (!form.valid) {
			return fail(400, { form });
		}
		const { username, email, password } = form.data;
		const anon_client = clickhouse_client(Role.anon);

		try {
			const clash_email: User[] = await select_users_by_username(anon_client, email);
			if (clash_email.length >= 1) {
				const account_type = clash_email[0].google_id
					? 'google'
					: clash_email[0].discord_id
						? 'discord'
						: 'email';
				form.errors.email = [
					`This email already has an account (registered via ${account_type}). Please login instead`,
				];
				return fail(400, { form });
			}

			const clash_username: User[] = await select_users_by_username(anon_client, username);
			if (clash_username.length >= 1) {
				form.errors.username = ['This username is already taken. Please choose another'];
				return fail(400, { form });
			}

			const password_hash = await hash_password(password);

			let id = rng_str(USER_ID_LENGTH);

			const user: User = {
				id,
				email,
				role_id: Role.authenticated,
				username,
				password_hash,
			};

			const auth_client = clickhouse_client(user.role_id);
			const { ok, summary } = await upsert_user(auth_client, user);
			if (!ok) {
				logger.error('failed to create user', summary);
				return message(
					form,
					`Server is currently having issues, failed to create user. Please try again later.`
				);
			}

			const timespan = SESSION_TIMEOUT_SPAN;
			const session = await create_session(auth_client, user, timespan, DB_TABLES['sessions']);
			const cookie = new SessionCookieController(timespan).create_cookie(session.token ?? '');
			cookies.set(cookie.name, cookie.value, {
				path: '/',
				...cookie.attributes,
			});

			return message(form, `User created (role level: ${user.role_id})`);
		} catch (e) {
			logger.error(e);
			return error(500, `Failed to login as ${username}, please try again later`);
		}
	},
};
