import React from 'react';

export function CsmjuAppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">CSMJU Hub</h1>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="bg-white border-t px-6 py-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} CSMJU 2030
      </footer>
    </div>
  );
}
