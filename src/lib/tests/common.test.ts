import { expect, test } from 'vitest';
import { rng_str } from '$lib/common';

test('rng_str', () => {
	let example = rng_str(20);
	console.log(example);
	expect(example.length == 20);
});
