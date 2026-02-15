// AppLayout — semantic shell with skip link, header, and main.
// Mobile-first: full width, safe padding, max-width on larger screens.

import type { ReactNode } from 'react';

const MAIN_ID = 'main-content';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <a
        href={`#${MAIN_ID}`}
        className="fixed left-[-9999px] z-100 px-4 py-2 focus:left-4 focus:top-4 focus:rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
      >
        Skip to content
      </a>

      <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-center text-xl font-semibold text-gray-900 sm:text-2xl">
          Task Manager
        </h1>
      </header>

      <main
        id={MAIN_ID}
        tabIndex={-1}
        className="mx-auto w-full max-w-[600px] px-4 py-6 sm:px-6"
      >
        {children}
      </main>
    </>
  );
}
