import { Link } from 'react-router-dom';
import { cx } from '../theme/tokens';

export default function PageHeader({ title, description, breadcrumbs = [], actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="mb-2 text-xs text-slate-500" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5">
              {breadcrumbs.map((b, i) => (
                <li key={b.to || b.label} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-300">/</span>}
                  {b.to ? (
                    <Link to={b.to} className="hover:text-[#1e4d8c]">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-slate-600">{b.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className={cx('text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl')}>{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
