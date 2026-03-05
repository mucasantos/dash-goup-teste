import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GO UP',
  description: 'Sistema de gerenciamento de frota'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const isHomologation = false;

  return (
    <html lang='pt-PT'>
      <body className={inter.className}>
        {isHomologation && (
          <p className='bg-orange-500 text-white text-center py-1 font-bold w-full m-0'>
            HOMOLOGAÇÃO
          </p>
        )}
        <Providers>
          <Toaster position='top-right' />
          {children}
        </Providers>
      </body>
    </html>
  );
}
