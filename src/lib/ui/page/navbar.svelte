<script lang="ts">
	import { NavigationMenu } from 'bits-ui';

	export let title: string = '';
</script>

<NavigationMenu.Root class="relative z-10 flex w-full justify-center">
	<NavigationMenu.List class="group flex list-none items-center justify-center p-1">
		<p>{title}</p>
	</NavigationMenu.List>
</NavigationMenu.Root>
