// Requests
export type RegistrationRequest = {
	name: string;
	email: string;
	password: string;
	password_confirmation: string;
};

export type LoginCredentials = {
	email: string;
	password: string;
	remember: boolean;
};

export type ForgotPasswordRequest = {
	email: string;
};

export type ResetPasswordRequest = {
	token: string;
	email: string;
	password: string;
	password_confirmation: string;
};

export type UpdateProfileInformationRequest = {
	name: string;
	email: string;
};

export type UpdatePasswordRequest = {
	current_password: string;
	password: string;
	password_confirmation: string;
};

export type ConfirmPasswordRequest = {
	password: string;
};

// Responses
export type NoContentResponse = object | null;

export type MessageResponse = {
	message: string;
};

export type ConfirmedPasswordStatusResponse = {
	confirmed: boolean;
};

export type ApiErrorResponse = {
	message?: string;
	errors?: Record<string, string[]>;
};

// Resources
export type User = {
	id: number | string;
	name: string;
	email: string;
	email_verified_at: string | null;
	[key: string]: unknown;
};
