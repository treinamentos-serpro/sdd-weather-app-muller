import type { Unit } from '../types/weather';

const unavailableLabel = 'Indisponível';
const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getDayLabel(iso: string, index: number): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  return weekdays[parseLocalDate(iso).getDay()];
}

export function getShortDate(iso: string): string {
  const date = parseLocalDate(iso);
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function formatDayLabel(date: string | null): string {
  if (date === null) {
    return unavailableLabel;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (match === null) {
    return unavailableLabel;
  }

  const [, year, month, day] = match;
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() !== Number(month) - 1 ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    return unavailableLabel;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    timeZone: 'UTC',
  })
    .format(parsedDate)
    .replace('.', '');
}

export function formatTemperature(valueCelsius: number | null, unit: Unit): string {
  if (valueCelsius === null || !Number.isFinite(valueCelsius)) {
    return unavailableLabel;
  }

  const value = unit === 'fahrenheit' ? (valueCelsius * 9) / 5 + 32 : valueCelsius;
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';

  return `${Math.round(value)}${symbol}`;
}
