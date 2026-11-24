import { Link, Outlet } from 'react-router';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../../components/form';
import styles from './authenticated-layout.module.scss';

export default function AuthenticatedLayout() {
	const { handleLogout, isLogoutPending } = useAuth();

	return (
		<>
			<header className={styles.header}>
				<nav className={styles.nav}>
					<Link to='/profile'>Profile</Link>
					<Link to='/profile-information'>Edit profile</Link>
					<Link to='/password'>Change password</Link>
					<Link to='/confirm-password'>Confirm password</Link>
				</nav>
				<Button
					variant='secondary'
					onClick={handleLogout}
					isPending={isLogoutPending}
				>
					Logout
				</Button>
			</header>

			<main className={styles.main}>
				<Outlet />
			</main>
		</>
	);
}
