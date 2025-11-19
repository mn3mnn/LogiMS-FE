import React from 'react';

type BarItem = {
  key: string | number;
  labelLeft: string;
  labelRight?: string;
  value: number;
};

interface BarListProps {
  title?: string;
  items: BarItem[];
  max?: number; // optional max (else computed)
  colorClass?: string; // tailwind class for bar color
}

const BarList: React.FC<BarListProps> = ({ title, items, max, colorClass = 'bg-[#ffb433]' }) => {
  const computedMax = max ?? Math.max(1, ...items.map(i => i.value || 0));
  return (
    <div className="rounded-xl border p-4">
      {title && <div className="text-sm mb-2 font-medium">{title}</div>}
      <ul className="space-y-2">
        {items.map((i) => {
          const pct = Math.max(0, Math.min(100, (i.value / computedMax) * 100));
          return (
            <li key={i.key}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="truncate mr-2">{i.labelLeft}</span>
                <span className="text-right text-gray-600 tabular-nums">{i.labelRight ?? i.value.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
                <div className={`h-2 ${colorClass}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BarList;


