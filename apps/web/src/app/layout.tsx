import { SolanaProvider } from '../providers/SolanaProvider';
import { Navbar } from '../components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>
          <Navbar />
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}
