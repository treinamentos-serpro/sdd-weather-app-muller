import { describeWeatherCode } from '../../src/lib/weatherCodes';

describe('describeWeatherCode', () => {
  it('describes a known weather code', () => {
    expect(describeWeatherCode(61)).toEqual({
      label: 'Chuva leve',
      iconKey: 'rain',
      emoji: '🌧️',
    });
  });

  it('returns the fallback for an unknown weather code', () => {
    expect(describeWeatherCode(999)).toEqual({
      label: 'Condicao desconhecida',
      iconKey: 'unknown',
      emoji: '❓',
    });
  });
});
