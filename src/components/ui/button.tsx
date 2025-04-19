import * as React from 'react';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`rounded-md bg-blue-600 hover:bg-blue-500 text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = 'Button';
