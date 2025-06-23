<script lang="ts">
	let {
		value,
		lower_limit,
		limit,
		comment_value,
		comment_limit,
		threshold = 0.05,
		is_currency = false,
		hide_limit = false,
		invert = false,
		show_ok = false,
		show_almost = false,
		show_positive_plus = false,
		is_strict = false,
		is_compact_value = false,
		is_compact_limit = true,
	}: {
		value?: number;
		lower_limit?: number;
		limit?: number;
		threshold?: number;
		comment_value?: string;
		comment_limit?: string;
		is_currency?: boolean;
		hide_limit?: boolean;
		invert?: boolean;
		show_ok?: boolean;
		show_almost?: boolean;
		show_positive_plus?: boolean;
		is_strict?: boolean;
		is_compact_value?: boolean;
		is_compact_limit?: boolean;
	} = $props();
</script>
