import type { PaginationParams, OrderParams } from '$lib/types/common';
import { sql_select_paginated } from './tools';

/*
CREATE OR REPLACE VIEW csdb.v_players AS SELECT 
    person_id, nhl_player_id, shoots_catches_left, last_nhl_team_id, 
    full_name, first_name, last_name, birth_date, death_date, slug
FROM csdb.players AS pl LEFT JOIN csdb.persons AS pr ON pl.person_id = pr.id
*/
export function sql_select_basic_player_view(
	paginate: PaginationParams,
	order: OrderParams,
	where: string = '',
	columns: string[] = ['*']
): string {
	return sql_select_paginated('v_players', paginate, order, where, columns);
}

/* TODO: Refine this and FullPlayerView
CREATE OR REPLACE VIEW csdb.v_players_full AS SELECT * FROM csdb.players AS pl 
LEFT JOIN csdb.persons AS pr ON pl.person_id = pr.id
LEFT JOIN csdb.v_players_nations AS pn ON pn.person_id = pr.id
*/
export function sql_select_full_player_view(
	paginate: PaginationParams,
	order: OrderParams,
	where: string = '',
	columns: string[] = ['*']
): string {
	return sql_select_paginated('v_players_full', paginate, order, where, columns);
}

/*
CREATE OR REPLACE VIEW csdb.v_persons_full AS SELECT * EXCEPT (person_id) FROM csdb.persons AS pr 
LEFT JOIN (SELECT person_id, nhl_player_id, true as is_nhl_player FROM csdb.players) AS pl ON pl.person_id = pr.id 
LEFT JOIN (SELECT person_id, nhl_staff_id FROM csdb.staff) AS st ON st.person_id = pr.id 
LEFT JOIN (SELECT person_id, nhl_agent_id FROM csdb.agents) AS ag ON ag.person_id = pr.id
*/
export function sql_select_person_view(
	paginate: PaginationParams,
	order: OrderParams,
	where: string = '',
	columns: string[] = ['*']
): string {
	return sql_select_paginated('v_persons_full', paginate, order, where, columns);
}

/*
Select full player for editing.
*/
export function sql_select_player_raw(
	person_ids: number[],
	paginate: PaginationParams,
	order: OrderParams
): string {
	return sql_select_paginated('players', paginate, order, `WHERE person_id IS IN ${person_ids}`);
}

/*
Select full person for editing.
*/
export function sql_select_person_raw(
	person_ids: number[],
	paginate: PaginationParams,
	order: OrderParams,
	where: string = ''
): string {
	return sql_select_paginated('persons', paginate, order, `WHERE person_id IS IN ${person_ids}`);
}
