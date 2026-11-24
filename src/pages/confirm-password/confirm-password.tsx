import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/apiClient';
import { endpoints } from '../../api/endpoints';
import { Button, ErrorText, Form, TextInput } from '../../components/form';
import type {
	ConfirmPasswordRequest,
	ConfirmedPasswordStatusResponse,
	NoContentResponse,
} from '../../types/api';
import { applyServerErrors } from '../../utils/applyServerErrors';
import { fieldErrorToMessage } from '../../utils/fieldErrorToMessage';

const CONFIRMED_PASSWORD_STATUS_QUERY_KEY = ['confirmed-password-status'];

// Fortify remembers a confirmed password for a while (auth.password_timeout),
// so that sensitive backend routes can require a recent confirmation.
export default function ConfirmPassword() {
	const queryClient = useQueryClient();

	const {
		data: status,
		isPending: isStatusPending,
		isError: isStatusFailed,
	} = useQuery<ConfirmedPasswordStatusResponse, Error>({
		queryKey: CONFIRMED_PASSWORD_STATUS_QUERY_KEY,
		queryFn: () =>
			apiRequest<ConfirmedPasswordStatusResponse>(
				endpoints.confirmedPasswordStatus,
			),
	});

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors },
	} = useForm<ConfirmPasswordRequest>({
		defaultValues: {
			password: '',
		},
	});

	const { mutate: confirmPassword, isPending } = useMutation<
		NoContentResponse,
		Error,
		ConfirmPasswordRequest
	>({
		mutationFn: (data) =>
			apiRequest<NoContentResponse>(endpoints.confirmPassword, {
				method: 'POST',
				body: data,
			}),

		onSuccess: () => {
			reset();

			return queryClient.invalidateQueries({
				queryKey: CONFIRMED_PASSWORD_STATUS_QUERY_KEY,
			});
		},

		onError: (error) => applyServerErrors(error, setError),
	});

	return (
		<>
			<h1>Confirm password</h1>

			{isStatusPending ? (
				<p className='muted'>Loading…</p>
			) : isStatusFailed ? (
				<ErrorText />
			) : (
				<p>
					Password recently confirmed:{' '}
					<strong>{status.confirmed ? 'yes' : 'no'}</strong>
				</p>
			)}

			<Form
				onSubmit={handleSubmit((data) => confirmPassword(data))}
				disabled={isPending}
			>
				<TextInput
					id='password'
					label='Password'
					type='password'
					autoComplete='current-password'
					error={fieldErrorToMessage(errors.password)}
					{...register('password', { required: 'Password is required.' })}
				/>

				{errors.root?.server && (
					<ErrorText>{errors.root.server.message}</ErrorText>
				)}

				<Button type='submit' isPending={isPending}>
					Confirm
				</Button>
			</Form>
		</>
	);
}
