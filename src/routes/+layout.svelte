<script lang="ts">
	import { Role, type Session, type User } from '$lib/types/users';
	import Navbar from '$lib/ui/page/navbar.svelte';
	import '../app.css';

	let { data, children } = $props();
	let { user } = $derived(data as { user: User | null; session: Session | null });
</script>

<Navbar title="capsized $ {user?.username ?? ''} [{Role.toString(user?.role_id ?? Role.anon)}]" />
{@render children()}
