import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VRForge',
  description: 'Experience verifiable randomness from the blockchain and generate unique anime characters through cryptographically secure randomness',
  icons: {
    icon: [
      { url: '/vrf.png', sizes: '32x32', type: 'image/png' },
      { url: '/vrf.png', sizes: '16x16', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
