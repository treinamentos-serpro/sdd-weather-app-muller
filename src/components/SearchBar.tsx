import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const trimmedCity = city.trim();
  const isSearchDisabled = disabled || trimmedCity.length < 2;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSearchDisabled) {
      return;
    }

    onSearch(trimmedCity);
  }

  return (
    <form
      aria-label="Buscar cidade"
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-md"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="flex min-w-0 flex-col gap-2">
        <label className="text-sm font-medium text-white/90" htmlFor="city-search">
          Cidade
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            autoComplete="address-level2"
            aria-describedby="city-search-help"
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-night-900/70 px-4 text-base text-white outline-none transition placeholder:text-white/50 focus:border-accent-400 focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            id="city-search"
            name="city"
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ex.: Sao Paulo"
            type="search"
            value={city}
          />

          <button
            className="min-h-12 w-full rounded-xl bg-accent-500 px-5 text-sm font-semibold text-night-900 transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:hover:bg-white/10 disabled:hover:text-white/40 sm:w-auto"
            disabled={isSearchDisabled}
            type="submit"
          >
            Buscar
          </button>
        </div>
        <p className="text-xs text-white/70" id="city-search-help">
          Digite ao menos 2 caracteres para buscar.
        </p>
      </div>
    </form>
  );
}
