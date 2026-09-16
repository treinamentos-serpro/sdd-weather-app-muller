import { describeWeatherCode } from '../lib/weatherCodes';
import type {
  AppError,
  City,
  CurrentWeather,
  FiveDayForecast,
  ForecastDay,
  GeocodingResponse,
  GeocodingResult,
  WeatherData,
} from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 5;
const FETCH_TIMEOUT_MS = 5_000;

interface ForecastCurrentResponse {
  time?: string | null;
  temperature_2m?: number | null;
  apparent_temperature?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
  surface_pressure?: number | null;
  weather_code?: number | null;
}

interface ForecastDailyResponse {
  time?: Array<string | null> | null;
  temperature_2m_min?: Array<number | null> | null;
  temperature_2m_max?: Array<number | null> | null;
  precipitation_probability_max?: Array<number | null> | null;
  weather_code?: Array<number | null> | null;
}

interface ForecastResponse {
  current?: ForecastCurrentResponse | null;
  daily?: ForecastDailyResponse | null;
}

const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';
const TIMEOUT_ERROR_MESSAGE = 'A conexão demorou mais que o esperado. Tente novamente.';
const INVALID_RESPONSE_MESSAGE = 'Recebemos uma resposta inválida. Tente novamente.';

export class WeatherServiceError extends Error {
  readonly kind: AppError['kind'];
  readonly retryable: boolean;

  constructor(message: string, kind: AppError['kind'] = 'network', retryable = true) {
    super(message);
    this.name = 'WeatherServiceError';
    this.kind = kind;
    this.retryable = retryable;
  }
}

/** Faz fetch com timeout via AbortController, convertendo falhas em WeatherServiceError. */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherServiceError(TIMEOUT_ERROR_MESSAGE, 'timeout');
    }

    throw new WeatherServiceError(NETWORK_ERROR_MESSAGE, 'network');
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError(INVALID_RESPONSE_MESSAGE, 'invalid-payload');
  }
}

type ValidGeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string | null;
  admin1?: string | null;
  admin2?: string | null;
};

function isValidGeocodingResult(result: GeocodingResult | null): result is ValidGeocodingResult {
  return (
    result !== null &&
    typeof result.id === 'number' &&
    Number.isFinite(result.id) &&
    typeof result.name === 'string' &&
    result.name.trim().length > 0 &&
    typeof result.latitude === 'number' &&
    Number.isFinite(result.latitude) &&
    typeof result.longitude === 'number' &&
    Number.isFinite(result.longitude)
  );
}

function mapResultToCity(result: ValidGeocodingResult): City {
  return {
    id: result.id,
    name: result.name,
    country: result.country ?? undefined,
    region: result.admin1 ?? result.admin2 ?? undefined,
    admin1: result.admin1 ?? undefined,
    admin2: result.admin2 ?? undefined,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

/** Busca cidades pelo endpoint de geocoding da Open-Meteo. */
export async function searchCities(name: string): Promise<City[]> {
  const normalized = name.trim();

  if (!normalized) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(normalized)}&count=5&language=pt&format=json`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível localizar cidades. Tente novamente.', 'api');
  }

  const data = await parseJson<GeocodingResponse | null>(response);

  if (!data || typeof data !== 'object') {
    throw new WeatherServiceError(INVALID_RESPONSE_MESSAGE, 'invalid-payload');
  }

  if (data.results !== undefined && data.results !== null && !Array.isArray(data.results)) {
    throw new WeatherServiceError(INVALID_RESPONSE_MESSAGE, 'invalid-payload');
  }

  return (data.results ?? []).filter(isValidGeocodingResult).map(mapResultToCity);
}

function toNullableNumber(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toNullableString(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function mapCurrentWeather(current: ForecastCurrentResponse): CurrentWeather {
  return {
    temperatureCelsius: toNullableNumber(current.temperature_2m),
    apparentTemperatureCelsius: toNullableNumber(current.apparent_temperature),
    humidityPercent: toNullableNumber(current.relative_humidity_2m),
    windSpeedKmh: toNullableNumber(current.wind_speed_10m),
    precipitationMm: toNullableNumber(current.precipitation),
    pressureHpa: toNullableNumber(current.surface_pressure),
    condition: (() => {
      const weatherCode = toNullableNumber(current.weather_code);
      return weatherCode === null
        ? null
        : { code: weatherCode, ...describeWeatherCode(weatherCode) };
    })(),
    observedAt: toNullableString(current.time),
  };
}

function mapForecastDay(daily: ForecastDailyResponse, index: number): ForecastDay {
  const date = daily.time?.[index] ?? null;
  const weatherCode = toNullableNumber(daily.weather_code?.[index]);

  return {
    date,
    minTemperatureCelsius: toNullableNumber(daily.temperature_2m_min?.[index]),
    maxTemperatureCelsius: toNullableNumber(daily.temperature_2m_max?.[index]),
    precipitationProbability: toNullableNumber(daily.precipitation_probability_max?.[index]),
    condition:
      weatherCode === null ? null : { code: weatherCode, ...describeWeatherCode(weatherCode) },
  };
}

function mapForecast(daily: ForecastDailyResponse): FiveDayForecast {
  const days = Array.from({ length: FORECAST_DAYS }, (_, index) => mapForecastDay(daily, index));

  return days as FiveDayForecast;
}

/** Busca clima atual e previsao de 5 dias pelo endpoint de forecast da Open-Meteo. */
export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure,weather_code',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    forecast_days: String(FORECAST_DAYS),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  });

  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível carregar a previsão. Tente novamente.', 'api');
  }

  const data = await parseJson<ForecastResponse | null>(response);

  if (!data || typeof data !== 'object' || !data.current || !data.daily) {
    throw new WeatherServiceError(INVALID_RESPONSE_MESSAGE, 'invalid-payload');
  }

  return {
    city,
    current: mapCurrentWeather(data.current),
    forecast: mapForecast(data.daily),
    fetchedAt: new Date().toISOString(),
  };
}
