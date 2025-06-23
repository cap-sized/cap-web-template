<script lang="ts">
	let { color, editable }: { color: string; editable: boolean } = $props();
</script>

<p class="w-fit p-2 bg-[{color}]" style:background={color}>{color}</p>
