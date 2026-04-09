import { Link } from 'react-router-dom';
import { cx } from '../theme/tokens';

export default function PageHeader({ title, description, breadcrumbs = [], actions, className }) {
  return (
    <div className={cx("mb-8 flex flex-col gap-4 border-b border-slate-200/50 pb-6 sm:flex-row sm:items-start sm:justify-between animate-fade-in", className)}>
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="mb-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              {breadcrumbs.map((b, i) => (
                <li key={b.to || b.label} className="flex items-center gap-2">
                  {i > 0 && <span className="text-slate-300">/</span>}
                  {b.to ? (
                    <Link to={b.to} className="transition-colors hover:text-blue-600">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-slate-700">{b.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className={cx('text-3xl font-display font-bold tracking-tight text-slate-900 sm:text-4xl')}>{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 flex-wrap gap-3 animate-slide-up">{actions}</div>}
    </div>
  );
}
