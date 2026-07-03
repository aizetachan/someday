'use client';

import { useState } from 'react';
import {
  DATE_PRESETS,
  DEFAULT_DELIVERY_TIME,
  formatDateEs,
  humanDistance,
  maxDeliveryYmd,
  minDeliveryYmd,
  presetToYmd,
  toYmdString,
} from '@/lib/dates';

/**
 * Selector de entrega: presets como tarjetas + fecha y hora exactas.
 * Siempre muestra la traducción humana de lo elegido.
 */
export function DatePicker({
  ymd,
  time,
  onChange,
}: {
  ymd: string; // "YYYY-MM-DD" o ''
  time: string; // "HH:MM"
  onChange: (patch: { deliveryYmd?: string; deliveryTime?: string }) => void;
}) {
  const [custom, setCustom] = useState(false);

  const selectedDate = ymd ? parseYmdTime(ymd, time) : null;
  const now = new Date();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DATE_PRESETS.map((preset) => {
          const { y, m, d } = presetToYmd(preset.months);
          const presetYmd = toYmdString(new Date(y, m - 1, d));
          const active = !custom && ymd === presetYmd;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                setCustom(false);
                onChange({ deliveryYmd: presetYmd, deliveryTime: DEFAULT_DELIVERY_TIME });
              }}
              className={`rounded-[4px] border p-4 text-left transition-colors ${
                active
                  ? 'border-seal bg-seal/5'
                  : 'border-ink-soft/20 hover:border-ink-soft/50'
              }`}
            >
              <span className="block font-serif text-lg text-ink">{preset.label}</span>
              <span className="mt-1 block font-mono text-xs text-gold">
                {formatDateEs(new Date(y, m - 1, d))}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCustom(true)}
          className={`rounded-[4px] border p-4 text-left transition-colors ${
            custom
              ? 'border-seal bg-seal/5'
              : 'border-ink-soft/20 hover:border-ink-soft/50'
          }`}
        >
          <span className="block font-serif text-lg text-ink">Fecha y hora exactas</span>
          <span className="mt-1 block text-xs text-ink-soft">
            un cumpleaños, un aniversario, una medianoche…
          </span>
        </button>
      </div>

      {custom && (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Día</span>
            <input
              type="date"
              value={ymd}
              min={minDeliveryYmd()}
              max={maxDeliveryYmd()}
              onChange={(e) => onChange({ deliveryYmd: e.target.value })}
              className="w-full rounded-[4px] border border-ink-soft/30 bg-white/60 px-3.5 py-2.5 text-ink focus:border-seal focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Hora de entrega</span>
            <input
              type="time"
              value={time}
              onChange={(e) =>
                onChange({ deliveryTime: e.target.value || DEFAULT_DELIVERY_TIME })
              }
              className="w-full rounded-[4px] border border-ink-soft/30 bg-white/60 px-3.5 py-2.5 text-ink focus:border-seal focus:outline-none"
            />
          </label>
        </div>
      )}

      {selectedDate && (
        <p className="rounded-[4px] bg-paper-warm px-4 py-3 text-sm text-ink">
          Se entregará el <strong>{formatDateEs(selectedDate)}</strong> a las{' '}
          <strong>{time}</strong> — dentro de {humanDistance(now, selectedDate)}.
        </p>
      )}
    </div>
  );
}

export function parseYmdTime(ymd: string, time = '00:00'): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0);
}
