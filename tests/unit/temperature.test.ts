import {
  convertTemperature,
  formatTemperature,
  toFahrenheit,
  unitLabel,
} from '../../src/lib/temperature';

describe('temperature helpers', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converts %s Celsius to %s Fahrenheit', (celsius, fahrenheit) => {
    expect(toFahrenheit(celsius)).toBe(fahrenheit);
  });

  it('converts temperature according to the selected unit', () => {
    expect(convertTemperature(21.6, 'celsius')).toBe(22);
    expect(convertTemperature(21.6, 'fahrenheit')).toBe(71);
    expect(convertTemperature(-5, 'fahrenheit')).toBe(23);
  });

  it.each([null, undefined, Number.NaN])('returns null for unavailable values: %s', (value) => {
    expect(convertTemperature(value, 'celsius')).toBeNull();
  });

  it('formats non-finite values as unavailable', () => {
    expect(formatTemperature(Number.POSITIVE_INFINITY, 'celsius')).toBe('indisponivel');
  });

  it('formats rounded temperatures with the selected symbol', () => {
    expect(formatTemperature(21.6, 'celsius')).toBe('22°C');
    expect(formatTemperature(21.6, 'fahrenheit')).toBe('71°F');
  });

  it('returns the label for each unit', () => {
    expect(unitLabel('celsius')).toBe('Celsius');
    expect(unitLabel('fahrenheit')).toBe('Fahrenheit');
  });
});
