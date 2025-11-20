import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

const Input = ({
  className = '',
  wrapperClassName = '',
  type = 'text',
  ...props
}: InputProps) => {
  const wrapperClasses = [
    'linear-border',
    'linear-border--dark-hover',
    'inline-flex',
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const innerClasses = [
    'linear-border__inner',
    'text-normal',
    'font-roboto',
    'font-regular',
    'p-3',
    'bg-white',
    'w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      <input
        type={type}
        className={innerClasses}
        {...props}
      />
    </div>
  );
};

export default Input;

