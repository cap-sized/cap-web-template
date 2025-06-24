<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { deepcopy } from '$lib/common.js';
	import { renderComponent } from '$lib/tanstack/render.js';
	import type { DataSet } from '$lib/types/common.js';
	import { type PersonRaw, type PersonView, type PlayerRaw } from '$lib/types/db_persons.js';
	import type { NhlSearchPlayer } from '$lib/types/nhl_api.js';
	import BaseTable from '$lib/ui/table/base_table.svelte';
	import EditableCell from '$lib/ui/table/cells/editable_cell.svelte';
	import BasicHeader from '$lib/ui/table/headers/basic_header.svelte';
	import {
		createColumnHelper,
		type CellContext,
		type ColumnDef,
		type HeaderContext,
	} from '@tanstack/table-core';
	import { writable, type Writable } from 'svelte/store';

	let { data } = $props();
	let { tables } = $derived(data);
	let persons: DataSet<PersonRaw> = $derived(tables[0]);
	let players: DataSet<PlayerRaw> = $derived(tables[1]);
	let nhl_search_data: Writable<NhlSearchPlayer[]> = writable([]);
	let cs_persons_raw: Writable<PersonRaw[]> = $derived(writable(persons.table_data));
	let cs_players_raw: Writable<PlayerRaw[]> = $derived(writable(players.table_data));

	const person_helper = createColumnHelper<PersonRaw>();
	const player_helper = createColumnHelper<PlayerRaw>();
	const standard_header = (header_ctx: HeaderContext<any, any>) =>
		renderComponent(BasicHeader<any, any>, { header_ctx });
	function editable_person_cell(get: (p: PersonRaw) => any, set: (p: PersonRaw, val: any) => void) {
		return (cell_ctx: CellContext<PersonRaw, string>) =>
			renderComponent(EditableCell, {
				value: cell_ctx.cell.getValue(),
				orig_value: get(persons.table_data[cell_ctx.row.index]),
				oninput: (e: any) => {
					set($cs_persons_raw[cell_ctx.row.index], e.target.value);
					cs_persons_raw.set($cs_persons_raw);
				},
			});
	}

	let person_name_filter = $state('');

	async function search() {
		let response = await fetch(`/api/search/players?name=${person_name_filter}`);
		let [nhl, cspr, cspl] = (await response.json()) as [
			DataSet<NhlSearchPlayer>,
			DataSet<PersonRaw>,
			DataSet<PlayerRaw>,
		];
		if (nhl.error) {
			console.log(nhl);
		}
		if (cspr.error) {
			console.log(cspr);
		}
		nhl_search_data.set(nhl.table_data);
		persons = cspr;
		players = cspl;
		cs_persons_raw.set(cspr.table_data);
		cs_players_raw.set(cspl.table_data);
	}

	const player_columns: ColumnDef<PlayerRaw>[] = [
		player_helper.accessor('person_id', {
			header: standard_header,
		}) as ColumnDef<PlayerRaw>,
		player_helper.accessor('nhl_player_id', {
			header: standard_header,
		}) as ColumnDef<PlayerRaw>,
		player_helper.accessor('last_nhl_team_id', {
			header: standard_header,
		}) as ColumnDef<PlayerRaw>,
		player_helper.accessor('last_amateur_team_id', {
			header: standard_header,
		}) as ColumnDef<PlayerRaw>,

	];

	const person_columns: ColumnDef<PersonRaw>[] = [
		person_helper.accessor('id', {
			header: standard_header,
		}) as ColumnDef<PersonRaw>,
		person_helper.accessor('full_name', {
			header: standard_header,
			cell: editable_person_cell(
				(p) => p.full_name,
				(p, v) => (p.full_name = v)
			),
		}) as ColumnDef<PersonRaw>,
		person_helper.accessor('first_name', {
			header: standard_header,
			cell: editable_person_cell(
				(p) => p.first_name,
				(p, v) => (p.first_name = v)
			),
		}) as ColumnDef<PersonRaw>,
		person_helper.accessor('last_name', {
			header: standard_header,
			cell: editable_person_cell(
				(p) => p.last_name,
				(p, v) => (p.last_name = v)
			),
		}) as ColumnDef<PersonRaw>,
		person_helper.accessor('birth_date', {
			header: 'Birth Date (YYYY-MM-DD)',
			cell: editable_person_cell(
				(p) => p.birth_date,
				(p, v) => (p.birth_date = v)
			),
		}) as ColumnDef<PersonRaw>,
		person_helper.accessor('death_date', {
			header: 'Death Date (YYYY-MM-DD)',
			cell: editable_person_cell(
				(p) => p.birth_date,
				(p, v) => (p.birth_date = v)
			),
		}) as ColumnDef<PersonRaw>,
		person_helper.accessor('birth_city', {
			header: standard_header,
			cell: editable_person_cell(
				(p) => p.birth_date,
				(p, v) => (p.birth_city = v)
			),
		}) as ColumnDef<PersonRaw>,
		person_helper.accessor('birth_state_province', {
			header: standard_header,
			cell: editable_person_cell(
				(p) => p.birth_state_province,
				(p, v) => (p.birth_state_province = v)
			),
		}) as ColumnDef<PersonRaw>,
		person_helper.accessor('birth_country_code', {
			header: standard_header,
			cell: editable_person_cell(
				(p) => p.birth_country_code,
				(p, v) => (p.birth_country_code = v)
			),
		}) as ColumnDef<PersonRaw>,
	];
</script>

<div class="flex h-full w-full flex-col items-center justify-center text-center">
	<h1 class="text-3xl">Search to edit/add</h1>
	<div>
		<textarea
			class="rounded-sm border-[2px] border-teal-700 p-1 text-center text-teal-700"
			name="nhl_ids_persons"
			rows="4"
			cols="50"
			placeholder="Search people here, separated by commas."
			bind:value={person_name_filter}
			onkeypress={async (e) => {
				if (e.key == 'Enter') await search();
			}}
		></textarea>
	</div>
	<h1 class="text-3xl">Editing persons</h1>
	<BaseTable columns={person_columns} table_data={$cs_persons_raw} />
	<BaseTable columns={player_columns} table_data={$cs_players_raw} />

	<div class="p-2"></div>
</div>
