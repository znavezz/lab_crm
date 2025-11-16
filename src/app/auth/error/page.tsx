'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') ?? null;

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
            Authentication Error
          </h2>
          <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">
              {getErrorMessage(error)}
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Try signing in again
          </Link>
        </div>
      </div>
    </div>
  );
}

