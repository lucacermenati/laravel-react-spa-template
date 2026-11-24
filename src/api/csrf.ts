const CSRF_COOKIE_URL = import.meta.env.VITE_CSRF_COOKIE_URL;
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';

// Laravel sets the token in a readable cookie and expects it back, URL-decoded,
// in the X-XSRF-TOKEN header.
export function readCsrfToken(): string | null {
	const cookie = document.cookie
		.split('; ')
		.find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`));

	if (!cookie) return null;

	return decodeURIComponent(cookie.slice(CSRF_COOKIE_NAME.length + 1));
}

export async function refreshCsrfCookie(): Promise<void> {
	await fetch(CSRF_COOKIE_URL, {
		credentials: 'include',
		headers: { Accept: 'application/json' },
	});
}

export async function getCsrfToken(): Promise<string | null> {
	if (readCsrfToken() === null) {
		await refreshCsrfCookie();
	}

	return readCsrfToken();
}
