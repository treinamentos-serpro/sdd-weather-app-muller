import { useCallback, useRef, useState } from 'react';

import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { type: 'search'; name: string } | { type: 'selectCity'; city: City };

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.';

function getErrorMessage(error: unknown): string {
  return error instanceof WeatherServiceError ? error.message : DEFAULT_ERROR_MESSAGE;
}

/** Orquestra busca de cidades e clima, expondo uma máquina de estados única. */
export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const lastOperationRef = useRef<LastOperation | null>(null);

  const loadCityWeather = useCallback(async (city: City) => {
    setStatus('loading');
    setError(null);

    try {
      const weather = await getWeather(city);
      setData(weather);
      setStatus('success');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, []);

  const search = useCallback(async (name: string) => {
    lastOperationRef.current = { type: 'search', name };
    setQuery(name);
    setStatus('loading');
    setData(null);
    setError(null);
    setCities([]);

    try {
      const results = await searchCities(name);
      setCities(results);

      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      setStatus('success');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, []);

  const selectCity = useCallback(
    async (city: City) => {
      lastOperationRef.current = { type: 'selectCity', city };
      setQuery(city.name);
      await loadCityWeather(city);
    },
    [loadCityWeather],
  );

  const retry = useCallback(async () => {
    const lastOperation = lastOperationRef.current;

    if (!lastOperation) {
      return;
    }

    if (lastOperation.type === 'search') {
      await search(lastOperation.name);
      return;
    }

    await selectCity(lastOperation.city);
  }, [search, selectCity]);

  return { status, data, cities, error, query, search, selectCity, retry };
}
