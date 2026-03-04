export const Input = ({ label, className, ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-brand-muted pl-1">{label}</label>}
        <input
            className={`
        w-full px-4 py-3 rounded-lg 
        bg-brand-gray border border-white/10 text-white 
        placeholder:text-white/30 
        focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange 
        transition-colors
        ${className}
      `}
            {...props}
        />
    </div>
);
