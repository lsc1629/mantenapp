import React from 'react'
import { clsx } from 'clsx'
import { LucideIcon } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  onRightIconClick?: () => void
  required?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onRightIconClick,
    required,
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium text-gray-700 mb-1',
              required && "after:content-['*'] after:text-danger-500 after:ml-1"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LeftIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200',
              'focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10',
              error && 'border-danger-300 focus:border-danger-500 focus:ring-danger-500',
              className
            )}
            {...props}
          />
          
          {RightIcon && (
            <div 
              className={clsx(
                'absolute inset-y-0 right-0 pr-3 flex items-center',
                onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
              )}
              onClick={onRightIconClick}
            >
              <RightIcon className={clsx(
                'h-5 w-5',
                error ? 'text-danger-400' : 'text-gray-400',
                onRightIconClick && 'hover:text-gray-600'
              )} />
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={clsx(
            'mt-1 text-sm',
            error ? 'text-danger-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
