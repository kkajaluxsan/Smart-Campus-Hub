import { cn } from '../../utils/cn';

const variants = {
  primary:
    'bg-gradient-to-br from-uni-blue to-uni-indigo text-white shadow-lg shadow-uni-blue/25 hover:shadow-uni-blue/40 hover:-translate-y-0.5 active:translate-y-0 border-b-4 border-black/10',
  secondary:
    'bg-white/80 backdrop-blur-md text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0',
  outline:
    'bg-transparent text-uni-blue border-2 border-uni-blue/20 hover:border-uni-blue hover:bg-uni-blue/5 active:translate-y-0',
  danger:
    'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 border-b-4 border-black/10',
  ghost: 
    'bg-transparent text-slate-500 hover:bg-slate-100/50 hover:text-slate-900',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg font-semibold',
  md: 'px-5 py-2.5 text-sm rounded-xl font-bold tracking-tight',
  lg: 'px-8 py-4 text-base rounded-2xl font-extrabold tracking-tight',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  type = 'button',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uni-blue/50 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none disabled:grayscale',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
