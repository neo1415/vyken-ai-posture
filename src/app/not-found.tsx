import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-foreground text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        The page you requested does not exist.
      </p>
      <Link
        href="/"
        className="text-primary mt-6 text-sm font-medium hover:underline"
      >
        Return home
      </Link>
    </div>
  );
}
