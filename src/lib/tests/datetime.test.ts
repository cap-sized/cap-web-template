import { TimeSpan, create_datetime_after, strftime, time_span_between } from '$lib/datetime';
import { strptime_ch_utc } from '$lib/types/db';
import { expect, test } from 'vitest';

const DEFAULT_TEST_DATE = new Date(1738483200000); // 2025-02-02 16:00:00.00008
const DEFAULT_TEST_TIMESPAN = new TimeSpan(2, 'w');

test('create_datetime_after', () => {
	const actual = create_datetime_after(DEFAULT_TEST_DATE, DEFAULT_TEST_TIMESPAN);
	expect(actual == new Date(1739692800000));
});

test('strftime_iso_utc', () => {
	const actual = strftime(DEFAULT_TEST_DATE, 'ISO_UTC');
	expect(actual === '2025-02-16 16:00:00.00008');
});

test('strptime_iso_utc', () => {
	const actual = strptime_ch_utc('2025-02-02 16:00:00.00008');
	expect(actual === DEFAULT_TEST_DATE);
});

test('time_left_until', () => {
	const target = create_datetime_after(DEFAULT_TEST_DATE, DEFAULT_TEST_TIMESPAN);
	const time_left = time_span_between(target, DEFAULT_TEST_DATE);
	expect(time_left === DEFAULT_TEST_TIMESPAN);
});

// TODO: Test timespan comparators
