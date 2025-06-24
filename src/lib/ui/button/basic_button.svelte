<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		action,
		children,
		class: className,
	}: {
		label?: string;
		action: () => Promise<void> | void;
		children?: Snippet;
		class?: string;
	} = $props();
</script>

<button class="{className} cursor-pointer rounded-sm border-2 p-1" onclick={action}>
	{#if label}
		{label}
	{:else}
		{@render children?.()}
	{/if}
</button>
