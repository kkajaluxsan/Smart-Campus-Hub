import { cx } from '../../theme/tokens';

const tones = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-sky-50 text-sky-900 border-sky-200',
  violet: 'bg-violet-50 text-violet-900 border-violet-200',
};

export default function Badge({ tone = 'default', className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        tones[tone] || tones.default,
        className
      )}
    >
      {children}
    </span>
  );
}
