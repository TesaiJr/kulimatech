import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KulimaTech — Sistema de Gestão Agrícola e Extensão Rural",
    template: "%s | KulimaTech",
  },
  description: "Plataforma integrada de monitoramento agrometeorológico, gestão de parcelas e assistência técnica para o SDAE de Nhamatanda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
