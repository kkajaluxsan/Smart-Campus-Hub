import { cx } from '../../theme/tokens';

export function Table({ className, children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/60 bg-white shadow-sm">
      <table className={cx('w-full min-w-[640px] text-left text-sm text-slate-700', className)}>
        {children}
      </table>
    </div>
  );
}

export function Th({ className, children }) {
  return (
    <th
      className={cx(
        'border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500',
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ className, children }) {
  return <td className={cx('border-b border-slate-50 px-5 py-3.5 align-top', className)}>{children}</td>;
}
