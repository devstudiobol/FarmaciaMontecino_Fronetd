import * as React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={`rounded-md border bg-gray-800 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
);

Input.displayName = 'Input';
