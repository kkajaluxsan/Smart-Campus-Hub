import { forwardRef } from 'react';
import { cx } from '../../theme/tokens';

const Textarea = forwardRef(function Textarea(
  { className, label, hint, error, id, ...rest },
  ref
) {
  const tid = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={tid} className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={tid}
        className={cx(
          'min-h-[88px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
          'placeholder:text-slate-400',
          'focus:border-[#1e4d8c] focus:outline-none focus:ring-2 focus:ring-[#1e4d8c]/25',
          error ? 'border-red-400' : 'border-slate-300',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Textarea;
