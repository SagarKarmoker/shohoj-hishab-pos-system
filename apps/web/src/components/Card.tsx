import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  glass?: boolean
}

const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg shadow-slate-200/50 dark:shadow-none',
  xl: 'shadow-xl shadow-slate-200/50 dark:shadow-none',
}

export function Card({ 
  children, 
  className = '', 
  shadow = 'lg',
  glass = false,
}: CardProps) {
  return (
    <div 
      className={`
        bg-white dark:bg-slate-800 
        rounded-[24px] 
        border border-slate-100 dark:border-slate-700
        ${shadowStyles[shadow]}
        ${glass ? 'glass-card' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}