<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { renderComponent } from '$lib/tanstack/render.js';
	import { type PersonView } from '$lib/types/db_persons.js';
	import BasicButton from '$lib/ui/button/basic_button.svelte';
	import BaseTable from '$lib/ui/table/base_table.svelte';
	import LinkCell from '$lib/ui/table/cells/link_cell.svelte';
	import BasicHeader from '$lib/ui/table/headers/basic_header.svelte';
	import {
		createColumnHelper,
		type CellContext,
		type ColumnDef,
		type ColumnHelper,
		type HeaderContext,
	} from '@tanstack/table-core';
	import { writable, type Writable } from 'svelte/store';

	let { data } = $props();
	let { table_data } = $derived(data);

	const helper = createColumnHelper<PersonView>();
	const standard_header = (header_ctx: HeaderContext<PersonView, string>) =>
		renderComponent(BasicHeader<PersonView>, { header_ctx });
	const cell_slug =
		(prefix: string) =>
		(cell_ctx: CellContext<PersonView, { slug: string; has_slug: boolean }>) => {
			let { has_slug: is_nhl_player, slug } = cell_ctx.cell.getValue();
			if (!is_nhl_player) return '';
			return renderComponent(LinkCell, { href: `${prefix}${slug}` });
		};

	let person_name_filter = $state('');

	async function search() {
		// console.log(person_name_filter)
		page.url.searchParams.set('full_name', person_name_filter);
		await goto(page.url, {
			invalidateAll: true,
		});
	}

	const columns: ColumnDef<PersonView>[] = [
		helper.accessor('full_name', {
			header: standard_header,
		}) as ColumnDef<PersonView>,
		helper.accessor('first_name', {
			header: standard_header,
		}) as ColumnDef<PersonView>,
		helper.accessor('last_name', {
			header: standard_header,
		}) as ColumnDef<PersonView>,
		helper.accessor('birth_date', {
			header: standard_header,
		}) as ColumnDef<PersonView>,
		helper.accessor('death_date', {
			header: standard_header,
		}) as ColumnDef<PersonView>,
		helper.accessor('birth_city', {
			header: standard_header,
		}) as ColumnDef<PersonView>,
		helper.accessor('birth_state_province', {
			header: standard_header,
		}) as ColumnDef<PersonView>,
		helper.accessor('birth_country_code', {
			header: standard_header,
		}) as ColumnDef<PersonView>,
		helper.accessor(({ is_nhl_player, slug }) => ({ has_slug: is_nhl_player, slug }), {
			header: 'Player URL',
			cell: cell_slug('/players/'),
		}) as ColumnDef<PersonView>,
		helper.accessor(({ nhl_staff_id, slug }) => ({ has_slug: Boolean(nhl_staff_id), slug }), {
			header: 'Staff URL',
			cell: cell_slug('/staff/'),
		}) as ColumnDef<PersonView>,
		helper.accessor(({ nhl_agent_id, slug }) => ({ has_slug: Boolean(nhl_agent_id), slug }), {
			header: 'Agent URL',
			cell: cell_slug('/agent/'),
		}) as ColumnDef<PersonView>,
	];
</script>

<div class="flex h-full w-full flex-col items-center justify-center text-center">
	<h1 class="text-3xl">Persons</h1>
	<div>
		<input
			class="w-[300px] border-2 border-teal-600 bg-teal-50 p-2"
			type="text"
			placeholder="full name"
			bind:value={person_name_filter}
			onkeypress={(e) => {
				if (e.key == 'Enter') search();
			}}
		/>
		<BasicButton action={search}>Search</BasicButton>
	</div>
	<BaseTable {columns} {table_data} />

	<div class="p-2"></div>
</div>
