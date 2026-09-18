import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autenticação • KulimaTech (SDAE Nhamatanda)',
  description: 'Aceda à sua conta no KulimaTech para gerir parcelas, acompanhar a humidade do solo e receber assistência técnica agrícola em Sofala.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
