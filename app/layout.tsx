import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>ISEKE SACCOS - Management System</title>
        <meta name="description" content="ISEKE SACCOS Management System" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              className: "!rounded-xl !shadow-lg !border-border !font-sans",
              duration: 4000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
