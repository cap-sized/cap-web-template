export const load = async ({ data, depends }) => {
	/**
	 * Declare a dependency so the layout can be invalidated, for example, on
	 * session refresh.
	 */
	depends('auth:session');
	depends('auth:logout');
	return data;
};
