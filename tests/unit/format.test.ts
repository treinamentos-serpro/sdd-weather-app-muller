import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('format helpers', () => {
  it('labels the first and second forecast days', () => {
    expect(getDayLabel('2026-06-16', 0)).toBe('Hoje');
    expect(getDayLabel('2026-06-17', 1)).toBe('Amanhã');
  });

  it('uses the weekday for the remaining forecast days', () => {
    expect(getDayLabel('2026-06-18', 2)).toBe('Qui');
  });

  it('formats a short date', () => {
    expect(getShortDate('2026-06-16')).toBe('16 Jun');
  });
});
