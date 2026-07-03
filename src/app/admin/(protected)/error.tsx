"use client";

import Link from "next/link";

type AdminErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminErrorPage({ reset }: AdminErrorPageProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-foreground text-2xl font-semibold">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        An error occurred while loading this admin page. Please try again or
        return to the dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-primary text-primary-foreground focus-visible:ring-primary/50 rounded-lg px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/admin/leads"
          className="border-border text-foreground focus-visible:ring-primary/50 rounded-lg border px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Back to leads
        </Link>
      </div>
    </div>
  );
}
