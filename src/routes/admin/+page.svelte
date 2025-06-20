<script lang="ts">
	import { create_table } from '$lib/tanstack/create.js';
	import { type Transaction } from '$lib/types/custom.js';
	import { createColumnHelper, getCoreRowModel, type ColumnDef } from '@tanstack/table-core';

	let { data } = $props();
	const { type_name, table_data } = $derived(data);

	const helper = createColumnHelper<Transaction>();
	const columns : ColumnDef<Transaction>[] = [
		helper.accessor('id', {
			header: () => "Id",
			footer: props => props.column.id,
		}) as ColumnDef<Transaction>
	];

	const table = $derived(create_table<Transaction>({
		columns, 
		data: table_data,
		getCoreRowModel: getCoreRowModel()
	}));
</script>

<div class="flex flex-col h-full w-full items-center justify-center text-center">
	<h1 class="text-3xl">Hola</h1>
	<p>{JSON.stringify(table_data)}</p>
	
	<div class="p-2">
  <table>
    <thead>
      {#each $table.getHeaderGroups() as headerGroup}
        <tr>
          {#each headerGroup.headers as header}
            <th>
              {#if !header.isPlaceholder}
			  {header.column.columnDef.header()}
                <!-- <svelte:component
                  this={flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                /> -->
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
            <td>
              <!-- <svelte:component
                this={flexRender(cell.column.columnDef.cell, cell.getContext())}
              /> -->
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
    <tfoot>
      {#each $table.getFooterGroups() as footerGroup}
        <tr>
          {#each footerGroup.headers as header}
            <th>
              {#if !header.isPlaceholder}
                <!-- <svelte:component
                  this={flexRender(
                    header.column.columnDef.footer,
                    header.getContext()
                  )}
                /> -->
              {/if}
            </th>
          {/each}
        </tr>
      {/each}
    </tfoot>
  </table>
  <!-- <div class="h-4" /> -->
  <!-- <button on:click={() => rerender()} class="border p-2"> Rerender </button> -->
</div>

</div>
