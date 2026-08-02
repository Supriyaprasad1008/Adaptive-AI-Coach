import type { Metadata } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';
import HeaderNav from '@/components/HeaderNav';
import Footer from '@/components/Footer';
import PageLoader from '@/components/PageLoader';
import styles from '@/styles/AppLayout.module.scss';
import '@/styles/globals.scss';

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Interview Coach® — Where Dreams Rise Through Silence',
  description: 'Designing tools for deep thinkers, bold engineers, and ambitious professionals.',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body>
        <PageLoader />
        <div className={styles.layoutContainer}>
          <HeaderNav />
          <main className={styles.mainContent}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
