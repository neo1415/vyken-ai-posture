"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-foreground text-2xl font-semibold">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        An unexpected error occurred. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-primary text-primary-foreground mt-6 rounded-lg px-4 py-2 text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}
