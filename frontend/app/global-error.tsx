'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Global app error:', error);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
          <div className="max-w-lg w-full rounded-lg border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-red-700">Critical application error</h2>
            <p className="mt-2 text-sm text-slate-600">
              A global error occurred while rendering this page.
            </p>
            <button
              onClick={reset}
              className="mt-4 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
