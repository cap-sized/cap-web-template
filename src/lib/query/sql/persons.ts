import type { PaginationParams, OrderParams } from '$lib/types/common';
import { sql_select_paginated } from './tools';

/*
CREATE OR REPLACE VIEW csdb.v_players AS SELECT 
    person_id, nhl_player_id, shoots_catches_left, last_nhl_team_id, 
    full_name, first_name, last_name, birth_date, death_date, slug
FROM csdb.players AS pl FINAL LEFT JOIN csdb.persons FINAL AS pr ON pl.person_id = pr.id
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
LEFT JOIN csdb.persons FINAL AS pr ON pl.person_id = pr.id
LEFT JOIN csdb.v_players_nations FINAL AS pn ON pn.person_id = pr.id
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
CREATE OR REPLACE VIEW csdb.v_persons_full AS SELECT * EXCEPT (person_id, user_id, created_by, updated_by) FROM csdb.persons AS pr FINAL
LEFT JOIN (SELECT person_id, nhl_player_id, true as is_nhl_player FROM csdb.players FINAL) AS pl ON pl.person_id = pr.id 
LEFT JOIN (SELECT person_id, nhl_staff_id FROM csdb.staff FINAL) AS st ON st.person_id = pr.id 
LEFT JOIN (SELECT person_id, nhl_agent_id FROM csdb.agents FINAL) AS ag ON ag.person_id = pr.id
LEFT JOIN (SELECT id as user_id, COALESCE(username, email) as created_by_user FROM csdb.users FINAL) AS usc ON usc.user_id = created_by
LEFT JOIN (SELECT id as user_id, COALESCE(username, email) as updated_by_user FROM csdb.users FINAL) AS usu ON usu.user_id = updated_by
*/
export function sql_select_person_view(
	paginate: PaginationParams,
	order: OrderParams,
	full_name_filter: string = '',
	base_columns: string[] = ['*']
): string {
	let where = full_name_filter ? `match > 0` : '';
	let columns = full_name_filter
		? [...base_columns, `match(full_name, '(?i)${full_name_filter}') AS match`]
		: base_columns;
	return sql_select_paginated('v_persons_full', paginate, order, where, columns);
}

/*
Select full player for editing.
*/
export function sql_select_player_raw(
	paginate: PaginationParams,
	order: OrderParams,
	person_ids: number[] = [],
	nhl_player_ids: number[] = []
): string {
	const where_person_ids = person_ids.length ? `person_id IN [${person_ids}]` : '';
	const where_player_ids = person_ids.length ? `nhl_player_id IN [${nhl_player_ids}]` : '';
	const where = [where_person_ids, where_player_ids].filter((x) => x.length > 0).join(' OR ');
	return sql_select_paginated('players', paginate, order, where);
}

/*
Select full person for editing.
*/
export function sql_select_person_raw(
	paginate: PaginationParams,
	order: OrderParams,
	person_ids: number[] = [],
	full_name_filter: string = ''
): string {
	const where_ids = person_ids.length ? `id IN [${person_ids}]` : '';
	let where_name = full_name_filter ? `match > 0` : '';
	let columns = full_name_filter
		? ['*', `match(full_name, '(?i)${full_name_filter}') AS match`]
		: ['*'];
	const where = [where_ids, where_name].filter((x) => x.length > 0).join(' OR ');
	return sql_select_paginated('persons', paginate, order, where, columns);
}
