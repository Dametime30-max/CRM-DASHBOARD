"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page could not be loaded. Your data has not been changed. Try again, and if the problem continues check the terminal
        where the app is running for details.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-slate-400">Reference: {error.digest}</p>}
      <button className="btn-primary mt-6" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
