import { dev } from '$app/environment';
import { Discord, Google } from 'arctic';
import {
	DEV_HOME,
	PROD_HOME,
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
} from '$env/static/private';

export const discord = new Discord(
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	`${dev ? DEV_HOME : PROD_HOME}/login/discord/callback`
);
export const google = new Google(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	`${dev ? DEV_HOME : PROD_HOME}/login/google/callback`
);
