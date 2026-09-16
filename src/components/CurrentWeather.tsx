import { formatTemperature } from '../lib/temperature';
import { describeWeatherCode } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function displayMetric(value: number | null | undefined, suffix: string): string {
  return value == null || !Number.isFinite(value) ? '—' : `${value}${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const location = [city.region, city.country].filter(Boolean).join(', ');
  const condition = describeWeatherCode(current.condition?.code);

  return (
    <section
      aria-labelledby="current-weather-heading"
      aria-live="polite"
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent-400">
            Agora em
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl" id="current-weather-heading">
            {city.name}
          </h1>
          <p className="mt-1 text-sm text-white/70 sm:text-base">
            {location || 'Localização indisponível'}
          </p>
        </div>

        <div className="flex items-center gap-4 md:text-right sm:gap-5">
          <span aria-hidden="true" className="text-5xl sm:text-6xl">
            {condition.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-5xl font-semibold leading-none text-white sm:text-6xl lg:text-7xl">
              {formatTemperature(current.temperatureCelsius, unit)}
            </p>
            <p className="mt-3 font-medium text-white/80">
              {current.condition?.label ?? condition.label}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3 xl:grid-cols-5">
        {[
          ['Sensação', formatTemperature(current.apparentTemperatureCelsius, unit)],
          ['Umidade', displayMetric(current.humidityPercent, '%')],
          ['Vento', displayMetric(current.windSpeedKmh, ' km/h')],
          ['Precipitação', displayMetric(current.precipitationMm, ' mm')],
          ['Pressão', displayMetric(current.pressureHpa, ' hPa')],
        ].map(([label, value]) => (
          <div className="bg-night-800/80 p-4" key={label}>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-white/65">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-white sm:text-base">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
