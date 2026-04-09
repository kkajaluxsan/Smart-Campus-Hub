/** Design tokens — university portal (light content + dark sidebar) */
export const tokens = {
  brand: {
    name: 'Campus Portal',
    short: 'CP',
    tagline: 'Smart Campus Operations Hub',
  },
  sidebar: {
    width: '16rem',
    bg: 'bg-slate-900',
    border: 'border-white/5',
  },
};

export const cx = (...parts) => parts.filter(Boolean).join(' ');
