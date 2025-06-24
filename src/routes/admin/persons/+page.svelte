<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { renderComponent } from '$lib/tanstack/render.js';
	import type { DataSet } from '$lib/types/common.js';
	import { type PersonView } from '$lib/types/db_persons.js';
	import BasicButton from '$lib/ui/button/basic_button.svelte';
	import BaseTable from '$lib/ui/table/base_table.svelte';
	import DateCell from '$lib/ui/table/cells/date_cell.svelte';
	import LinkCell from '$lib/ui/table/cells/link_cell.svelte';
	import BasicHeader from '$lib/ui/table/headers/basic_header.svelte';
	import {
		createColumnHelper,
		type CellContext,
		type ColumnDef,
		type HeaderContext,
	} from '@tanstack/table-core';
	import { writable } from 'svelte/store';

	let { data } = $props();
	let { table_data }: DataSet<PersonView> = $derived(data);

	const edit_ids = writable(new Set<number>());
	const alerts = writable(new Set());
	const helper = createColumnHelper<PersonView>();
	const standard_header = (header_ctx: HeaderContext<PersonView, any>) =>
		renderComponent(BasicHeader<PersonView, any>, { header_ctx });

	const cell_slug =
		(prefix: string) =>
		(cell_ctx: CellContext<PersonView, { slug: string; has_slug: boolean }>) => {
			let { has_slug: is_nhl_player, slug } = cell_ctx.cell.getValue();
			if (!is_nhl_player) return '';
			return renderComponent(LinkCell, { href: `${prefix}${slug}` });
		};
	const toggle_edit = (cell_ctx: CellContext<PersonView, number>) => {
		const id = cell_ctx.cell.getValue();
		return renderComponent(BasicButton, {
			label: id.toString(),
			class: `${$edit_ids.has(id) ? 'bg-teal-100' : ''}`,
			action: () => {
				if ($edit_ids.has(id)) $edit_ids.delete(id);
				else $edit_ids.add(id);
				edit_ids.set($edit_ids);
			},
		});
	};

	let person_name_filter = $state('');

	async function search() {
		page.url.searchParams.set('full_name', person_name_filter);
		await goto(page.url, {
			invalidateAll: true,
		});
	}

	async function edit() {
		if ($edit_ids.size == 0) {
			return;
		}
		await goto(`${page.url.pathname}/edit?id=${Array.from($edit_ids)}`, {
			invalidateAll: true,
		});
	}

	const columns: ColumnDef<PersonView>[] = [
		helper.accessor('id', {
			id: 'edit',
			header: 'edit',
			cell: toggle_edit,
		}) as ColumnDef<PersonView>,
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
		helper.accessor('nhl_staff_id', {
			header: 'Staff',
			cell: (ctx) => ((ctx.cell.getValue() ?? 0) > 0 ? 'staff' : ''),
		}) as ColumnDef<PersonView>,
		helper.accessor('nhl_agent_id', {
			header: 'Agent',
			cell: (ctx) => ((ctx.cell.getValue() ?? 0) > 0 ? 'agent' : ''),
		}) as ColumnDef<PersonView>,
		// helper.accessor(({ nhl_staff_id, slug }) => ({ has_slug: (nhl_staff_id ?? 0) > 0, slug }), {
		// 	header: 'Staff URL',
		// 	cell: cell_slug('/staff/'),
		// }) as ColumnDef<PersonView>,
		// helper.accessor(({ nhl_agent_id, slug }) => ({ has_slug: (nhl_agent_id ?? 0) > 0, slug }), {
		// 	header: 'Agent URL',
		// 	cell: cell_slug('/agent/'),
		// }) as ColumnDef<PersonView>,
		helper.accessor('updated_by_user', {
			header: standard_header,
		}) as ColumnDef<PersonView>,
		helper.accessor('updated_at', {
			header: standard_header,
			cell: (ctx) => renderComponent(DateCell, { date_str: ctx.cell.getValue() }),
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
		<BasicButton class="border-teal-600 bg-teal-100" action={search}>Search</BasicButton>
		<BasicButton class="border-orange-600 bg-orange-100" action={edit}>To Edit Page</BasicButton>
	</div>
	<div class="scroll w-3/4 overflow-x-scroll">
		<BaseTable {columns} {table_data} />
	</div>

	<div class="p-2"></div>
</div>
