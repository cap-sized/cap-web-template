<script lang="ts">
	import { Role } from '$lib/types/users';
	import Navbar from '$lib/ui/page/navbar.svelte';
	import '../app.css';
	import { user_store } from './stores';

	let { children } = $props();

	let user = $state($user_store);

</script>

<Navbar title="TITLE ? {user?.username ?? ''} [{Role.toString(user?.role_id ?? Role.anon)}]" />
{@render children()}
