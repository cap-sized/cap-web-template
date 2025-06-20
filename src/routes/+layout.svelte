<script lang="ts">
	import { Role, type Session, type User } from '$lib/types/users';
	import Navbar from '$lib/ui/page/navbar.svelte';
	import '../app.css';

	let { data, children } = $props();
	let { user, session } = $derived(data as { user: User | null, session: Session | null});

	$inspect(data);

	$effect(() => {
		console.log(user);
	});
</script>

<Navbar title="TITLE ? {user?.username ?? ''} [{Role.toString(user?.role_id ?? Role.anon)}]" />
{@render children()}
