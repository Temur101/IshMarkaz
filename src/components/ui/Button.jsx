import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ children, variant = "primary", size = "md", className, ...props }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-brand-orange text-white hover:bg-orange-600 focus:ring-brand-orange border border-transparent shadow-lg shadow-orange-500/20",
        secondary: "bg-brand-gray text-white border border-white/10 hover:bg-white/10 hover:border-white/20 focus:ring-brand-gray",
        ghost: "bg-transparent text-brand-muted hover:text-white hover:bg-white/5",
        outline: "border border-brand-muted text-brand-text hover:border-brand-orange hover:text-brand-orange bg-transparent"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-8 py-3.5 text-lg font-semibold",
        icon: "w-10 h-10 flex items-center justify-center p-0",
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
};
