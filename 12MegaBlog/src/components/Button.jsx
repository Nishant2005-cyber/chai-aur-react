import React from "react";

export default function Button({
    children,
    type = "button",
    bgColor = "bg-indigo-600 hover:bg-indigo-700",
    textColor = "text-white",
    className = "",
    ...props
}) {
    return (
        <button
            type={type}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2 ${bgColor} ${textColor} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}