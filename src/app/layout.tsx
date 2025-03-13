import { Inter, Poppins } from "next/font/google";
import "@/styles/globals.css";
import ClientThemeProvider from "@/components/ClientThemeProvider";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "VecinoApp - Tu guía local de confianza",
  description:
    "Descubre los mejores lugares y servicios de tu vecindario con reseñas auténticas de tus vecinos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${poppins.variable}`}>
      <body className={inter.className}>
        <ClientThemeProvider>{children}</ClientThemeProvider>
      </body>
    </html>
  );
}
