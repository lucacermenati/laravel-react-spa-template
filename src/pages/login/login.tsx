import { Link, useLocation } from 'react-router';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../auth/useAuth';
import { Button, ErrorText, Form, TextInput } from '../../components/form';
import type { LoginCredentials } from '../../types/api';
import { applyServerErrors } from '../../utils/applyServerErrors';
import { fieldErrorToMessage } from '../../utils/fieldErrorToMessage';

export default function Login() {
	const { handleLogin, isLoginPending } = useAuth();
	const location = useLocation();

	// Set by pages that send the user here, e.g. after a password reset.
	const status: unknown = location.state?.status;

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<LoginCredentials>({
		defaultValues: {
			email: '',
			password: '',
			remember: false,
		},
	});

	// On success GuestRoute redirects away as soon as the user is loaded.
	const login: SubmitHandler<LoginCredentials> = async (credentials) => {
		try {
			await handleLogin(credentials);
		} catch (error) {
			applyServerErrors(error, setError);
		}
	};

	return (
		<>
			<h1>Login</h1>

			{typeof status === 'string' && <p className='muted'>{status}</p>}

			<Form onSubmit={handleSubmit(login)} disabled={isLoginPending}>
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
					autoComplete='current-password'
					error={fieldErrorToMessage(errors.password)}
					{...register('password', { required: 'Password is required.' })}
				/>

				<label>
					<input type='checkbox' {...register('remember')} /> Remember me
				</label>

				{errors.root?.server && (
					<ErrorText>{errors.root.server.message}</ErrorText>
				)}

				<Button type='submit' isPending={isLoginPending}>
					Login
				</Button>
			</Form>

			<div className='links'>
				<Link to='/register'>Create an account</Link>
				<Link to='/forgot-password'>Forgot your password?</Link>
			</div>
		</>
	);
}
