import { useEffect, useRef, useState } from 'react';

import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import WeatherState from './components/WeatherState';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, error, query, search, retry } = useWeather();
  const mainRef = useRef<HTMLElement>(null);
  const previousStatusRef = useRef(status);

  useEffect(() => {
    if (previousStatusRef.current === 'loading' && status !== 'loading') {
      mainRef.current?.focus();
    }

    previousStatusRef.current = status;
  }, [status]);

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(109,124,255,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(245,185,66,0.08),transparent_32%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <a
              className="flex items-center gap-3 font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent-400"
              href="#main-content"
            >
              <span
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-xl bg-sun text-xl text-night-900"
              >
                ☀
              </span>
              <span>Clima Agora</span>
            </a>
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>
          <SearchBar disabled={status === 'loading'} onSearch={search} />
        </header>

        <main
          aria-busy={status === 'loading'}
          className="flex-1 focus:outline-none"
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
        >
          {status === 'success' && data ? (
            <div className="space-y-8">
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} unit={unit} />
            </div>
          ) : (
            <WeatherState
              onRetry={retry}
              message={error ?? undefined}
              query={query}
              status={status === 'success' ? 'loading' : status}
            />
          )}
        </main>

        <footer className="mt-12 border-t border-white/10 py-5 text-center text-xs text-white/40">
          Dados meteorológicos demonstrativos
        </footer>
      </div>
    </div>
  );
}
