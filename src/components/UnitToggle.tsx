import type { KeyboardEvent } from 'react';
import { useRef } from 'react';

import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: Array<{ value: Unit; label: string }> = [
  { value: 'celsius', label: '°C' },
  { value: 'fahrenheit', label: '°F' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const nextIndex =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? (index + 1) % units.length
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? (index - 1 + units.length) % units.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? units.length - 1
              : null;

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1"
      role="group"
    >
      {units.map((option, index) => (
        <button
          aria-label={option.label}
          aria-pressed={unit === option.value}
          className="min-h-10 min-w-12 rounded-lg px-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 aria-pressed:bg-accent-500 aria-pressed:text-night-900"
          key={option.value}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          ref={(element) => {
            buttonRefs.current[index] = element;
          }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
