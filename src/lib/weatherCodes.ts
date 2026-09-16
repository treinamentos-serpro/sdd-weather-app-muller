export interface WeatherCodeInfo {
  label: string;
  iconKey: string;
  emoji: string;
}

const FALLBACK: WeatherCodeInfo = {
  label: 'Condicao desconhecida',
  iconKey: 'unknown',
  emoji: '❓',
};

/** Mapeamento dos codigos WMO retornados pela Open-Meteo para texto pt-BR e icone. */
const WEATHER_CODE_MAP: Record<number, WeatherCodeInfo> = {
  0: { label: 'Ceu limpo', iconKey: 'clear-day', emoji: '☀️' },
  1: { label: 'Predominantemente limpo', iconKey: 'clear-day', emoji: '🌤️' },
  2: { label: 'Parcialmente nublado', iconKey: 'partly-cloudy', emoji: '⛅' },
  3: { label: 'Nublado', iconKey: 'cloudy', emoji: '☁️' },
  45: { label: 'Neblina', iconKey: 'fog', emoji: '🌫️' },
  48: { label: 'Neblina com geada', iconKey: 'fog', emoji: '🌫️' },
  51: { label: 'Garoa fraca', iconKey: 'drizzle', emoji: '🌦️' },
  53: { label: 'Garoa moderada', iconKey: 'drizzle', emoji: '🌦️' },
  55: { label: 'Garoa intensa', iconKey: 'drizzle', emoji: '🌧️' },
  56: { label: 'Garoa congelante fraca', iconKey: 'drizzle', emoji: '🌧️' },
  57: { label: 'Garoa congelante intensa', iconKey: 'drizzle', emoji: '🌧️' },
  61: { label: 'Chuva leve', iconKey: 'rain', emoji: '🌧️' },
  63: { label: 'Chuva moderada', iconKey: 'rain', emoji: '🌧️' },
  65: { label: 'Chuva forte', iconKey: 'rain', emoji: '🌧️' },
  66: { label: 'Chuva congelante fraca', iconKey: 'rain', emoji: '🌧️' },
  67: { label: 'Chuva congelante forte', iconKey: 'rain', emoji: '🌧️' },
  71: { label: 'Neve fraca', iconKey: 'snow', emoji: '🌨️' },
  73: { label: 'Neve moderada', iconKey: 'snow', emoji: '🌨️' },
  75: { label: 'Neve forte', iconKey: 'snow', emoji: '❄️' },
  77: { label: 'Graos de neve', iconKey: 'snow', emoji: '❄️' },
  80: { label: 'Pancadas de chuva fracas', iconKey: 'rain', emoji: '🌦️' },
  81: { label: 'Pancadas de chuva moderadas', iconKey: 'rain', emoji: '🌧️' },
  82: { label: 'Pancadas de chuva fortes', iconKey: 'rain', emoji: '⛈️' },
  85: { label: 'Pancadas de neve fracas', iconKey: 'snow', emoji: '🌨️' },
  86: { label: 'Pancadas de neve fortes', iconKey: 'snow', emoji: '❄️' },
  95: { label: 'Trovoada', iconKey: 'thunderstorm', emoji: '⛈️' },
  96: { label: 'Trovoada com granizo fraco', iconKey: 'thunderstorm', emoji: '⛈️' },
  99: { label: 'Trovoada com granizo forte', iconKey: 'thunderstorm', emoji: '⛈️' },
};

/** Retorna label, iconKey e emoji para um codigo WMO, com fallback para codigos desconhecidos. */
export function describeWeatherCode(code: number | null | undefined): WeatherCodeInfo {
  if (code === null || code === undefined || !(code in WEATHER_CODE_MAP)) {
    return FALLBACK;
  }

  return WEATHER_CODE_MAP[code];
}
