import { forwardRef } from 'react';
import { cx } from '../../theme/tokens';

const Select = forwardRef(function Select(
  { className, label, hint, error, id, children, ...rest },
  ref
) {
  const sid = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={sid} className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={sid}
        className={cx(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
          'focus:border-[#1e4d8c] focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]/25',
          error ? 'border-red-400' : 'border-slate-300',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Select;
