import { cn } from '../../utils/cn';

export function Card({ className, children, glass = false }) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border transition-all duration-300',
        glass 
          ? 'bg-white/70 backdrop-blur-xl border-white/40 shadow-glass' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-soft-xl',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('px-8 py-6 border-b border-slate-50/50', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn('text-xl font-display font-bold tracking-tight text-slate-900', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children }) {
  return (
    <p className={cn('mt-2 text-sm font-medium leading-relaxed text-slate-500', className)}>
      {children}
    </p>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn('px-8 py-6', className)}>{children}</div>;
}
