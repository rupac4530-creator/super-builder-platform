import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Engine Alto — AI-First Creator Platform',
  description: 'Build apps, train AI models, create games, and deploy — all from one platform. Powered by autonomous AI agents.',
  keywords: 'AI, machine learning, game engine, platform, creator tools, Engine Alto',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
