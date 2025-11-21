'use client';

import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  padding?: string;
}

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary',
  padding = 'px-4 py-2',
}: ButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressStart = () => setIsPressed(true);
  const handlePressEnd = () => setIsPressed(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      handlePressStart();
    }
  };

  const pressHandlers = {
    onMouseDown: handlePressStart,
    onMouseUp: handlePressEnd,
    onMouseLeave: handlePressEnd,
    onTouchStart: handlePressStart,
    onTouchEnd: handlePressEnd,
    onKeyDown: handleKeyDown,
    onKeyUp: handlePressEnd,
  };

  if (variant === 'secondary') {
    return (
      <div
        className={`linear-border transition-transform duration-150 ${
          isPressed ? 'scale-95' : ''
        }`}
      >
        <button
          onClick={onClick}
          {...pressHandlers}
          className={`linear-border__inner rounded-lg font-regular transition-colors text-normal items-center justify-center bg-white text-black hover:text-white hover:bg-linear-to-r hover:from-(--color-light-blue) hover:to-(--color-purple) ${padding}`}
        >
          {children}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      {...pressHandlers}
      className={`
        rounded-lg font-regular text-normal items-center justify-center transition-transform duration-150
        button-primary text-white ${padding} ${isPressed ? 'button-primary--pressed scale-95' : ''}
      `}
    >
      {children}
    </button>
  );
};

export default Button;

