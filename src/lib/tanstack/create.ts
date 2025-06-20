import {
	createTable,
	type RowData,
	type Table,
	type TableOptions,
	type TableOptionsResolved,
} from '@tanstack/table-core';
import { get, readable, writable, type Readable, derived } from 'svelte/store';


type ReadableOrVal<T> = T | Readable<T>;
type ReadTable<T> = Readable<Table<T>>;

export function create_table<TData extends RowData>(
	options: ReadableOrVal<TableOptions<TData>>
): ReadTable<TData> {
	const options_store: Readable<TableOptions<TData>> =
		'subscribe' in options ? options : readable(options);

	let resolved_options: TableOptionsResolved<TData> = {
		state: {},
		onStateChange: () => {},
		renderFallbackValue: null,
		...get(options_store),
	};

	let table = createTable(resolved_options);
	let state_store = writable(/** @type {number} */ table.initialState);

	let state_options_store = derived([state_store, options_store], (s) => s);
	const table_readable = readable(table, function start(set) {
		const unsub = state_options_store.subscribe(([state, options]) => {
			table.setOptions((prev) => {
				return {
					...prev,
					...options,
					state: { ...state, ...options.state },
					onStateChange: (updater) => {
						if (updater instanceof Function) {
							state_store.update(updater);
						} else {
							state_store.set(updater);
						}
						resolved_options.onStateChange?.(updater);
					},
				};
			});
		});
		return function stop() {
			unsub();
		};
	});
	return table_readable;
}
