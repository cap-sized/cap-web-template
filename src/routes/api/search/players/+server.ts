import { NHL_SEARCH_URL, nhl_to_person_id } from '$lib/common.js';
import { nhl_to_cs_persons } from '$lib/conversions/nhl_players.js';
import { clickhouse_client } from '$lib/db/clickhouse.js';
import { Logger } from '$lib/logger.js';
import {
	sql_select_person_raw,
	sql_select_person_view,
	sql_select_player_raw,
} from '$lib/query/sql/persons';
import { default_page_size } from '$lib/query/url/build.js';
import { parse_order_params, parse_pagination_params } from '$lib/query/url/parse';
import type { PersonRaw, PersonView, PlayerRaw } from '$lib/types/db_persons';
import type { NhlSearchPlayer } from '$lib/types/nhl_api.js';
import { Role } from '$lib/types/users.js';
import type { ResponseJSON } from '@clickhouse/client-web';
import { json } from '@sveltejs/kit';

export async function GET({ locals: { user }, url, fetch }) {
	const logger = new Logger(url.pathname);
	const names = (url.searchParams.get('name') ?? '').split(',');
	const nhl_names = names.map((x) => x.trim()).join('|');

	if (nhl_names.length < 3) {
		return json([
			{
				table_data: [],
				type_name: 'nhl_player_search',
				message: 'please input at least 3 characters.',
				error: 'bad search',
			},
			{
				table_data: [],
				type_name: 'person_view',
				message: 'please input at least 3 characters.',
				error: 'bad search',
			},
		]);
	}

	let client = clickhouse_client(Role.anon);
	let paginate = parse_pagination_params(default_page_size(url, 20));
	let order = parse_order_params(url);

	let search_url = NHL_SEARCH_URL;
	search_url.searchParams.set('limit', paginate.perpage.toString());
	search_url.searchParams.set('q', nhl_names);

	logger.debug(search_url);
	const nhl_response = await fetch(search_url);
	const nhl_search_players = (await nhl_response.json()) as NhlSearchPlayer[];
	const nhl_player_ids = nhl_search_players
		.map((x) => parseInt(x.playerId))
		.filter((x) => !isNaN(x));
	const person_ids = nhl_player_ids.map(nhl_to_person_id);

	let persons_query = sql_select_person_raw(paginate, order, person_ids, nhl_names);
	logger.debug(persons_query);

	const persons_resp = await client.query({ query: persons_query });
	const { data: cs_persons } = (await persons_resp.json<PersonRaw>()) as ResponseJSON<PersonRaw>;
	let players_query = sql_select_player_raw(paginate, order, person_ids, nhl_player_ids);
	logger.debug(players_query);

	const players_resp = await client.query({ query: players_query });
	const { data: cs_players } = (await players_resp.json<PlayerRaw>()) as ResponseJSON<PlayerRaw>;

	return json([
		{
			table_data: nhl_search_players,
			type_name: 'nhl_player_search',
			message: nhl_names,
		},
		{
			table_data: cs_persons,
			type_name: 'person_view',
			message: nhl_names,
		},
		{
			table_data: cs_players,
			type_name: 'player_view',
			message: nhl_names,
		},
	]);
}
