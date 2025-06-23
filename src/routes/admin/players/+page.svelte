<script lang="ts">
	import { renderComponent } from '$lib/tanstack/render.js';
	import { type FullPlayerView } from '$lib/types/db_persons.js';
	import BaseTable from '$lib/ui/table/base_table.svelte';
	import BasicHeader from '$lib/ui/table/headers/basic_header.svelte';
	import {
		createColumnHelper,
		type ColumnDef,
		type ColumnHelper,
		type HeaderContext,
	} from '@tanstack/table-core';

	let { data } = $props();
	const { table_data } = $derived(data);

	const helper = createColumnHelper<FullPlayerView>();
	const standard_header = (header_ctx: HeaderContext<FullPlayerView, string>) =>
		renderComponent(BasicHeader<FullPlayerView>, { header_ctx });
	const columns: ColumnDef<FullPlayerView>[] = [
		helper.accessor('full_name', {
			header: standard_header,
		}) as ColumnDef<FullPlayerView>,
	];
</script>

<div class="flex h-full w-full flex-col items-center justify-center text-center">
	<h1 class="text-3xl">Players</h1>
	<BaseTable {columns} {table_data} />

	<div class="p-2"></div>
</div>
