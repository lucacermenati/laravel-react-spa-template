// Every backend path used by the app, relative to VITE_API_URL.
export const endpoints = {
	user: '/user',

	login: '/login',
	logout: '/logout',
	register: '/register',

	forgotPassword: '/forgot-password',
	resetPassword: '/reset-password',

	// `query` is the signed query string from the emailed link (expires, signature).
	verifyEmail: (id: string, hash: string, query: string) =>
		`/email/verify/${id}/${hash}${query}`,
	sendVerificationEmail: '/email/verification-notification',

	updateProfileInformation: '/user/profile-information',
	updatePassword: '/user/password',

	confirmPassword: '/user/confirm-password',
	confirmedPasswordStatus: '/user/confirmed-password-status',
};
