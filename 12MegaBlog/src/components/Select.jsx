import React, { useId } from 'react'

function Select({
    options,
    label,
    className = "",
    ...props
}, ref) {
    const id = useId()
    return (
        <div className='w-full'>
            {label && (
                <label
                    htmlFor={id}
                    className='inline-block mb-1.5 pl-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider'
                >
                    {label}
                </label>
            )}
            <select
                {...props}
                id={id}
                ref={ref}
                className={`px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all duration-200 border border-gray-200 dark:border-slate-700 w-full text-sm ${className}`}
            >
                {options?.map((option) => (
                    <option key={option} value={option} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {option}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default React.forwardRef(Select)