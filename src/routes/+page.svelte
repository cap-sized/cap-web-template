<script lang="ts">
	import { Role } from '$lib/types/users';

	let { data } = $props();
	let user = $derived(data.user);
</script>

<div>you are logged in as : {user?.username}</div>

<a href="/auth/register" class="text-blue-600 underline">Register here</a>
<a href="/auth" class="text-blue-600 underline">Login here</a>

{#if user && user.role_id >= Role.admin}
	Go to the admin sandbox
	<a href="/admin" class="text-blue-600 underline">here</a>
{/if}
