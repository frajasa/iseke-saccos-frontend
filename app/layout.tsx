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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
