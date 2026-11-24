import { Link } from 'react-router';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../auth/useAuth';
import { Button, ErrorText, Form, TextInput } from '../../components/form';
import type { RegistrationRequest } from '../../types/api';
import { applyServerErrors } from '../../utils/applyServerErrors';
import { fieldErrorToMessage } from '../../utils/fieldErrorToMessage';

export default function Register() {
	const { handleRegistration, isRegistrationPending } = useAuth();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<RegistrationRequest>({
		defaultValues: {
			name: '',
			email: '',
			password: '',
			password_confirmation: '',
		},
	});

	// On success GuestRoute redirects away as soon as the user is loaded.
	const registerUser: SubmitHandler<RegistrationRequest> = async (data) => {
		try {
			await handleRegistration(data);
		} catch (error) {
			applyServerErrors(error, setError);
		}
	};

	return (
		<>
			<h1>Register</h1>

			<Form
				onSubmit={handleSubmit(registerUser)}
				disabled={isRegistrationPending}
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

				<TextInput
					id='password'
					label='Password'
					type='password'
					autoComplete='new-password'
					error={fieldErrorToMessage(errors.password)}
					{...register('password', { required: 'Password is required.' })}
				/>

				<TextInput
					id='password_confirmation'
					label='Confirm password'
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

				<Button type='submit' isPending={isRegistrationPending}>
					Register
				</Button>
			</Form>

			<div className='links'>
				<Link to='/login'>I already have an account</Link>
			</div>
		</>
	);
}
