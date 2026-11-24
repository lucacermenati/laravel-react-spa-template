import Field from '../field/field';
import style from './text-input.module.scss';

export default function TextInput({
	id,
	label,
	error,
	className,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
	id: string;
	label?: string;
	error?: Array<string> | string;
	className?: string;
}) {
	return (
		<Field id={id} label={label} error={error} className={className}>
			<input id={id} type='text' className={style.input} {...props} />
		</Field>
	);
}
