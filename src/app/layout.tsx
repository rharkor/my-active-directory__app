import ProgressBar from '@/components/progress-bar';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import HandleUser from '../components/handle-user';

export const metadata = {
  title: 'My Active Directory',
  description: 'Centralized Active Directory for your organization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProgressBar showSpinner={false} color="hsl(var(--foreground))" />
          {children}
          <Toaster />
          <HandleUser />
        </ThemeProvider>
      </body>
    </html>
  );
}
