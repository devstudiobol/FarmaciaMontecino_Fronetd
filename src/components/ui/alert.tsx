import * as React from "react"
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { type: 'error' | 'success' }
>(({ className, type, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={`relative w-full rounded-lg border p-4 
      ${type === 'error' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'} 
      shadow-lg ${className}`}
    {...props}
  >
    <div className="flex items-center">
      <div className="mr-3">
        {type === 'error' ? (
          <FaExclamationCircle className="text-2xl" />
        ) : (
          <FaCheckCircle className="text-2xl" />
        )}
      </div>
      <div className="flex-1">
        {props.children}
      </div>
    </div>
  </div>
))

Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm leading-relaxed ${className}`}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }
