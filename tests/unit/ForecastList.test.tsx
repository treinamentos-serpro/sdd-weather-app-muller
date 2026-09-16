import { render, screen } from '@testing-library/react';

import ForecastCard from '../../src/components/ForecastCard';
import ForecastList from '../../src/components/ForecastList';
import type { ForecastDay } from '../../src/types/weather';
import { mockWeatherData } from '../../src/types/weather';

describe('ForecastList', () => {
  it('renders the five forecast days with their conditions and rain probability', () => {
    render(<ForecastList forecast={mockWeatherData.forecast} unit="celsius" />);

    expect(screen.getByRole('heading', { name: 'Previsão para 5 dias' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByRole('img', { name: 'Chuva leve' })).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('converts temperatures to the active unit', () => {
    render(<ForecastCard day={mockWeatherData.forecast[0]} unit="fahrenheit" />);

    expect(screen.getByText('79°F')).toBeInTheDocument();
    expect(screen.getByText('64°F')).toBeInTheDocument();
  });

  it('shows unavailable labels for incomplete days', () => {
    const incompleteDay: ForecastDay = {
      condition: null,
      date: null,
      maxTemperatureCelsius: null,
      minTemperatureCelsius: null,
      precipitationProbability: null,
    };

    render(<ForecastCard day={incompleteDay} unit="celsius" />);

    expect(screen.getByRole('article', { name: 'Previsão para Indisponível' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Condição indisponível' })).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(3);
    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});
