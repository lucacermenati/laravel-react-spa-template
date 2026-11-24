import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth/useAuth';
import ErrorText from './form/error-text/error-text';

export default function ProtectedRoute({
	requireVerified = false,
}: {
	/** Also require a verified email address. */
	requireVerified?: boolean;
}) {
	const { user, isUserPending, isUserFailed } = useAuth();
	const location = useLocation();

	if (isUserPending) {
		return <p>Loading…</p>;
	}

	if (isUserFailed) {
		return <ErrorText>Could not reach the server. Retry later.</ErrorText>;
	}

	if (user === null) {
		return (
			<Navigate
				to='/login'
				replace
				state={{
					// Where to come back to after login.
					from: location.pathname + location.search,
				}}
			/>
		);
	}

	if (requireVerified && user.email_verified_at === null) {
		return <Navigate to='/email/verify' replace />;
	}

	return <Outlet />;
}
