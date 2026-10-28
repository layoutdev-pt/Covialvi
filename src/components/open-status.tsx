'use client';

import { useEffect, useState } from 'react';

// Opening hours (Portugal time). Matches `company.hours`: Monday to Friday, 9h-13h and 14h-18h.
const TIME_ZONE = 'Europe/Lisbon';
const WEEKDAY_SLOTS: [number, number][] = [
  [9 * 60, 13 * 60],
  [14 * 60, 18 * 60],
];
const OPEN_DAYS = [1, 2, 3, 4, 5]; // Monday = 1 ... Friday = 5
const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

const formatTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** Current weekday (0 = Sunday) and minutes since midnight in Portugal */
function lisbonNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const hour = parseInt(get('hour'), 10) % 24;
  return { day, minutes: hour * 60 + parseInt(get('minute'), 10) };
}

function getStatus() {
  const { day, minutes } = lisbonNow();

  if (OPEN_DAYS.includes(day)) {
    const current = WEEKDAY_SLOTS.find(([start, end]) => minutes >= start && minutes < end);
    if (current) return { open: true, text: `Fecha às ${formatTime(current[1])}` };

    const next = WEEKDAY_SLOTS.find(([start]) => minutes < start);
    if (next) return { open: false, text: `Abre às ${formatTime(next[0])}` };
  }

  // Closed for the day: find the next day with opening hours
  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (day + offset) % 7;
    if (OPEN_DAYS.includes(nextDay)) {
      const label = offset === 1 ? 'amanhã' : DAY_NAMES[nextDay];
      return { open: false, text: `Abre ${label} às ${formatTime(WEEKDAY_SLOTS[0][0])}` };
    }
  }
  return { open: false, text: '' };
}

/**
 * "Aberto agora · Fecha às 18:00" status line, calculated from the opening hours and refreshed every minute.
 */
export function OpenStatus({ tone = 'light', className = '' }: { tone?: 'light' | 'dark'; className?: string }) {
  const [status, setStatus] = useState<ReturnType<typeof getStatus> | null>(null);

  useEffect(() => {
    const update = () => setStatus(getStatus());
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  // Reserve the space before the first calculation so the layout does not jump
  if (!status) return <div className={`h-5 ${className}`} aria-hidden="true" />;

  const strong = tone === 'dark' ? 'text-white' : 'text-foreground';
  const soft = tone === 'dark' ? 'text-white/55' : 'text-muted-foreground';

  return (
    <div className={`flex items-center gap-3 text-sm ${className}`} role="status">
      <span className="relative flex h-2.5 w-2.5">
        {status.open && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status.open ? 'bg-emerald-500' : 'bg-red-500'}`}
        />
      </span>
      <span className={`font-medium ${strong}`}>{status.open ? 'Aberto agora' : 'Fechado'}</span>
      {status.text && (
        <>
          <span className={soft} aria-hidden="true">
            ·
          </span>
          <span className={soft}>{status.text}</span>
        </>
      )}
    </div>
  );
}
