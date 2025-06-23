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
	columns: string[] = ['*']
): string {
	return sql_select_paginated('v_players', paginate, order, columns);
}

/* TODO: Refine this and FullPlayerView
CREATE OR REPLACE VIEW csdb.v_players_full AS SELECT * FROM csdb.players AS pl 
LEFT JOIN csdb.persons AS pr ON pl.person_id = pr.id
LEFT JOIN csdb.v_players_nations AS pn ON pn.person_id = pr.id
*/
export function sql_select_full_player_view(
	paginate: PaginationParams,
	order: OrderParams,
	columns: string[] = ['*']
): string {
	return sql_select_paginated('v_players_full', paginate, order, columns);
}

/*
Select full player for editing.
*/
export function sql_select_player_raw(
	person_ids: number[],
	paginate: PaginationParams,
	order: OrderParams
): string {
	const base_query = sql_select_paginated('players', paginate, order);
	const with_where = `${base_query} WHERE person_id IS IN ${person_ids}`;
	return with_where;
}

/*
Select full person for editing.
*/
export function sql_select_person_raw(
	person_ids: number[],
	paginate: PaginationParams,
	order: OrderParams
): string {
	const base_query = sql_select_paginated('persons', paginate, order);
	const with_where = `${base_query} WHERE id IS IN ${person_ids}`;
	return with_where;
}
