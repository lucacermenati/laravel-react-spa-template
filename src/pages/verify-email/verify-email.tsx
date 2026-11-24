import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/apiClient';
import { endpoints } from '../../api/endpoints';
import { USER_QUERY_KEY } from '../../auth/AuthContext';
import { ErrorText } from '../../components/form';
import type { NoContentResponse } from '../../types/api';

// Reached from the emailed link: /email/verify/{id}/{hash}?expires=…&signature=…
// The link is forwarded as it is to the backend, which checks its signature.
export default function VerifyEmail() {
	const { id = '', hash = '' } = useParams();
	const { search } = useLocation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { isSuccess, isError, error } = useQuery<NoContentResponse, Error>({
		queryKey: ['verify-email', id, hash, search],
		queryFn: () =>
			apiRequest<NoContentResponse>(endpoints.verifyEmail(id, hash, search)),
		staleTime: Infinity,
	});

	useEffect(() => {
		if (!isSuccess) return;

		// Load the now verified user before entering the protected pages.
		queryClient
			.invalidateQueries({ queryKey: USER_QUERY_KEY })
			.then(() => navigate('/profile', { replace: true }));
	}, [isSuccess, queryClient, navigate]);

	if (isError) {
		return (
			<>
				<h1>Verify your email</h1>

				<ErrorText>{error.message}</ErrorText>

				<div className='links'>
					<Link to='/email/verify'>Request a new link</Link>
				</div>
			</>
		);
	}

	return <p>Verifying your email…</p>;
}
