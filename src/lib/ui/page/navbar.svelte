<script lang="ts">
	import { NavigationMenu } from 'bits-ui';

	let { title, href }: { title: string; href: string } = $props();
</script>

<NavigationMenu.Root class="relative z-10 flex w-full justify-center text-lg font-black">
	<NavigationMenu.List class="group flex list-none items-center justify-center p-1">
		<a class="text-teal-800 underline" {href} title="Home">
			<p>{title}</p>
		</a>
	</NavigationMenu.List>
</NavigationMenu.Root>
