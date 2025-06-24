<script lang="ts">
	let {
		value,
		orig_value,
		oninput,
		errors,
		type = 'string',
	}: {
		value: any;
		orig_value: any;
		oninput: (value: any) => void;
		errors?: string;
		type?: string;
	} = $props();
</script>

<input
	class="border-[1px] px-1 {orig_value == value ? '' : 'text-teal-700'}"
	{type}
	name="name"
	{value}
	{oninput}
/>
{#if errors}
	<p>{errors}</p>
{/if}
