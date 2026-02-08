import { InputHTMLAttributes } from 'react'
import { Icon } from './Icon'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  label?: string
  error?: string
  helperText?: string
}

export function Input({ 
  icon,
  label,
  error,
  helperText,
  className = '',
  ...props 
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name={icon} />
          </span>
        )}
        <input
          className={`
            w-full 
            ${icon ? 'pl-10' : 'px-4'} 
            pr-4 py-2.5 
            bg-slate-50 dark:bg-slate-900 
            border border-slate-200 dark:border-slate-700 
            rounded-xl 
            focus:ring-2 focus:ring-primary focus:border-primary 
            outline-none
            transition-all
            text-slate-900 dark:text-slate-100
            placeholder:text-slate-400
            ${error ? 'border-error focus:ring-error focus:border-error' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  )
}