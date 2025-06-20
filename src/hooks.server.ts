import { Cookie, SessionCookieController } from '$lib/auth/cookie';
import { create_session, validate_session } from '$lib/auth/session';
import { SESSION_COOKIE_NAME, SESSION_TIMEOUT_SPAN } from '$lib/common';
import { TimeSpan } from '$lib/datetime';
import { DB_TABLES, clickhouse_client } from '$lib/db/clickhouse';
import { Role } from '$lib/types/users';

import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session_id = event.cookies.get(SESSION_COOKIE_NAME);
	if (!session_id || !session_id.length) {
		event.locals.user = null;
		event.locals.user = null;
		return resolve(event);
	}

	const { user, session, must_refresh } = await validate_session(session_id);

	let renewed_cookie: Cookie | null = null;

	if (user && user?.role_id != Role.anon && must_refresh) {
		const session = await create_session(
			clickhouse_client(user.role_id),
			user,
			SESSION_TIMEOUT_SPAN,
			DB_TABLES['sessions']
		);
		renewed_cookie = new SessionCookieController(SESSION_TIMEOUT_SPAN).create_cookie(
			session?.token ?? ''
		);
	}

	if (!session) {
		renewed_cookie = new SessionCookieController(new TimeSpan(1, 'd')).create_blank_cookie();
	}

	if (renewed_cookie) {
		event.cookies.set(renewed_cookie.name, renewed_cookie.value, {
			path: '/',
			...renewed_cookie.attributes,
		});
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
