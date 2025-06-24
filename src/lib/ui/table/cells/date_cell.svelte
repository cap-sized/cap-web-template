<script lang="ts">
	import { strptime_ch_utc, type DateString } from '$lib/types/db';
	import { datetime_utc_to_nyt_str } from '$lib/ui/fmt/string';

	let { date_str }: { date_str: DateString } = $props();
	let date = $derived(strptime_ch_utc(date_str));
</script>

<p>{datetime_utc_to_nyt_str(date)}</p>
