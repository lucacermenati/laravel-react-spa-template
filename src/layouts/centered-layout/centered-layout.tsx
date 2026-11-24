import { Outlet } from 'react-router';
import styles from './centered-layout.module.scss';

// Used by every page that is shown outside the app itself: login, register,
// password reset and email verification.
export default function CenteredLayout() {
	return (
		<main className={styles.page}>
			<div className={styles.box}>
				<Outlet />
			</div>
		</main>
	);
}
