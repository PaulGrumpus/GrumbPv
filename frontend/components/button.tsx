'use client';

import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'disable';
  padding?: string;
  borderRadius?: string;
  borderInnerRadius?: string;
}

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary',
  padding = 'px-4 py-2',
  borderRadius = 'rounded-lg',
  borderInnerRadius = 'rounded-[0.4375rem]',
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
        className={`
          linear-border 
          transition-transform 
          duration-150 
          p-0.25
          ${ isPressed ? 'scale-95' : ''}
          ${borderRadius}
        `}
      >
        <button
          onClick={onClick}
          {...pressHandlers}
          className={`
            linear-border__inner font-regular cursor-pointer transition-colors text-normal items-center justify-center bg-white text-[#7E3FF2] hover:text-white hover:bg-linear-to-r hover:from-(--color-light-blue) hover:to-(--color-purple) 
            ${padding}
            ${borderInnerRadius}
          `}
        >
          {children}
        </button>
      </div>
    );
  }

  if (variant === 'disable') {
    return (
      <div
        className={`transition-transform duration-150 ${
          isPressed ? 'scale-95' : ''
        }`}
      >
        <button
          onClick={() => {}}
          {...pressHandlers}
          className={`rounded-lg font-regular text-normal items-center justify-center bg-white text-gray-500 border border-gray-500 cursor-not-allowed ${padding}`}
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
        rounded-lg font-regular text-normal items-center justify-center transition-transform duration-150 cursor-pointer
        button-primary text-white ${padding} ${isPressed ? 'button-primary--pressed scale-95' : ''}
      `}
    >
      {children}
    </button>
  );
};

export default Button;

