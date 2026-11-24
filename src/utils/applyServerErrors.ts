import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '../api/apiClient';

// Maps a failed request onto a react-hook-form form: Laravel validation errors
// (422) go to their fields, anything else goes to `errors.root.server`.
export function applyServerErrors<T extends FieldValues>(
	error: unknown,
	setError: UseFormSetError<T>,
): void {
	const validationErrors =
		error instanceof ApiError ? error.data?.errors : undefined;

	if (!validationErrors) {
		setError('root.server', {
			type: 'server',
			message: error instanceof Error ? error.message : undefined,
		});

		return;
	}

	Object.entries(validationErrors).forEach(([field, messages]) => {
		setError(field as Path<T>, {
			type: 'server',
			message: messages[0],
			types: {
				server: messages,
			},
		});
	});
}
