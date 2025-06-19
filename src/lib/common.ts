import secureRandom from 'secure-random';
import { TimeSpan } from './datetime';

export const SESSION_ID_LENGTH: number = 10;
export const SESSION_SECRET_LENGTH: number = 16;
export const SESSION_TIMEOUT_SPAN = new TimeSpan(2, 'w');
export const SESSION_REFRESH_WINDOW = new TimeSpan(1, 'd');
export const SESSION_COOKIE_NAME: string = 'capsized-session';

export const alphabet: string = 'abcdefghijklmnopqrstuvwxyz123456789';

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
