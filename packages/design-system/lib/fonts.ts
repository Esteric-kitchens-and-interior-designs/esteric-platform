import { cn } from '@repo/design-system/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Playfair_Display } from 'next/font/google';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair-display',
});

export const fonts = cn(
  GeistSans.variable,
  GeistMono.variable,
  playfairDisplay.variable,
  'touch-manipulation font-sans antialiased'
);
