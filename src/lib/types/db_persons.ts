import type { DateString, Raw } from './db';

export interface PersonRaw extends Raw {
	id: number; // PRIMARY
	full_name: string;
	first_name: string;
	last_name: string;
	birth_date?: string;
	death_date?: string;
	slug: string;
	birth_city?: string;
	birth_state_province?: string;
	birth_country_code?: string;
}

export interface PlayerRaw extends Raw {
	person_id: number; // PRIMARY
	nhl_player_id: number;
	height_cm: number;
	weight_kg: number;
	shoots_catches_left?: boolean;
	last_amateur_team_id?: number;
	last_nhl_team_id?: number;
	agent_person_ids: Array<number>;
}

export interface Nationality extends Raw {
	person_id: number; // PRIMARY
	country_code_alpha3: string; // PRIMARY
	is_primary: boolean;
}

export type BasicPlayerView = {
	person_id: number; // PRIMARY

	/* Player fields */
	nhl_player_id?: number;
	shoots_catches_left?: boolean;
	last_nhl_team_id?: number;

	/* Person fields */
	full_name: string;
	first_name?: string;
	last_name?: string;
	birth_date?: string;
	death_date?: string;
	slug: string;
};

export type PersonView = {
	id: number; // PRIMARY
	full_name: string;
	first_name: string;
	last_name: string;
	birth_date: string;
	death_date: string;
	slug: string;
	birth_city: string;
	birth_state_province: string;
	birth_country_code: string;
	nhl_player_id?: number;
	nhl_staff_id?: number;
	nhl_agent_id?: number;
	is_nhl_player: boolean;

	created_by_user: string;
	created_at: DateString;
	updated_by_user: string;
	updated_at: DateString;
};

export type FullPlayerView = {
	person_id: number; // PRIMARY

	/* Player fields */
	nhl_player_id?: number;
	height_cm?: number;
	weight_kg?: number;
	shoots_catches_left?: boolean;
	last_amateur_team_id?: number;
	last_nhl_team_id?: number;
	agent_person_ids?: Array<number>;
	created_by_user: string;
	created_at: DateString;
	updated_by_user: string;
	updated_at?: DateString;

	/* Person fields */
	full_name: string;
	first_name?: string;
	last_name?: string;
	birth_date?: string;
	death_date?: string;
	slug: string;
	birth_city?: string;
	birth_state_province?: string;
	birth_country_code?: string;

	/* Nationality fields */
	country_codes: string[];
	is_primary_country: boolean[];
	/* Contract value fields: TBC. Linked to contracts */
	/* Free agency fields: TBC. Linked to player_statuses */
	/* Playing history fields: TBC. Linked to rosters */
};
