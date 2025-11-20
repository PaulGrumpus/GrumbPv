interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary' 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-lg font-regular transition-colors text-normal text-white items-center justify-center px-4 py-2
        ${variant === 'primary' 
          ? 'button-primary' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }
      `}
    >
      {children}
    </button>
  );
}

