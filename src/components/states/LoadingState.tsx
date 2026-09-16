interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando dados...' }: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/80 backdrop-blur-md"
      role="status"
    >
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-400"
      />
      <p>{message}</p>
    </div>
  );
}