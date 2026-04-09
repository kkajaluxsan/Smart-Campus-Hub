import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(function Input(
  { className, label, hint, error, id, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-2xl border bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-slate-900 shadow-sm transition-all duration-300',
            'placeholder:text-slate-400 placeholder:font-medium',
            'focus:bg-white focus:border-uni-blue focus:outline-none focus:ring-4 focus:ring-uni-blue/10',
            'hover:border-slate-300 group-hover:bg-white',
            error ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-100',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        />
      </div>
      {error ? (
        <p className="text-xs font-semibold text-rose-500 ml-1 animate-fade-in">{error}</p>
      ) : hint ? (
        <p className="text-xs font-medium text-slate-400 ml-1">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
