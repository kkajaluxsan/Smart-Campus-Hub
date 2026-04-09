import { cx } from '../../theme/tokens';

export function Table({ className, children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
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
        'border-b border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-800',
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ className, children }) {
  return <td className={cx('border-b border-slate-100 px-4 py-3 align-top', className)}>{children}</td>;
}
