export default function ResultsLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-4 text-center">
        <div
          className="border-primary/30 border-t-primary mx-auto size-10 animate-spin rounded-full border-4"
          aria-hidden="true"
        />
        <p className="text-muted-foreground text-sm">
          Generating your assessment results...
        </p>
      </div>
    </div>
  );
}
