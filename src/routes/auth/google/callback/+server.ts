import { OAuth2RequestError } from 'arctic';
import { google } from '$lib/auth/oauth';
import { Logger } from '$lib/logger';
import type { RequestEvent } from '../$types';
import { DB_TABLES, clickhouse_client } from '$lib/db/clickhouse';
import { Role, type Session, type User } from '$lib/types/users';
import { select_users_by_username, upsert_user } from '$lib/auth/db';
import { SESSION_TIMEOUT_SPAN, rng_str } from '$lib/common';
import { create_session } from '$lib/auth/session';
import { SessionCookieController } from '$lib/auth/cookie';

export async function GET({ url, cookies }: RequestEvent): Promise<Response> {
	const logger = new Logger(url.pathname);
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('google_oauth_state') ?? null;
	const codeVerifier = cookies.get('google_oauth_code_verifier') ?? '';

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400,
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
		const google_user_response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`,
			},
		});
		const google_user: GoogleUser = await google_user_response.json();

		const { sub, email, name, picture } = google_user;
		const anon_client = clickhouse_client(Role.anon);

		const data: User[] = await select_users_by_username(anon_client, email);

		if (data.length > 1) {
			logger.warning(`Multiple users for ${email} found:`, data);
		}

		let user = data.length == 0 ? null : data[0];

		if (!user) {
			user = {
				id: rng_str(10),
				google_id: sub,
				email: email,
				role_id: Role.authenticated,
				username: name,
				avatar_url: picture,
			};
			upsert_user(anon_client, user);
		} else if (user && !user.google_id) {
			user = {
				...user,
				google_id: sub,
			};
			upsert_user(anon_client, user);
		}

		const timespan = SESSION_TIMEOUT_SPAN;
		const auth_client = clickhouse_client(Role.authenticated);
		const session = await create_session(auth_client, user, timespan, DB_TABLES['sessions']);
		const cookie = new SessionCookieController(timespan).create_cookie(session.token ?? '');
		cookies.set(cookie.name, cookie.value, {
			path: '/',
			...cookie.attributes,
		});
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	} catch (e) {
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			logger.error(e.name, e);
			// invalid code
			return new Response(null, {
				status: 400,
				statusText: 'Invalid login attempt',
			});
		}
		logger.error(JSON.stringify(e));
		return new Response(null, {
			status: 500,
		});
	}
}

interface GoogleUser {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	email: string;
	email_verified: boolean;
}
