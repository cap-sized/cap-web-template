<script lang="ts">
	let { href, label }: { href: string; label?: string } = $props();
</script>

<a class="text-teal-600 underline" {href}>{href ?? label}</a>
