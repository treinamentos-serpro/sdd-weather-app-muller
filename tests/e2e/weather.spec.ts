import { expect, test } from '@playwright/test';

test('searches for a city, shows its forecast, and converts the temperature', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 1,
            name: 'Sao Paulo',
            country: 'Brasil',
            admin1: 'Sao Paulo',
            latitude: -23.55,
            longitude: -46.63,
          },
        ],
      }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          time: '2026-09-16T12:00',
          temperature_2m: 0,
          apparent_temperature: 1,
          relative_humidity_2m: 68,
          wind_speed_10m: 14,
          precipitation: 0,
          surface_pressure: 1014,
          weather_code: 0,
        },
        daily: {
          time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
          temperature_2m_min: [5, 6, 7, 8, 9],
          temperature_2m_max: [15, 16, 17, 18, 19],
          weather_code: [0, 1, 2, 3, 61],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Sao Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /Sao Paulo.*Sao Paulo.*Brasil/ }).click();

  await expect(page.getByRole('heading', { name: 'Sao Paulo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão para 5 dias' })).toBeVisible();

  await page.getByRole('button', { name: '°F' }).click();

  await expect(page.getByText('32°F')).toBeVisible();
});

test('shows an empty state when geocoding returns no results', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Atlantis');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
});

test('encodes special characters in a city search', async ({ page }) => {
  let requestedName = '';

  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    requestedName = new URL(route.request().url()).searchParams.get('name') ?? '';
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('São Paulo & Co.');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
  expect(requestedName).toBe('São Paulo & Co.');
});

test('renders safe fallbacks when the forecast is incomplete', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 1,
            name: 'Sao Paulo',
            country: 'Brasil',
            latitude: -23.55,
            longitude: -46.63,
          },
        ],
      }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        current: {},
        daily: { time: ['2026-09-16'] },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Sao Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /Sao Paulo.*Brasil/ }).click();

  await expect(page.getByRole('heading', { name: 'Sao Paulo' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.locator('body')).not.toContainText('NaN');
  await expect(page.locator('body')).not.toContainText('undefined');
  await expect(page.getByText('Indisponível').first()).toBeVisible();
});

test('renders the weather flow correctly on a 375x812 viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 1,
            name: 'Sao Paulo',
            country: 'Brasil',
            admin1: 'Sao Paulo',
            latitude: -23.55,
            longitude: -46.63,
          },
        ],
      }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          time: '2026-09-16T12:00',
          temperature_2m: 0,
          apparent_temperature: 1,
          relative_humidity_2m: 68,
          wind_speed_10m: 14,
          precipitation: 0,
          surface_pressure: 1014,
          weather_code: 0,
        },
        daily: {
          time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
          temperature_2m_min: [5, 6, 7, 8, 9],
          temperature_2m_max: [15, 16, 17, 18, 19],
          weather_code: [0, 1, 2, 3, 61],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Sao Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /Sao Paulo.*Sao Paulo.*Brasil/ }).click();

  await expect(page.getByRole('heading', { name: 'Sao Paulo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão para 5 dias' })).toBeVisible();
});

test('disambiguates cities before requesting the forecast', async ({ page }) => {
  let forecastRequests = 0;

  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 1,
            name: 'Sao Paulo',
            country: 'Brasil',
            admin1: 'Sao Paulo',
            latitude: -23.55,
            longitude: -46.63,
          },
          {
            id: 2,
            name: 'Sao Paulo',
            country: 'Portugal',
            admin1: 'Braga',
            latitude: 41.23,
            longitude: -8.62,
          },
        ],
      }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    forecastRequests += 1;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ current: {}, daily: { time: ['2026-09-16'] } }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Sao Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Selecione uma cidade' })).toBeVisible();
  expect(forecastRequests).toBe(0);

  await page.getByRole('button', { name: /Sao Paulo.*Braga.*Portugal/ }).click();

  await expect(page.getByRole('heading', { name: 'Sao Paulo' })).toBeVisible();
  expect(forecastRequests).toBe(1);
});
