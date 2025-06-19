/** Borrowed from lucia-v3. */
import { SESSION_COOKIE_NAME } from '$lib/common';
import type { TimeSpan } from '$lib/datetime';
import type { Session } from '$lib/types/users';

export interface CookieAttributes {
	secure?: boolean;
	path?: string;
	domain?: string;
	sameSite?: 'lax' | 'strict' | 'none';
	httpOnly?: boolean;
	maxAge?: number;
	expires?: Date;
}

export function serialize_cookie(
	name: string,
	value: string,
	attributes: CookieAttributes
): string {
	const key_value_entries: Array<[string, string] | [string]> = [];
	key_value_entries.push([encodeURIComponent(name), encodeURIComponent(value)]);
	if (attributes?.domain !== undefined) {
		key_value_entries.push(['Domain', attributes.domain]);
	}
	if (attributes?.expires !== undefined) {
		key_value_entries.push(['Expires', attributes.expires.toUTCString()]);
	}
	if (attributes?.httpOnly) {
		key_value_entries.push(['HttpOnly']);
	}
	if (attributes?.maxAge !== undefined) {
		key_value_entries.push(['Max-Age', attributes.maxAge.toString()]);
	}
	if (attributes?.path !== undefined) {
		key_value_entries.push(['Path', attributes.path]);
	}
	if (attributes?.sameSite === 'lax') {
		key_value_entries.push(['SameSite', 'Lax']);
	}
	if (attributes?.sameSite === 'none') {
		key_value_entries.push(['SameSite', 'None']);
	}
	if (attributes?.sameSite === 'strict') {
		key_value_entries.push(['SameSite', 'Strict']);
	}
	if (attributes?.secure) {
		key_value_entries.push(['Secure']);
	}
	return key_value_entries.map((pair) => pair.join('=')).join('; ');
}

export function parse_cookies(header: string): Map<string, string> {
	const cookies = new Map<string, string>();
	const items = header.split('; ');
	for (const item of items) {
		const pair = item.split('=');
		const raw_key = pair[0];
		const raw_value = pair[1] ?? '';
		if (!raw_key) continue;
		cookies.set(decodeURIComponent(raw_key), decodeURIComponent(raw_value));
	}
	return cookies;
}

export class CookieController {
	constructor(
		cookie_name: string,
		base_cookie_attributes: CookieAttributes,
		cookie_options?: {
			expires_in?: TimeSpan;
		}
	) {
		this.cookie_name = cookie_name;
		this.cookie_expires_in = cookie_options?.expires_in ?? null;
		this.base_cookie_attributes = base_cookie_attributes;
	}

	public cookie_name: string;

	private cookie_expires_in: TimeSpan | null;
	private base_cookie_attributes: CookieAttributes;

	public create_cookie(value: string): Cookie {
		return new Cookie(this.cookie_name, value, {
			...this.base_cookie_attributes,
			maxAge: this.cookie_expires_in?.seconds(),
		});
	}

	public create_blank_cookie(): Cookie {
		return new Cookie(this.cookie_name, '', {
			...this.base_cookie_attributes,
			maxAge: 0,
		});
	}

	public parse(header: string): string | null {
		const cookies = parse_cookies(header);
		return cookies.get(this.cookie_name) ?? null;
	}
}

export class SessionCookieController extends CookieController {
	constructor(expires_in?: TimeSpan) {
		super(
			SESSION_COOKIE_NAME,
			{
				secure: true,
				path: '/',
				sameSite: 'lax',
				maxAge: 10,
			},
			{ expires_in }
		);
	}
	public session_cookie(token: string): Cookie {
		return this.create_cookie(token);
	}
}

export class Cookie {
	constructor(name: string, value: string, attributes: CookieAttributes) {
		this.name = name;
		this.value = value;
		this.attributes = attributes;
	}

	public name: string;
	public value: string;
	public attributes: CookieAttributes;

	public serialize(): string {
		return serialize_cookie(this.name, this.value, this.attributes);
	}
}
