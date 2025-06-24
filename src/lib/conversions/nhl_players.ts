import { nhl_to_person_id } from '$lib/common';
import { get_current_iso_date_time } from '$lib/datetime';
import type { PersonRaw, PlayerRaw } from '$lib/types/db_persons';
import type { NhlSearchPlayer } from '$lib/types/nhl_api';

export function nhl_to_cs_persons(nhl: NhlSearchPlayer[], cs_persons: PersonRaw[]): PersonRaw[] {
	const cs_persons_set = new Set<number>(cs_persons.map((p) => p.id));
	const nhl_to_persons: PersonRaw[] = nhl
		.map((p) => ({
			id: nhl_to_person_id(parseInt(p.playerId)),
			full_name: p.name,
			first_name: p.name.split(' ')[0],
			last_name: p.name.split(' ').slice(1).join(' '),
			birth_date: undefined,
			death_date: undefined,
			slug: p.name.toLocaleLowerCase().replaceAll(' ', '-'), // temporary
			birth_city: p.birthCity,
			birth_state_province: p.birthStateProvince ?? undefined,
			birth_country_code: p.birthCountry,
			created_at: get_current_iso_date_time(),
			created_by: '',
			updated_at: get_current_iso_date_time(),
			updated_by: '',
		}))
		.filter((p) => !isNaN(p.id) && cs_persons_set.has(p.id));

	const final_persons_list = [...nhl_to_persons, ...cs_persons];
	return final_persons_list;
}

export function nhl_to_cs_players(nhl: NhlSearchPlayer[], cs_players: PlayerRaw[]): PlayerRaw[] {
	const cs_players_set = new Set<number>(cs_players.map((p) => p.nhl_player_id));
	const nhl_to_players: PlayerRaw[] = nhl
		.map((p) => ({
			person_id: nhl_to_person_id(parseInt(p.playerId)),
			nhl_player_id: parseInt(p.playerId),
			height_cm: p.heightInCentimeters,
			weight_kg: p.weightInKilograms,
			shoots_catches_left: undefined,
			last_amateur_team_id: 0,
			last_nhl_team_id: isNaN(parseInt(p.lastTeamId)) ? 0 : parseInt(p.lastTeamId),
			agent_person_ids: [],
			created_at: get_current_iso_date_time(),
			created_by: '',
			updated_at: get_current_iso_date_time(),
			updated_by: '',
		}))
		.filter((p) => !isNaN(p.nhl_player_id) && cs_players_set.has(p.nhl_player_id));

	const final_persons_list = [...nhl_to_players, ...cs_players];
	return final_persons_list;
}
