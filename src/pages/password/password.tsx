import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../api/apiClient';
import { endpoints } from '../../api/endpoints';
import { Button, ErrorText, Form, TextInput } from '../../components/form';
import type { NoContentResponse, UpdatePasswordRequest } from '../../types/api';
import { applyServerErrors } from '../../utils/applyServerErrors';
import { fieldErrorToMessage } from '../../utils/fieldErrorToMessage';

export default function Password() {
	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors },
	} = useForm<UpdatePasswordRequest>({
		defaultValues: {
			current_password: '',
			password: '',
			password_confirmation: '',
		},
	});

	const {
		mutate: updatePassword,
		isPending,
		isSuccess,
	} = useMutation<NoContentResponse, Error, UpdatePasswordRequest>({
		mutationFn: (data) =>
			apiRequest<NoContentResponse>(endpoints.updatePassword, {
				method: 'PUT',
				body: data,
			}),

		onSuccess: () => reset(),

		onError: (error) => applyServerErrors(error, setError),
	});

	return (
		<>
			<h1>Change password</h1>

			<Form
				onSubmit={handleSubmit((data) => updatePassword(data))}
				disabled={isPending}
			>
				<TextInput
					id='current_password'
					label='Current password'
					type='password'
					autoComplete='current-password'
					error={fieldErrorToMessage(errors.current_password)}
					{...register('current_password', {
						required: 'Current password is required.',
					})}
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

				{errors.root?.server && (
					<ErrorText>{errors.root.server.message}</ErrorText>
				)}

				{isSuccess && <p className='muted'>Saved.</p>}

				<Button type='submit' isPending={isPending}>
					Save
				</Button>
			</Form>
		</>
	);
}
