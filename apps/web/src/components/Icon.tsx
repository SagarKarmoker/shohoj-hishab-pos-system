interface IconProps {
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
}

export function Icon({ name, className = '', size = 'md' }: IconProps) {
  return (
    <span className={`material-icons-round ${sizeStyles[size]} ${className}`}>
      {name}
    </span>
  )
}