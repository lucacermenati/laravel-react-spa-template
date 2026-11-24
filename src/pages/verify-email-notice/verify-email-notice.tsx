import { Navigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../api/apiClient';
import { endpoints } from '../../api/endpoints';
import { useAuth } from '../../auth/useAuth';
import { Button, ErrorText } from '../../components/form';
import type { NoContentResponse } from '../../types/api';

// Shown to a logged in user whose email address is not verified yet.
export default function VerifyEmailNotice() {
	const { user, handleLogout, isLogoutPending } = useAuth();

	const {
		mutate: sendVerificationEmail,
		isPending,
		isSuccess,
		isError,
		error,
	} = useMutation<NoContentResponse, Error, void>({
		mutationFn: () =>
			apiRequest<NoContentResponse>(endpoints.sendVerificationEmail, {
				method: 'POST',
			}),
	});

	if (user?.email_verified_at) {
		return <Navigate to='/profile' replace />;
	}

	return (
		<>
			<h1>Verify your email</h1>

			<p>
				We sent a verification link to <strong>{user?.email}</strong>. Open it
				to activate your account.
			</p>

			{isSuccess && (
				<p className='muted'>A new verification link has been sent.</p>
			)}

			{isError && <ErrorText>{error.message}</ErrorText>}

			<div className='links'>
				<Button onClick={() => sendVerificationEmail()} isPending={isPending}>
					Resend verification email
				</Button>
				<Button
					variant='secondary'
					onClick={handleLogout}
					isPending={isLogoutPending}
				>
					Logout
				</Button>
			</div>
		</>
	);
}
