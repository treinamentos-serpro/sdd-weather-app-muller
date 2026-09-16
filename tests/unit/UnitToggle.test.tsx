import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';
import { mockWeatherData } from '../../src/types/weather';

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle onChange={setUnit} unit={unit} />
      <CurrentWeather
        city={mockWeatherData.city}
        current={{
          ...mockWeatherData.current,
          apparentTemperatureCelsius: 1,
          temperatureCelsius: 0,
        }}
        unit={unit}
      />
    </>
  );
}

describe('UnitToggle and CurrentWeather', () => {
  it('converts 0°C to 32°F when the Fahrenheit unit is selected', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    expect(screen.getByText('0°C')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('32°F')).toBeInTheDocument();
  });

  it('returns to the original Celsius value after switching back', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    await user.click(screen.getByRole('button', { name: '°F' }));
    await user.click(screen.getByRole('button', { name: '°C' }));

    expect(screen.getByText('0°C')).toBeInTheDocument();
  });
});
