
import './globals.css';
import React from 'react';
import AppThemeProvider from './theme-provider';
export const metadata = { title: 'Social Media AI Agent', description: 'MVP Onboarding' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
        <AppThemeProvider>
          <div className="header-grad">
            <div className="container-app py-6">
              <h1 className="text-2xl font-semibold">Social Media AI Agent</h1>
            </div>
          </div>
          <main className="container-app py-6">{children}</main>
        </AppThemeProvider>
      </body>
    </html>
  );
}