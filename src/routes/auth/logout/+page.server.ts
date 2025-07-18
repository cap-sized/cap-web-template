import { SessionCookieController } from '$lib/auth/cookie.js';
import { delete_session } from '$lib/auth/db.js';
import { invalidate_session, session_token_to_hashed_secret } from '$lib/auth/session.js';
import { TimeSpan } from '$lib/datetime.js';
import { clickhouse_client } from '$lib/db/clickhouse.js';
import { Logger } from '$lib/logger.js';
import { Role } from '$lib/types/users.js';

export const load = async ({ locals: { user, session }, url, cookies }) => {
	const hashed_secret = await session_token_to_hashed_secret(session?.token ?? '');
	if (!hashed_secret) {
		return {
			message: "You're already logged out.",
		};
	}

	try {
		await delete_session(clickhouse_client(user?.role_id ?? Role.anon), hashed_secret);
	} catch (e) {
		new Logger(url.pathname).warning('failed to properly delete session: simply clearing cookies');
	} finally {
		invalidate_session(cookies);

		return {
			message: 'Bye!',
		};
	}
};
