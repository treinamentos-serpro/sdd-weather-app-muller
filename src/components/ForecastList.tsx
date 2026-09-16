import type { FiveDayForecast, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: FiveDayForecast;
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading">
      <h2 className="mb-4 text-xl font-semibold text-white" id="forecast-heading">
        Previsão para 5 dias
      </h2>

      <div
        aria-labelledby="forecast-heading"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        role="list"
      >
        {forecast.map((day) => (
          <div
            key={`${day.date ?? 'indisponivel'}-${day.condition?.code ?? 'sem-condicao'}-${day.minTemperatureCelsius ?? 'sem-minima'}`}
            role="listitem"
          >
            <ForecastCard day={day} unit={unit} />
          </div>
        ))}
      </div>
    </section>
  );
}
