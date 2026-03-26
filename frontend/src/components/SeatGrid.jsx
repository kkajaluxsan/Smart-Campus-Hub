import { useMemo } from 'react';

/** seats: { id, seatLabel, availability }[] — availability: AVAILABLE | BOOKED */
export default function SeatGrid({ seats, selectedIds, onToggle }) {
  const rows = useMemo(() => {
    const map = new Map();
    seats.forEach((s) => {
      const m = s.seatLabel.match(/^([A-Za-z]+)(\d+)$/);
      const rowKey = m ? m[1] : '_';
      if (!map.has(rowKey)) map.set(rowKey, []);
      map.get(rowKey).push(s);
    });
    map.forEach((arr) => arr.sort((a, b) => a.seatLabel.localeCompare(b.seatLabel, undefined, { numeric: true })));
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [seats]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-emerald-500/80 shadow seat-btn" /> Available
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-red-600/90 shadow" /> Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-amber-400 shadow" /> Selected
        </span>
      </div>
      {rows.map(([rowKey, rowSeats]) => (
        <div key={rowKey} className="flex flex-wrap items-center gap-2">
          <span className="w-8 text-slate-500 text-sm font-mono">{rowKey}</span>
          <div className="flex flex-wrap gap-2">
            {rowSeats.map((s) => {
              const booked = s.availability === 'BOOKED';
              const selected = selectedIds.includes(s.id);
              let cls =
                'seat-btn min-w-[2.75rem] h-9 px-2 border ';
              if (booked) {
                cls += 'bg-red-900/60 border-red-700 text-red-200 cursor-not-allowed opacity-80';
              } else if (selected) {
                cls +=
                  'bg-amber-400 text-slate-900 border-amber-300 ring-2 ring-amber-200/50 scale-105 shadow-lg';
              } else {
                cls +=
                  'bg-emerald-600/80 border-emerald-500 text-white hover:bg-emerald-500 cursor-pointer';
              }
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={booked}
                  onClick={() => !booked && onToggle(s.id)}
                  className={cls}
                >
                  {s.seatLabel}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
