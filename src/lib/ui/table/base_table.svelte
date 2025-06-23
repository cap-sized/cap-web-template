<script lang="ts" generics="T">
	import { create_table } from '$lib/tanstack/create';
	import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core';
	import FlexRender from './flex_render.svelte';

	let {
		columns,
		table_data,
	}: {
		columns: ColumnDef<T>[];
		table_data: T[];
	} = $props();

	const table = $derived(
		create_table<T>({
			columns,
			data: table_data,
			getCoreRowModel: getCoreRowModel(),
			manualFiltering: true,
		})
	);
</script>

<table>
	<thead>
		{#each $table.getHeaderGroups() as headerGroup}
			<tr>
				{#each headerGroup.headers as header}
					<th class="px-2">
						{#if !header.isPlaceholder}
							<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
						{/if}
					</th>
				{/each}
			</tr>
		{/each}
	</thead>
	<tbody>
		{#each $table.getRowModel().rows as row}
			<tr>
				{#each row.getVisibleCells() as cell}
					<td class="px-2">
						<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
	<tfoot>
		{#each $table.getFooterGroups() as footerGroup}
			<tr>
				{#each footerGroup.headers as header}
					<th class="px-2">
						{#if !header.isPlaceholder}
							<FlexRender content={header.column.columnDef.footer} context={header.getContext()} />
						{/if}
					</th>
				{/each}
			</tr>
		{/each}
	</tfoot>
</table>
