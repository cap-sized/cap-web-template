import { invalidate_session } from '$lib/auth/session';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { user, session }, cookies }) => {
	if (!user?.id || !user?.username || !user?.email) {
		invalidate_session(cookies);
		return { user: null, session: null };
	}
	return { user, session };
};
