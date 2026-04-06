import { cx } from '../../theme/tokens';

const variants = {
  primary:
    'bg-[#1e4d8c] text-white hover:bg-[#1a4380] focus-visible:ring-[#1e4d8c] shadow-sm',
  secondary:
    'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400',
  outline:
    'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400',
  danger: 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-base rounded-lg font-medium',
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
      className={cx(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
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
