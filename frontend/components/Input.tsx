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
    'p-0.25',
    'rounded-lg',
    'linear-border--dark-hover',
    'inline-flex',
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const innerClasses = [
    'linear-border__inner',
    'rounded-[0.4375rem]',
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

