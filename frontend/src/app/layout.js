import './globals.css'; // This MUST be here
import { SocketProvider } from '../context/SocketContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}