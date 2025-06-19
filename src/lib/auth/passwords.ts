import { hash, verify } from 'argon2';

export async function hash_password(password: string): Promise<string> {
	return await hash(password.trim());
}

export async function verify_password(password: string, password_hash: string): Promise<boolean> {
	return await verify(password_hash, password);
}
