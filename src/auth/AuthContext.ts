import { createContext } from 'react';
import type { LoginCredentials, RegistrationRequest, User } from '../types/api';

export const USER_QUERY_KEY = ['user'];

export type AuthContextValue = {
	// null when there is no session.
	user: User | null;
	isAuthenticated: boolean;

	// True while the first session check is running.
	isUserPending: boolean;
	isUserFailed: boolean;

	// Both reject with the ApiError of the failed request.
	handleRegistration: (registrationData: RegistrationRequest) => Promise<void>;
	isRegistrationPending: boolean;

	handleLogin: (credentials: LoginCredentials) => Promise<void>;
	isLoginPending: boolean;

	handleLogout: () => void;
	isLogoutPending: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
