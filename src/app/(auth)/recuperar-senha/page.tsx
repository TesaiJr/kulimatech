import { redirect } from 'next/navigation';

export default function RecuperarSenhaPage() {
  redirect('/auth?mode=recover');
}