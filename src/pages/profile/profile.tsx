import { useAuth } from '../../auth/useAuth';

export default function Profile() {
	const { user } = useAuth();

	return (
		<>
			<h1>Profile</h1>

			<pre>{JSON.stringify(user, null, 2)}</pre>
		</>
	);
}
