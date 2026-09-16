import { formatDayLabel, formatTemperature } from '../lib/format';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

const weatherIcons: Record<string, string> = {
  'clear-day': '☀️',
  cloudy: '☁️',
  fog: '🌫️',
  'partly-cloudy': '⛅',
  rain: '🌧️',
  snow: '🌨️',
  thunderstorm: '⛈️',
};

function formatPrecipitationProbability(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }

  return `${Math.round(value)}%`;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const dayLabel = formatDayLabel(day.date);
  const conditionLabel = day.condition?.label ?? 'Condição indisponível';
  const weatherIcon = day.condition ? (weatherIcons[day.condition.iconKey] ?? '🌤️') : '—';

  return (
    <article
      aria-label={`Previsão para ${dayLabel}`}
      className="flex min-h-[15rem] w-full flex-col items-center rounded-xl border border-white/10 bg-white/5 p-4 text-center shadow-glass backdrop-blur-md"
    >
      <h3 className="text-sm font-semibold capitalize text-white/95">{dayLabel}</h3>

      <span aria-label={conditionLabel} className="my-3 text-4xl" role="img">
        {weatherIcon}
      </span>
      <p className="min-h-[2.5rem] text-sm leading-5 text-white/80">{conditionLabel}</p>

      <dl className="mt-auto grid w-full grid-cols-2 gap-2 border-t border-white/10 pt-3">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/65">Máx.</dt>
          <dd className="font-semibold text-sun">
            {formatTemperature(day.maxTemperatureCelsius, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/65">Mín.</dt>
          <dd className="font-semibold text-white">
            {formatTemperature(day.minTemperatureCelsius, unit)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-white/75">
        Chuva{' '}
        <strong className="font-semibold text-white">
          {formatPrecipitationProbability(day.precipitationProbability)}
        </strong>
      </p>
    </article>
  );
}
