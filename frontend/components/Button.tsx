'use client';

import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary' 
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
        className={`linear-border linear-border--dark-hover inline-flex transition-transform duration-150 ${
          isPressed ? 'scale-95' : ''
        }`}
      >
        <button
          onClick={onClick}
          {...pressHandlers}
          className="linear-border__inner rounded-lg font-regular transition-colors text-normal items-center justify-center px-4 py-2 bg-white text-black hover:bg-gray-100"
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
        rounded-lg font-regular text-normal items-center justify-center px-4 py-2 transition-transform duration-150
        button-primary text-white ${isPressed ? 'button-primary--pressed scale-95' : ''}
      `}
    >
      {children}
    </button>
  );
};

export default Button;

