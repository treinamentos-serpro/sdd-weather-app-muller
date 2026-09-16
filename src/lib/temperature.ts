import type { Unit } from '../types/weather';

/** Converte Celsius para Fahrenheit sem arredondar. */
export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/** Converte um valor canonico em Celsius para a unidade solicitada, arredondando para inteiro. */
export function convertTemperature(celsius: number | null | undefined, unit: Unit): number | null {
  if (celsius === null || celsius === undefined || !Number.isFinite(celsius)) {
    return null;
  }

  const value = unit === 'fahrenheit' ? toFahrenheit(celsius) : celsius;
  return Math.round(value);
}

/** Formata um valor canonico em Celsius para exibicao na unidade ativa, com simbolo. */
export function formatTemperature(celsius: number | null | undefined, unit: Unit): string {
  const converted = convertTemperature(celsius, unit);

  if (converted === null) {
    return 'indisponivel';
  }

  const symbol = unit === 'fahrenheit' ? '°F' : '°C';
  return `${converted}${symbol}`;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? 'Fahrenheit' : 'Celsius';
}
