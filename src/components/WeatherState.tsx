interface WeatherStateProps {
  status: 'idle' | 'loading' | 'empty' | 'error';
  message?: string;
  query?: string;
  onRetry?: () => void;
}

export default function WeatherState({ status, message, query = '', onRetry }: WeatherStateProps) {
  if (status === 'idle') {
    return (
      <section aria-live="polite" className="py-20 text-center" role="status">
        <p className="text-lg font-medium text-white">Busque uma cidade para começar</p>
        <p className="mt-2 text-sm text-white/70">
          Veja as condições atuais e os próximos cinco dias.
        </p>
      </section>
    );
  }

  if (status === 'loading') {
    return (
      <section aria-live="polite" className="py-20 text-center" role="status">
        <span
          aria-hidden="true"
          className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-accent-400"
        />
        <p className="mt-4 font-medium text-white">Carregando previsão...</p>
      </section>
    );
  }

  if (status === 'empty') {
    return (
      <section
        aria-live="polite"
        className="rounded-xl border border-white/10 bg-white/5 p-8 text-center"
        role="status"
      >
        <p className="font-medium text-white">Nenhuma cidade encontrada para “{query}”.</p>
        <p className="mt-2 text-sm text-white/70">Confira o nome e tente novamente.</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-red-400/30 bg-red-400/10 p-8 text-center"
      role="alert"
    >
      <p className="font-medium text-white">
        {message ?? 'Não foi possível carregar a previsão. Tente novamente.'}
      </p>
      <p className="mt-2 text-sm text-white/80">Verifique sua conexão e tente novamente.</p>
      <button
        className="mt-5 min-h-11 rounded-lg bg-white px-4 font-semibold text-night-900 transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </section>
  );
}
