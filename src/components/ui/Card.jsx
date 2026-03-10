export const Card = ({ children, className, hover = false, ...props }) => (
    <div
        className={`
      bg-brand-gray rounded-2xl border border-white/5 p-6 
      ${hover ? 'hover:border-brand-orange/50 transition-colors cursor-pointer group' : ''}
      ${className}
    `}
        {...props}
    >
        {children}
    </div>
);
