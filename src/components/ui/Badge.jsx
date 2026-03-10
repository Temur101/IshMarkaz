import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, variant = "default", className }) => {
    const styles = {
        default: "bg-white/10 text-white border-white/10",
        secondary: "bg-white/5 text-brand-muted border-white/10",
        orange: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
        success: "bg-green-500/10 text-green-400 border-green-500/20",
        warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };

    return (
        <span className={twMerge(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
            styles[variant],
            className
        )}>
            {children}
        </span>
    );
};
