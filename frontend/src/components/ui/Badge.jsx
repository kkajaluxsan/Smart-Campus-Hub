import { cn } from '../../utils/cn';

const tones = {
  default: 'bg-slate-100 text-slate-600 border-slate-200/50',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/50',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/50',
  info: 'bg-sky-50 text-sky-700 border-sky-200/50',
  violet: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
};

export default function Badge({ tone = 'default', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        tones[tone] || tones.default,
        className
      )}
    >
      {children}
    </span>
  );
}
