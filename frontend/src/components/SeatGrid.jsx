import { useMemo, useState } from 'react';
import Button from './ui/Button';

/** seats: { id, seatLabel, availability }[] — availability: AVAILABLE | BOOKED */
export default function SeatGrid({ seats, selectedIds, onToggle }) {
  const [zoom, setZoom] = useState(1);

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

  const pickBestAvailable = () => {
    const first = seats.find((s) => s.availability === 'AVAILABLE');
    if (first && !selectedIds.includes(first.id)) onToggle(first.id);
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-white/90 px-4 py-3 backdrop-blur-md shadow-sm">
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-emerald-500 shadow-sm" /> Available
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-rose-500 shadow-sm" /> Booked
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-amber-400 shadow-sm" /> Selected
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={pickBestAvailable}>
            Pick first available
          </Button>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            Zoom
            <input
              type="range"
              min="0.85"
              max="1.25"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-24"
            />
          </label>
        </div>
      </div>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="inline-block min-w-full">
        {rows.map(([rowKey, rowSeats]) => (
          <div key={rowKey} className="mb-3 flex flex-wrap items-center gap-2">
            <span className="w-10 text-right text-sm font-semibold text-slate-600">{rowKey}</span>
            <div className="flex flex-wrap gap-2">
              {rowSeats.map((s) => {
                const booked = s.availability === 'BOOKED';
                const selected = selectedIds.includes(s.id);
                let cls =
                  'min-w-[2.75rem] h-9 px-2 border rounded-lg transition-all duration-200 text-sm font-semibold';
                if (booked) {
                  cls += ' bg-rose-100 border-rose-200 text-rose-700 cursor-not-allowed opacity-70';
                } else if (selected) {
                  cls +=
                    ' bg-amber-400 text-slate-900 border-amber-500 ring-2 ring-amber-200 scale-105 shadow-lg';
                } else {
                  cls +=
                    ' bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-400 cursor-pointer shadow-sm';
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
    </div>
  );
}
