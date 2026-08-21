import React, { useId, useState } from 'react'

const Input = React.forwardRef(function Input({
    label,
    type = "text",
    className = "",
    ...props
}, ref) {
    const id = useId()
    const [showPassword, setShowPassword] = useState(false)
    const isPasswordType = type === "password"
    const inputType = isPasswordType ? (showPassword ? "text" : "password") : type

    return (
        <div className='w-full'>
            {label && (
                <label
                    className='inline-block mb-1.5 pl-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider'
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
            <div className="relative w-full">
                <input
                    type={inputType}
                    className={`px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all duration-200 border border-slate-300 dark:border-slate-700 w-full text-sm ${isPasswordType ? 'pr-11' : ''} ${className}`}
                    ref={ref}
                    {...props}
                    id={id}
                />
                {isPasswordType && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 transition-colors cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
})

export default Input