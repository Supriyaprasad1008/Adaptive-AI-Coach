import type { Metadata } from 'next';
import HeaderNav from '@/components/HeaderNav';
import Footer from '@/components/Footer';
import styles from '@/styles/AppLayout.module.scss';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: 'Interview Coach® — Where Dreams Rise Through Silence',
  description: 'Designing tools for deep thinkers, bold engineers, and ambitious professionals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className={styles.layoutContainer}>
          <HeaderNav />
          <main className={styles.mainContent}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
