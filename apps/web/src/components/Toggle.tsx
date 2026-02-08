interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div 
        className="
          relative w-11 h-6 bg-slate-200 
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 
          rounded-full peer 
          dark:bg-slate-700 
          peer-checked:after:translate-x-full 
          rtl:peer-checked:after:-translate-x-full 
          peer-checked:after:border-white 
          after:content-[''] 
          after:absolute 
          after:top-[2px] 
          after:start-[2px] 
          after:bg-white 
          after:border-gray-300 
          after:border 
          after:rounded-full 
          after:h-5 
          after:w-5 
          after:transition-all 
          dark:border-gray-600 
          peer-checked:bg-primary
        "
      />
      {label && (
        <span className="ms-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
    </label>
  )
}