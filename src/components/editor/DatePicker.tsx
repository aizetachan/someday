'use client';

import { useState } from 'react';
import {
  DATE_PRESETS,
  formatDateEs,
  humanDistance,
  maxDeliveryYmd,
  minDeliveryYmd,
  presetToYmd,
  toYmdString,
} from '@/lib/dates';

/**
 * Selector de fecha: presets grandes como tarjetas + fecha exacta.
 * Siempre muestra la traducción humana de la fecha elegida.
 */
export function DatePicker({
  value,
  onChange,
}: {
  value: string; // "YYYY-MM-DD" o ''
  onChange: (ymd: string) => void;
}) {
  const [custom, setCustom] = useState(false);

  const selectedDate = value ? parseYmd(value) : null;
  const now = new Date();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DATE_PRESETS.map((preset) => {
          const { y, m, d } = presetToYmd(preset.months);
          const ymd = toYmdString(new Date(y, m - 1, d));
          const active = !custom && value === ymd;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                setCustom(false);
                onChange(ymd);
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
          <span className="block font-serif text-lg text-ink">Fecha exacta</span>
          <span className="mt-1 block text-xs text-ink-soft">
            un cumpleaños, un aniversario…
          </span>
        </button>
      </div>

      {custom && (
        <input
          type="date"
          value={value}
          min={minDeliveryYmd()}
          max={maxDeliveryYmd()}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-[4px] border border-ink-soft/30 bg-white/60 px-3.5 py-2.5 text-ink focus:border-seal focus:outline-none"
        />
      )}

      {selectedDate && (
        <p className="rounded-[4px] bg-paper-warm px-4 py-3 text-sm text-ink">
          Se entregará el <strong>{formatDateEs(selectedDate)}</strong> — dentro de{' '}
          {humanDistance(now, selectedDate)}.
        </p>
      )}
    </div>
  );
}

export function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}
