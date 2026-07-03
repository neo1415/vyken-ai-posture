export default function PublicLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="space-y-4 text-center">
        <div
          className="border-primary/30 border-t-primary mx-auto size-8 animate-spin rounded-full border-4"
          aria-hidden="true"
        />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
