'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-lg w-full rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-red-700">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-600">
          The page failed to load. Try again.
        </p>
        <button
          onClick={reset}
          className="mt-4 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
