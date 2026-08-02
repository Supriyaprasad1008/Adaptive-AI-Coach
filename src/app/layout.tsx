import type { Metadata } from 'next';
import HeaderNav from '@/components/HeaderNav';
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
        {/* Fullscreen Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="videoBackground"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        />
        <div className="videoOverlay" />

        <div className={styles.layoutContainer}>
          <HeaderNav />
          <main className={styles.mainContent}>{children}</main>
          <footer className={styles.footer}>
            <p>© 2026 Interview Coach® — Where dreams rise through the silence.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
