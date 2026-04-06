import { cx } from '../../theme/tokens';

export function Card({ className, children }) {
  return (
    <div
      className={cx(
        'rounded-xl border border-slate-200/80 bg-white shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cx('border-b border-slate-100 px-5 py-4', className)}>{children}</div>
  );
}

export function CardTitle({ className, children }) {
  return <h3 className={cx('text-base font-semibold text-slate-900', className)}>{children}</h3>;
}

export function CardDescription({ className, children }) {
  return <p className={cx('mt-1 text-sm text-slate-500', className)}>{children}</p>;
}

export function CardContent({ className, children }) {
  return <div className={cx('px-5 py-4', className)}>{children}</div>;
}
