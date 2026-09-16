interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm text-white/70">{hint}</p>
    </section>
  );
}