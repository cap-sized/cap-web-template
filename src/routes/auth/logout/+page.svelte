<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data } = $props();
	const { message } = $derived(data);

	onMount(async () => {
		await invalidate('auth:logout');
		setTimeout(async () => {
			await goto('/', {
				replaceState: false,
				invalidateAll: true,
			});
		}, 100);
	});
</script>

<div class="flex h-full w-full items-center justify-center text-center">
	<h1 class="text-3xl">{message}</h1>
</div>
