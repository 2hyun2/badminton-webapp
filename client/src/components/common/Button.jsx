import React from 'react'

export const Button = ({
        children,
        onClick,
        variant = 'gray',
        size = 'sm',
        icon: Icon,
        className = '',
        disabled = false
}) => {

        const baseStyles = "inline-flex items-center justify-center rounded font-bold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed";

        const variants = {
                blue: "bg-blue-500 hover:bg-blue-600 text-white",
                red: "bg-red-500 hover:bg-red-600 text-white",
                gray: "bg-slate-100 hover:bg-slate-200 text-slate-700",
                outline: "border-2 border-slate-200 hover:bg-slate-50 text-slate-600"
        };

        const sizes = {
                flex: "flex-1 px-4 py-2 text-sm",
                sm: "px-4 py-2 text-sm",
                md: "p-4 text-lg w-full",
                lg: "px-8 py-4 text-xl"
        };

        return (
                <button
                        type='button'
                        onClick={onClick}
                        disabled={disabled}
                        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                >
                        {Icon && <Icon className="w-5 h-5 mr-2" />}
                        {children}
                </button>
        );
};
