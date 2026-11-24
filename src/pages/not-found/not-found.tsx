import { Link } from 'react-router';

export default function NotFound() {
	return (
		<main style={{ padding: '1rem' }}>
			<h1>Page not found</h1>

			<Link to='/'>Go to the app</Link>
		</main>
	);
}
