import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

function getCityContext(city: City): string {
  return (
    [city.region, city.country].filter(Boolean).join(', ') || 'Localidade sem contexto adicional'
  );
}

export default function CityResults({ cities, onSelect }: CityResultsProps) {
  if (cities.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="city-results-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
    >
      <h2 className="text-lg font-semibold text-white" id="city-results-title">
        Selecione uma cidade
      </h2>
      <p className="mt-1 text-sm text-white/70">
        Encontramos {cities.length} {cities.length === 1 ? 'opção' : 'opções'} para sua busca.
      </p>
      <ul aria-label="Cidades encontradas" className="mt-4 grid gap-3 sm:grid-cols-2">
        {cities.slice(0, 10).map((city) => (
          <li key={city.id}>
            <button
              className="min-h-16 w-full rounded-xl border border-white/10 bg-night-900/60 px-4 py-3 text-left transition hover:border-accent-400/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-400"
              onClick={() => onSelect(city)}
              type="button"
            >
              <span className="block font-semibold text-white">{city.name}</span>
              <span className="mt-1 block text-sm text-white/65">{getCityContext(city)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
