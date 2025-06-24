<script lang="ts" generics="T, Args">
	import { snake_to_capitalize } from '$lib/ui/fmt/string';
	import type { HeaderContext } from '@tanstack/table-core';

	let {
		header_ctx,
	}: {
		header_ctx: HeaderContext<T, Args>;
	} = $props();
</script>

<p>{snake_to_capitalize(header_ctx.column.id)}</p>
