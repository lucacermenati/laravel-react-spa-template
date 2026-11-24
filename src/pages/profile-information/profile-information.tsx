import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/apiClient';
import { endpoints } from '../../api/endpoints';
import { USER_QUERY_KEY } from '../../auth/AuthContext';
import { useAuth } from '../../auth/useAuth';
import { Button, ErrorText, Form, TextInput } from '../../components/form';
import type {
	NoContentResponse,
	UpdateProfileInformationRequest,
} from '../../types/api';
import { applyServerErrors } from '../../utils/applyServerErrors';
import { fieldErrorToMessage } from '../../utils/fieldErrorToMessage';

export default function ProfileInformation() {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<UpdateProfileInformationRequest>({
		defaultValues: {
			name: user?.name ?? '',
			email: user?.email ?? '',
		},
	});

	const {
		mutate: updateProfileInformation,
		isPending,
		isSuccess,
	} = useMutation<NoContentResponse, Error, UpdateProfileInformationRequest>({
		mutationFn: (data) =>
			apiRequest<NoContentResponse>(endpoints.updateProfileInformation, {
				method: 'PUT',
				body: data,
			}),

		// A changed email address has to be verified again: the reloaded user
		// makes ProtectedRoute send the user to the verification notice.
		onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY }),

		onError: (error) => applyServerErrors(error, setError),
	});

	return (
		<>
			<h1>Edit profile</h1>

			<Form
				onSubmit={handleSubmit((data) => updateProfileInformation(data))}
				disabled={isPending}
			>
				<TextInput
					id='name'
					label='Name'
					autoComplete='name'
					error={fieldErrorToMessage(errors.name)}
					{...register('name', { required: 'Name is required.' })}
				/>

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

				{isSuccess && <p className='muted'>Saved.</p>}

				<Button type='submit' isPending={isPending}>
					Save
				</Button>
			</Form>
		</>
	);
}
