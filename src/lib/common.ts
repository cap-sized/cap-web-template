import secureRandom from 'secure-random';
import { TimeSpan } from './datetime';

export const SESSION_ID_LENGTH: number = 10;
export const SESSION_SECRET_LENGTH: number = 16;
export const SESSION_TIMEOUT_SPAN = new TimeSpan(2, 'w');
export const SESSION_REFRESH_WINDOW = new TimeSpan(1, 'd');
export const SESSION_COOKIE_NAME: string = 'capsized-session';
export const USER_ID_LENGTH: number = 16;
export const DEFAULT_PAGE_START: number = 0;
export const DEFAULT_PAGE_SIZE: number = 50;

export const alphabet: string = 'abcdefghijklmnopqrstuvwxyz123456789';

export const NHL_SEARCH_URL = new URL(
	'https://search.d3.nhle.com/api/v1/search/player?culture=en-us&'
);

export function rng_str(len: number): string {
	const alphabet_count = alphabet.length;
	let id = '';
	const bytes = secureRandom(len, { type: 'Uint8Array' });
	for (let i = 0; i < len; i++) {
		id += alphabet[bytes[i] % alphabet_count];
	}
	return id;
}

export function get_superform_options(): any {
	return {
		dataType: 'json',
		delayMs: 100,
		timeoutMs: 8000,
	};
}

export function unauthorized_msg(username?: string | null): string {
	return `${username ?? 'Hey'}, you are not authorized to see this page, please login as an administrator`;
}

export function deepcopy<T>(array: T[]): T[] {
	return JSON.parse(JSON.stringify(array));
}

export function nhl_to_person_id(nhl_player_id: number): number {
	return nhl_player_id + 100000000;
}
