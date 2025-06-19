import { z } from 'zod';

export const schema_user_login = z.object({
	username: z.string().min(2, {
		message: 'Username too short',
	}),
	password: z.string().min(8, {
		message: 'Password too short',
	}),
});

export const schema_user_register = z.object({
	username: z.string().min(2, {
		message: 'Username too short',
	}),
	password: z.string().min(8, {
		message: 'Password too short',
	}),
	email: z.string().email(),
	avatar_url: z.string().url('not a valid link').optional(),
});
