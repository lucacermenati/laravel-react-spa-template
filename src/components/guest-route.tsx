import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth/useAuth';

// Pages that only make sense without a session (login, register, ...).
export default function GuestRoute() {
	const { isAuthenticated, isUserPending } = useAuth();
	const location = useLocation();

	if (isUserPending) {
		return <p>Loading…</p>;
	}

	if (isAuthenticated) {
		const from: unknown = location.state?.from;

		return <Navigate to={typeof from === 'string' ? from : '/profile'} replace />;
	}

	return <Outlet />;
}
