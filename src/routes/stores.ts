import type { Session, User } from '$lib/types/users';
import { writable, type Writable } from 'svelte/store';

export const user_store: Writable<User | null> = writable(null);
export const session_store: Writable<Session | null> = writable(null);
