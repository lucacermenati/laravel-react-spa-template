import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../api/apiClient';
import { endpoints } from '../../api/endpoints';
import { Button, ErrorText, Form, TextInput } from '../../components/form';
import type { MessageResponse, ResetPasswordRequest } from '../../types/api';
import { applyServerErrors } from '../../utils/applyServerErrors';
import { fieldErrorToMessage } from '../../utils/fieldErrorToMessage';

// Reached from the emailed link: /reset-password/{token}?email={email}
export default function ResetPassword() {
	const { token = '' } = useParams();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<ResetPasswordRequest>({
		defaultValues: {
			token,
			email: searchParams.get('email') ?? '',
			password: '',
			password_confirmation: '',
		},
	});

	const { mutate: resetPassword, isPending } = useMutation<
		MessageResponse,
		Error,
		ResetPasswordRequest
	>({
		mutationFn: (data) =>
			apiRequest<MessageResponse>(endpoints.resetPassword, {
				method: 'POST',
				body: data,
			}),

		onSuccess: (response) => {
			navigate('/login', { state: { status: response.message } });
		},

		onError: (error) => applyServerErrors(error, setError),
	});

	return (
		<>
			<h1>Reset password</h1>

			<Form
				onSubmit={handleSubmit((data) => resetPassword(data))}
				disabled={isPending}
			>
				<TextInput
					id='email'
					label='Email'
					type='email'
					autoComplete='email'
					error={fieldErrorToMessage(errors.email)}
					{...register('email', { required: 'Email is required.' })}
				/>

				<TextInput
					id='password'
					label='New password'
					type='password'
					autoComplete='new-password'
					error={fieldErrorToMessage(errors.password)}
					{...register('password', { required: 'Password is required.' })}
				/>

				<TextInput
					id='password_confirmation'
					label='Confirm new password'
					type='password'
					autoComplete='new-password'
					error={fieldErrorToMessage(errors.password_confirmation)}
					{...register('password_confirmation', {
						required: 'Password confirmation is required.',
					})}
				/>

				{/* An invalid or expired token is reported on the hidden token field. */}
				{errors.token && <ErrorText>{fieldErrorToMessage(errors.token)}</ErrorText>}

				{errors.root?.server && (
					<ErrorText>{errors.root.server.message}</ErrorText>
				)}

				<Button type='submit' isPending={isPending}>
					Reset password
				</Button>
			</Form>

			<div className='links'>
				<Link to='/login'>Back to login</Link>
			</div>
		</>
	);
}
