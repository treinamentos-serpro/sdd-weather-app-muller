import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import App from '../../src/App';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import { mockWeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async () => {
  const actual = await vi.importActual<typeof import('../../src/services/weatherService')>(
    '../../src/services/weatherService',
  );
  return {
    ...actual,
    searchCities: vi.fn(),
    getWeather: vi.fn(),
  };
});

const mockedSearchCities = vi.mocked(searchCities);
const mockedGetWeather = vi.mocked(getWeather);

describe('App', () => {
  beforeEach(() => {
    mockedSearchCities.mockReset();
    mockedGetWeather.mockReset();
  });

  it('shows the idle state before any search', () => {
    render(<App />);

    expect(screen.getByText('Busque uma cidade para começar')).toBeInTheDocument();
  });

  it('renders the weather and converts visible temperatures after a successful search', async () => {
    const user = userEvent.setup();
    mockedSearchCities.mockResolvedValue([mockWeatherData.city]);
    mockedGetWeather.mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.type(screen.getByLabelText('Cidade'), 'Sao Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Sao Paulo/ }));

    expect(await screen.findByRole('heading', { name: 'Sao Paulo' })).toBeInTheDocument();
    expect(screen.getAllByText('24°C').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('article')).toHaveLength(5);

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getAllByText('75°F').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Sao Paulo' })).toBeInTheDocument();
  });

  it('marks the main content busy and focuses it after loading completes', async () => {
    const user = userEvent.setup();
    let resolveSearch!: (cities: (typeof mockWeatherData.city)[]) => void;
    mockedSearchCities.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSearch = resolve;
        }),
    );
    mockedGetWeather.mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.type(screen.getByLabelText('Cidade'), 'Sao Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-busy', 'true');

    resolveSearch([mockWeatherData.city]);

    await waitFor(() => {
      expect(main).toHaveAttribute('aria-busy', 'false');
      expect(document.activeElement).toBe(main);
    });
  });

  it('shows an empty state after searching for an unknown city', async () => {
    const user = userEvent.setup();
    mockedSearchCities.mockResolvedValue([]);
    render(<App />);

    await user.type(screen.getByLabelText('Cidade'), 'Atlantis');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Nenhuma cidade encontrada para “Atlantis”.',
    );
    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
  });

  it('shows an error state and retries the last search', async () => {
    const user = userEvent.setup();
    mockedSearchCities.mockRejectedValueOnce(
      new WeatherServiceError(
        'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
        'network',
      ),
    );
    mockedSearchCities.mockResolvedValueOnce([mockWeatherData.city]);
    mockedGetWeather.mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.type(screen.getByLabelText('Cidade'), 'Sao Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
    );

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await user.click(await screen.findByRole('button', { name: /Sao Paulo/ }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sao Paulo' })).toBeInTheDocument();
    });
  });

  it('shows ambiguous cities without loading weather until one is selected', async () => {
    const user = userEvent.setup();
    const secondCity = { ...mockWeatherData.city, id: 2, name: 'Sao Paulo', country: 'Portugal' };
    mockedSearchCities.mockResolvedValue([mockWeatherData.city, secondCity]);
    mockedGetWeather.mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.type(screen.getByLabelText('Cidade'), 'Sao Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', { name: 'Selecione uma cidade' }),
    ).toBeInTheDocument();
    expect(mockedGetWeather).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Sao Paulo.*Brasil/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sao Paulo.*Portugal/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Sao Paulo.*Portugal/ }));

    await waitFor(() => {
      expect(mockedGetWeather).toHaveBeenCalledWith(secondCity);
    });
  });

  it('allows searching and selecting another city after weather is displayed', async () => {
    const user = userEvent.setup();
    const lisbonCity = {
      ...mockWeatherData.city,
      id: 2,
      name: 'Lisboa',
      country: 'Portugal',
      region: 'Lisboa',
      latitude: 38.72,
      longitude: -9.14,
    };
    const lisbonWeather = { ...mockWeatherData, city: lisbonCity };
    mockedSearchCities
      .mockResolvedValueOnce([mockWeatherData.city])
      .mockResolvedValueOnce([lisbonCity]);
    mockedGetWeather.mockResolvedValueOnce(mockWeatherData).mockResolvedValueOnce(lisbonWeather);
    render(<App />);

    await user.type(screen.getByLabelText('Cidade'), 'Sao Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Sao Paulo/ }));
    expect(await screen.findByRole('heading', { name: 'Sao Paulo' })).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Cidade'));
    await user.type(screen.getByLabelText('Cidade'), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Lisboa.*Portugal/ }));

    expect(await screen.findByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
    expect(mockedGetWeather).toHaveBeenLastCalledWith(lisbonCity);
  });
});
