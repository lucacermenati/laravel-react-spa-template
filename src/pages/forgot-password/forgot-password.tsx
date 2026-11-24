import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../api/apiClient';
import { endpoints } from '../../api/endpoints';
import { Button, ErrorText, Form, TextInput } from '../../components/form';
import type { ForgotPasswordRequest, MessageResponse } from '../../types/api';
import { applyServerErrors } from '../../utils/applyServerErrors';
import { fieldErrorToMessage } from '../../utils/fieldErrorToMessage';

export default function ForgotPassword() {
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<ForgotPasswordRequest>({
		defaultValues: {
			email: '',
		},
	});

	const {
		mutate: sendResetLink,
		data: response,
		isPending,
	} = useMutation<MessageResponse, Error, ForgotPasswordRequest>({
		mutationFn: (data) =>
			apiRequest<MessageResponse>(endpoints.forgotPassword, {
				method: 'POST',
				body: data,
			}),

		onError: (error) => applyServerErrors(error, setError),
	});

	return (
		<>
			<h1>Forgot password</h1>

			<p className='muted'>
				Enter your email address and we will send you a link to reset your
				password.
			</p>

			<Form
				onSubmit={handleSubmit((data) => sendResetLink(data))}
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

				{errors.root?.server && (
					<ErrorText>{errors.root.server.message}</ErrorText>
				)}

				{response && <p className='muted'>{response.message}</p>}

				<Button type='submit' isPending={isPending}>
					Send reset link
				</Button>
			</Form>

			<div className='links'>
				<Link to='/login'>Back to login</Link>
			</div>
		</>
	);
}
