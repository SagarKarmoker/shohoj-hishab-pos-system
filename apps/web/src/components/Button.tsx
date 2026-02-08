import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  isLoading?: boolean
}

const variantStyles = {
  primary: 'bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all active:scale-95',
  secondary: 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95',
  outline: 'border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:border-primary hover:text-primary transition-all active:scale-95',
  ghost: 'text-slate-600 dark:text-slate-400 hover:text-primary transition-colors',
}

const sizeStyles = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5',
  lg: 'px-8 py-3 text-lg',
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  disabled,
  isLoading,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}