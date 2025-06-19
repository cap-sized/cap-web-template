<script lang="ts">
	import { get_superform_options } from '$lib/common';

	// import { SUPERFORM_OPTIONS } from '$lib/common';
	import { superForm } from 'sveltekit-superforms';

	export let data: { form: any };
	const { form, errors, enhance, constraints, delayed } = superForm(
		data.form,
		get_superform_options()
	);
</script>

<div class="flex w-1/2 flex-col space-y-2">
	<form use:enhance method="POST" class="grid grid-cols-2 gap-x-10 gap-y-5 sm:w-[600px]">
		<label for="name">Username</label>
		<input
			class="border-2 border-black p-2"
			type="text"
			name="name"
			aria-invalid={$errors.username ? 'true' : undefined}
			bind:value={$form.username}
			{...$constraints.username}
		/>
		{#if $errors.username}<span class="invalid">{$errors.username}</span>{/if}

		<label for="email">Password</label>
		<input
			class="border-2 border-black p-2"
			type="password"
			name="password"
			placeholder="password"
			aria-invalid={$errors.password ? 'true' : undefined}
			bind:value={$form.password}
			{...$constraints.password}
		/>
		{#if $errors.password}<span class="invalid">{$errors.password}</span>{/if}

		<div><button class="border-2 border-black">Submit</button></div>
	</form>
</div>
