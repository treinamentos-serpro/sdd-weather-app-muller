interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      aria-live="assertive"
      className="flex min-h-32 flex-col items-center justify-center gap-4 rounded-xl border border-red-300/30 bg-red-950/20 p-6 text-center backdrop-blur-md"
      role="alert"
    >
      <p className="text-white">{message}</p>
      <button
        className="min-h-11 rounded-lg bg-accent-500 px-4 text-sm font-semibold text-night-900 transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </section>
  );
}