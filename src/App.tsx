import { Navigate, Route, Routes } from 'react-router';
import GuestRoute from './components/guest-route';
import ProtectedRoute from './components/protected-route';
import AuthenticatedLayout from './layouts/authenticated-layout/authenticated-layout';
import CenteredLayout from './layouts/centered-layout/centered-layout';
import ConfirmPassword from './pages/confirm-password/confirm-password';
import ForgotPassword from './pages/forgot-password/forgot-password';
import Login from './pages/login/login';
import NotFound from './pages/not-found/not-found';
import Password from './pages/password/password';
import ProfileInformation from './pages/profile-information/profile-information';
import Profile from './pages/profile/profile';
import Register from './pages/register/register';
import ResetPassword from './pages/reset-password/reset-password';
import VerifyEmailNotice from './pages/verify-email-notice/verify-email-notice';
import VerifyEmail from './pages/verify-email/verify-email';

export default function App() {
	return (
		<Routes>
			{/* Only without a session */}
			<Route element={<GuestRoute />}>
				<Route element={<CenteredLayout />}>
					<Route path='/login' element={<Login />} />
					<Route path='/register' element={<Register />} />
					<Route path='/forgot-password' element={<ForgotPassword />} />
					<Route path='/reset-password/:token' element={<ResetPassword />} />
				</Route>
			</Route>

			{/* With a session, verified or not */}
			<Route element={<ProtectedRoute />}>
				<Route element={<CenteredLayout />}>
					<Route path='/email/verify' element={<VerifyEmailNotice />} />
					<Route path='/email/verify/:id/:hash' element={<VerifyEmail />} />
				</Route>
			</Route>

			{/* With a session and a verified email address */}
			<Route element={<ProtectedRoute requireVerified />}>
				<Route element={<AuthenticatedLayout />}>
					<Route path='/profile' element={<Profile />} />
					<Route path='/profile-information' element={<ProfileInformation />} />
					<Route path='/password' element={<Password />} />
					<Route path='/confirm-password' element={<ConfirmPassword />} />
				</Route>
			</Route>

			<Route path='/' element={<Navigate to='/profile' replace />} />

			<Route path='*' element={<NotFound />} />
		</Routes>
	);
}
