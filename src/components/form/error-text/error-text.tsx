import clsx from 'clsx';
import style from './error-text.module.scss';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Retry later.';

export default function ErrorText({
	children,
	className,
}: {
	/** One or more messages. Empty or missing falls back to a default message. */
	children?: Array<string | undefined | null> | string | null;
	className?: string;
}) {
	const given = Array.isArray(children) ? children : [children];
	const messages = given.filter(
		(message): message is string =>
			typeof message === 'string' && message.trim() !== '',
	);
	const toRender = messages.length > 0 ? messages : [DEFAULT_ERROR_MESSAGE];

	return (
		<div role='alert' className={clsx(style.errors, className)}>
			{toRender.map((error, index) => (
				<div key={index}>{error}</div>
			))}
		</div>
	);
}
