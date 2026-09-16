export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  country?: string;
  region?: string;
  admin1?: string;
  admin2?: string;
  latitude: number;
  longitude: number;
}

export interface WeatherCondition {
  code: number;
  label: string;
  iconKey: string;
}

export interface CurrentWeather {
  temperatureCelsius: number | null;
  apparentTemperatureCelsius: number | null;
  humidityPercent: number | null;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
  pressureHpa: number | null;
  condition: WeatherCondition | null;
  observedAt: string | null;
}

export interface ForecastDay {
  date: string | null;
  minTemperatureCelsius: number | null;
  maxTemperatureCelsius: number | null;
  precipitationProbability: number | null;
  condition: WeatherCondition | null;
}

export type FiveDayForecast = [ForecastDay, ForecastDay, ForecastDay, ForecastDay, ForecastDay];

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: FiveDayForecast;
  fetchedAt: string;
}

export interface AppError {
  kind: 'network' | 'api' | 'timeout' | 'invalid-payload';
  message: string;
  retryable: boolean;
}

export interface GeocodingResult {
  id?: number | null;
  name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  country?: string | null;
  admin1?: string | null;
  admin2?: string | null;
}

export interface GeocodingResponse {
  results?: Array<GeocodingResult | null> | null;
}

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'Sao Paulo',
    country: 'Brasil',
    region: 'Sao Paulo',
    admin1: 'Sao Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
  },
  current: {
    temperatureCelsius: 24,
    apparentTemperatureCelsius: 25,
    humidityPercent: 68,
    windSpeedKmh: 14,
    precipitationMm: 0,
    pressureHpa: 1014,
    condition: {
      code: 2,
      label: 'Parcialmente nublado',
      iconKey: 'partly-cloudy',
    },
    observedAt: '2026-09-16T12:00:00-03:00',
  },
  forecast: [
    {
      date: '2026-09-16',
      minTemperatureCelsius: 18,
      maxTemperatureCelsius: 26,
      precipitationProbability: 20,
      condition: {
        code: 2,
        label: 'Parcialmente nublado',
        iconKey: 'partly-cloudy',
      },
    },
    {
      date: '2026-09-17',
      minTemperatureCelsius: 17,
      maxTemperatureCelsius: 27,
      precipitationProbability: 10,
      condition: {
        code: 1,
        label: 'Ceu limpo',
        iconKey: 'clear-day',
      },
    },
    {
      date: '2026-09-18',
      minTemperatureCelsius: 19,
      maxTemperatureCelsius: 25,
      precipitationProbability: 30,
      condition: {
        code: 3,
        label: 'Nublado',
        iconKey: 'cloudy',
      },
    },
    {
      date: '2026-09-19',
      minTemperatureCelsius: 18,
      maxTemperatureCelsius: 23,
      precipitationProbability: 85,
      condition: {
        code: 61,
        label: 'Chuva leve',
        iconKey: 'rain',
      },
    },
    {
      date: '2026-09-20',
      minTemperatureCelsius: 16,
      maxTemperatureCelsius: 24,
      precipitationProbability: 15,
      condition: {
        code: 45,
        label: 'Neblina',
        iconKey: 'fog',
      },
    },
  ],
  fetchedAt: '2026-09-16T12:00:00-03:00',
};
