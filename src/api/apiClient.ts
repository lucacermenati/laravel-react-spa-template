import type { ApiErrorResponse } from '../types/api';
import { getCsrfToken, refreshCsrfCookie } from './csrf';

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, '');

const CSRF_TOKEN_MISMATCH = 419;

type ApiRequestOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: unknown;
	headers?: Record<string, string>;
};

export class ApiError extends Error {
	status: number;
	data: ApiErrorResponse | null;

	constructor(
		message: string,
		status: number,
		data: ApiErrorResponse | null = null,
	) {
		super(message);

		this.name = 'ApiError';
		this.status = status;
		this.data = data;
	}
}

export async function apiRequest<T>(
	path: string,
	options: ApiRequestOptions = {},
): Promise<T> {
	const { method = 'GET', body, headers = {} } = options;

	const isFormData = body instanceof FormData;
	const needsCsrfToken = method !== 'GET';

	const send = async () => {
		const csrfToken = needsCsrfToken ? await getCsrfToken() : null;

		return fetch(`${API_URL}${path}`, {
			method,

			// The session lives in a cookie: it has to travel with every request.
			credentials: 'include',

			headers: {
				Accept: 'application/json',

				...(!isFormData && body !== undefined
					? {
							'Content-Type': 'application/json',
						}
					: {}),

				...(csrfToken
					? {
							'X-XSRF-TOKEN': csrfToken,
						}
					: {}),

				...headers,
			},

			body:
				body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
		});
	};

	let response = await send();

	// The CSRF token expired with the session: get a new one and retry once.
	if (response.status === CSRF_TOKEN_MISMATCH && needsCsrfToken) {
		await refreshCsrfCookie();

		response = await send();
	}

	const contentType = response.headers.get('content-type');
	const hasJsonResponse = contentType?.includes('application/json');

	const text = await response.text();
	const data: unknown = hasJsonResponse && text !== '' ? JSON.parse(text) : null;

	if (response.status === 401) {
		window.dispatchEvent(new CustomEvent('auth:unauthorized'));
	}

	// Laravel's "verified" middleware answers 409 when the email address is not
	// verified.
	if (response.status === 409) {
		window.dispatchEvent(new CustomEvent('auth:unverified'));
	}

	if (!response.ok) {
		const errorData = data as ApiErrorResponse | null;

		const message =
			errorData?.message ?? `Request failed with status ${response.status}.`;

		throw new ApiError(message, response.status, errorData);
	}

	return data as T;
}
