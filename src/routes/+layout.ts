import { session_store, user_store } from './stores';

export const load = async ({ data, depends }) => {
    /**
     * Declare a dependency so the layout can be invalidated, for example, on
     * session refresh.
     */
    depends('auth:session')
    depends('auth:logout')
    const { user, session, ...layout_data } = data;
    user_store.set(user);
    session_store.set(session);
    return layout_data;
}