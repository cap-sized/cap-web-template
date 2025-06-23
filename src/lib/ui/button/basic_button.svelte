<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		action,
		children,
	}: { label?: string; action: () => Promise<void> | void; children: Snippet } = $props();
</script>

<button class="cursor-pointer rounded-sm border-2 p-1" onclick={action}>
	{#if label}
		{label}
	{:else}
		{@render children?.()}
	{/if}
</button>
