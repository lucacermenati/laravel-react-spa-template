import { useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiRequest } from '../api/apiClient';
import { endpoints } from '../api/endpoints';
import type {
	LoginCredentials,
	NoContentResponse,
	RegistrationRequest,
	User,
} from '../types/api';
import { AuthContext, USER_QUERY_KEY, type AuthContextValue } from './AuthContext';

// The session cookie is not readable from JavaScript, so the only way to know
// whether there is a session is to ask the backend for the user.
async function fetchUser(): Promise<User | null> {
	try {
		const response = await apiRequest<User | { data: User }>(endpoints.user);

		// Laravel API resources wrap the payload in `data`.
		return 'data' in response ? (response.data as User) : response;
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			return null;
		}

		throw error;
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();

	const userQuery = useQuery<User | null, Error>({
		queryKey: USER_QUERY_KEY,
		queryFn: fetchUser,
	});

	const refetchUser = useCallback(
		() => queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY }),
		[queryClient],
	);

	const clearSession = useCallback(() => {
		queryClient.setQueryData(USER_QUERY_KEY, null);

		// Drop everything cached for the previous user.
		queryClient.removeQueries({
			predicate: (query) => query.queryKey[0] !== USER_QUERY_KEY[0],
		});
	}, [queryClient]);

	const { mutateAsync: registerAsync, isPending: isRegistrationPending } =
		useMutation<NoContentResponse, Error, RegistrationRequest>({
			mutationFn: (registrationData) =>
				apiRequest<NoContentResponse>(endpoints.register, {
					method: 'POST',
					body: registrationData,
				}),

			// Fortify logs the user in right after registration.
			onSuccess: refetchUser,
		});

	const handleRegistration = useCallback(
		async (registrationData: RegistrationRequest) => {
			await registerAsync(registrationData);
		},
		[registerAsync],
	);

	const { mutateAsync: loginAsync, isPending: isLoginPending } = useMutation<
		NoContentResponse,
		Error,
		LoginCredentials
	>({
		mutationFn: (credentials) =>
			apiRequest<NoContentResponse>(endpoints.login, {
				method: 'POST',
				body: credentials,
			}),

		onSuccess: refetchUser,
	});

	const handleLogin = useCallback(
		async (credentials: LoginCredentials) => {
			await loginAsync(credentials);
		},
		[loginAsync],
	);

	const { mutate: logout, isPending: isLogoutPending } = useMutation<
		NoContentResponse,
		Error,
		void
	>({
		mutationFn: () =>
			apiRequest<NoContentResponse>(endpoints.logout, {
				method: 'POST',
			}),

		onSuccess: clearSession,
	});

	const handleLogout = useCallback(() => {
		logout();
	}, [logout]);

	// Any request answered with 401 means the session is gone.
	useEffect(() => {
		window.addEventListener('auth:unauthorized', clearSession);

		return () => {
			window.removeEventListener('auth:unauthorized', clearSession);
		};
	}, [clearSession]);

	// A request answered with 409 means the backend considers the email address
	// unverified: reload the user, so that ProtectedRoute sends them to
	// /email/verify.
	useEffect(() => {
		window.addEventListener('auth:unverified', refetchUser);

		return () => {
			window.removeEventListener('auth:unverified', refetchUser);
		};
	}, [refetchUser]);

	const user = userQuery.data ?? null;

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			isAuthenticated: user !== null,
			isUserPending: userQuery.isPending,
			isUserFailed: userQuery.isError,
			handleRegistration,
			isRegistrationPending,
			handleLogin,
			isLoginPending,
			handleLogout,
			isLogoutPending,
		}),
		[
			user,
			userQuery.isPending,
			userQuery.isError,
			handleRegistration,
			isRegistrationPending,
			handleLogin,
			isLoginPending,
			handleLogout,
			isLogoutPending,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
