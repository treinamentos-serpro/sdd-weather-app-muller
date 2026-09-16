import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'Seattle',
  country: 'Estados Unidos',
  admin1: 'Washington',
  latitude: 47.6,
  longitude: -122.33,
};

function mockFetch(body: unknown, ok = true): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  } as Response);
}

describe('weatherService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('searchCities', () => {
    it('returns an empty list without fetching for blank input', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      await expect(searchCities('   ')).resolves.toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('maps geocoding results to cities', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch({
          results: [
            {
              id: 1,
              name: 'Seattle',
              country: 'Estados Unidos',
              admin1: 'Washington',
              latitude: 47.6,
              longitude: -122.33,
            },
          ],
        }),
      );

      const result = await searchCities('Seattle');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ ...city, region: 'Washington' });
    });

    it('returns an empty list when results are absent', async () => {
      vi.stubGlobal('fetch', mockFetch({}));

      await expect(searchCities('xyzxyz')).resolves.toEqual([]);
    });

    it('encodes special characters in the search term', async () => {
      const fetchSpy = mockFetch({ results: [] });
      vi.stubGlobal('fetch', fetchSpy);

      await searchCities('São Paulo & Co.');

      const [requestUrl] = fetchSpy.mock.calls[0] as [string];
      expect(new URL(requestUrl).searchParams.get('name')).toBe('São Paulo & Co.');
    });

    it('throws WeatherServiceError for a non-ok response', async () => {
      vi.stubGlobal('fetch', mockFetch({}, false));

      await expect(searchCities('Seattle')).rejects.toMatchObject({
        kind: 'api',
        message: 'Não foi possível localizar cidades. Tente novamente.',
      });
    });

    it('returns a friendly network error when the connection is offline', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

      await expect(searchCities('Seattle')).rejects.toMatchObject({
        kind: 'network',
        message: 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
      });
    });
  });

  describe('getWeather', () => {
    it('maps current and daily data to five forecast days', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch({
          current: {
            time: '2026-06-16T12:00',
            temperature_2m: 18,
            relative_humidity_2m: 80,
            wind_speed_10m: 10,
            surface_pressure: 1015,
            precipitation: 0,
            weather_code: 3,
          },
          daily: {
            time: ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20'],
            weather_code: [3, 61, 80, 1, 0],
            temperature_2m_max: [20, 19, 22, 24, 25],
            temperature_2m_min: [12, 11, 13, 14, 15],
            precipitation_probability_max: [20, 90, 70, 10, null],
          },
        }),
      );

      const data = await getWeather(city);

      expect(data.city).toEqual(city);
      expect(data.current.temperatureCelsius).toBe(18);
      expect(data.forecast).toHaveLength(5);
      expect(data.forecast[0].condition?.label).toBe('Nublado');
      expect(data.forecast[4].precipitationProbability).toBeNull();
    });

    it('throws WeatherServiceError when current or daily data is absent', async () => {
      vi.stubGlobal('fetch', mockFetch({}));

      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('throws WeatherServiceError for a non-ok forecast response', async () => {
      vi.stubGlobal('fetch', mockFetch({}, false));

      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('throws WeatherServiceError when the forecast request fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network failure')));

      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('aborts a stalled request after five seconds', async () => {
      vi.useFakeTimers();
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_, options: RequestInit = {}) =>
            new Promise((_, reject) => {
              options.signal?.addEventListener('abort', () => {
                reject(new DOMException('The operation was aborted.', 'AbortError'));
              });
            }),
        ),
      );

      const request = getWeather(city);
      const rejection = expect(request).rejects.toMatchObject({
        kind: 'timeout',
        message: 'A conexão demorou mais que o esperado. Tente novamente.',
      });
      await vi.advanceTimersByTimeAsync(5_000);

      await rejection;
      vi.useRealTimers();
    });

    it('preserves five forecast positions when daily data is partial', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch({
          current: {
            temperature_2m: 18,
          },
          daily: {
            time: ['2026-06-16'],
            temperature_2m_min: [12],
            temperature_2m_max: [20],
            precipitation_probability_max: [null],
          },
        }),
      );

      const data = await getWeather(city);

      expect(data.forecast).toHaveLength(5);
      expect(data.current.condition).toBeNull();
      expect(data.forecast[0].precipitationProbability).toBeNull();
      expect(data.forecast[1]).toEqual({
        date: null,
        minTemperatureCelsius: null,
        maxTemperatureCelsius: null,
        precipitationProbability: null,
        condition: null,
      });
    });

    it('normalizes null current fields and missing forecast fields', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch({
          current: {
            time: null,
            temperature_2m: null,
            apparent_temperature: null,
            relative_humidity_2m: null,
            wind_speed_10m: null,
            precipitation: null,
            surface_pressure: null,
            weather_code: null,
          },
          daily: {
            time: [null],
            temperature_2m_min: [null],
            temperature_2m_max: [null],
            precipitation_probability_max: [null],
            weather_code: [null],
          },
        }),
      );

      const data = await getWeather(city);

      expect(data.current).toMatchObject({
        temperatureCelsius: null,
        apparentTemperatureCelsius: null,
        humidityPercent: null,
        windSpeedKmh: null,
        precipitationMm: null,
        pressureHpa: null,
        condition: null,
        observedAt: null,
      });
      expect(data.forecast[0]).toMatchObject({
        date: null,
        minTemperatureCelsius: null,
        maxTemperatureCelsius: null,
        precipitationProbability: null,
        condition: null,
      });
    });

    it('ignores geocoding results missing required fields', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch({
          results: [
            null,
            { id: 1, name: null, latitude: 1, longitude: 2 },
            { id: 2, name: 'Seattle', latitude: null, longitude: -122.33 },
          ],
        }),
      );

      await expect(searchCities('Seattle')).resolves.toEqual([]);
    });
  });
});
