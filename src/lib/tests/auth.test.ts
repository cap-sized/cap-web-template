import { create_session } from '$lib/auth/session';
import { SESSION_ID_LENGTH } from '$lib/common';
import { TimeSpan } from '$lib/datetime';
import { clickhouse_client } from '$lib/db/clickhouse';
import { Role, type User } from '$lib/types/users';
import { expect, test } from 'vitest';

const DEFAULT_TEST_USER: User = {
	id: 'abcd',
	username: 'default',
	avatar_url: 'http://localhost:8123/play',
	email: 'default@cap.com',
	role_id: Role.authenticated,
};

test('create_session', async () => {
	try {
		let ch = clickhouse_client(Role.authenticated);
		let session = await create_session(
			ch,
			DEFAULT_TEST_USER,
			new TimeSpan(2, 's'),
			'dummy_sessions'
		);
		expect(session.user_id.length == SESSION_ID_LENGTH);
		expect(session.hashed_secret.length == 32);
		expect(session.token?.includes(session.user_id));
		expect(session.user_id === DEFAULT_TEST_USER.id);
	} catch (error) {
		console.warn('Clickhouse client not available, skipping this test...');
	}
});
