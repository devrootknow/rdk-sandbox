import type { Metadata } from 'next';
import { TRPCProvider } from '@/trpc/client';
import './globals.css';

export const metadata: Metadata = {
  title: 'RDK Sandbox — RootKnow Dev Kit',
  description: 'Type-safe fullstack sandbox: Next.js 15 + tRPC + Drizzle + Zod + Supabase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bp5-dark">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
