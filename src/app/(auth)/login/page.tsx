'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  ShieldAlert,
  Sprout,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { loginSchema } from '@/features/auth/schemas/authSchemas';

const TESTIMONIALS = [
  {
    quote:
      'O KulimaTech tornou o acompanhamento da humidade do solo e a emissão de recomendações técnicas muito mais simples. Tudo num só lugar.',
    author: 'Eng. António Langa',
    role: 'Técnico Extensionista — SDAE Nhamatanda (Posto de Tica)',
  },
  {
    quote:
      'Com o KulimaTech sei exatamente o momento ideal para regar o milho e as hortícolas, protegendo as colheitas contra a estiagem em Sofala.',
    author: 'Mateus Cossa',
    role: 'Agricultor Familiar — Associação de Regantes de Lamego',
  },
  {
    quote:
      'A plataforma conecta a investigação científica da UniZambeze com o trabalho de extensão agrária no terreno em Nhamatanda.',
    author: 'Alberto Nhantumbo',
    role: 'Administrador do Sistema — SDAE Nhamatanda',
  },
];

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      setValidationError(validationResult.error.issues[0].message);
      return;
    }

    try {
      await login({ email, password });
    } catch {
      // Erro é tratado e disponibilizado pelo useAuth
    }
  };

  const currentQuote = TESTIMONIALS[activeTestimonial];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* ========================================================================= */}
      {/* PAINEL ESQUERDO: FOTOGRAFIA FULL-BLEED + TESTEMUNHO + CARROSSEL (DESKTOP)  */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex relative w-full lg:w-[62%] xl:w-[65%] min-h-screen bg-slate-900 overflow-hidden flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Imagem de Fundo Fotográfica */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
          style={{ backgroundImage: "url('/images/login-hero.jpg')" }}
        />

        {/* Gradiente Escuro Suave para Contraste das Informações */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/25" />

        {/* Topo Esquerdo: Emblema / Círculo Institucional */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-white/95 text-[#002626] flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-5 h-5 text-[#0E4749] stroke-[2.5]" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-tight text-white drop-shadow">KulimaTech</span>
              <span className="block text-[10px] font-medium tracking-wide uppercase text-white/80 drop-shadow">
                SDAE Nhamatanda • Sofala
              </span>
            </div>
          </Link>
        </div>

        {/* Base Esquerda: Citação e Navegação do Carrossel */}
        <div className="relative z-10 mt-auto pt-12">
          <div className="max-w-2xl">
            <p className="text-xl sm:text-2xl lg:text-3xl font-normal text-white leading-snug drop-shadow-md">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-bold text-white drop-shadow">
                  {currentQuote.author}
                </h3>
                <p className="text-xs sm:text-sm text-white/75 drop-shadow">
                  {currentQuote.role}
                </p>
              </div>

              {/* Controles do Carrossel */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevTestimonial}
                  className="w-8 h-8 rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm focus:outline-none"
                  aria-label="Testemunho anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextTestimonial}
                  className="w-8 h-8 rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm focus:outline-none"
                  aria-label="Próximo testemunho"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Indicador Minimalista de Rodapé */}
          <div className="mt-8 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-white/60">
            <span className="font-semibold text-white/80">SDAE Nhamatanda &amp; UniZambeze</span>
            <span>Moçambique • 2026</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAINEL DIREITO: FORMULÁRIO LIMPO & MINIMALISTA (35% - 38%)                 */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[38%] xl:w-[35%] min-h-screen flex flex-col justify-center items-center p-6 sm:p-12 lg:p-14 relative bg-white">
        <div className="w-full max-w-sm space-y-7">
          {/* Logo Oficial KulimaTech Circular */}
          <div className="text-center flex flex-col items-center space-y-3">
            <Link href="/" className="inline-flex flex-col items-center gap-2.5 group" title="Voltar à Página Inicial">
              <div className="w-14 h-14 rounded-full bg-[#95C623] text-[#002626] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Sprout className="w-7 h-7 text-[#002626] stroke-[2.5]" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black tracking-tight text-[#002626] leading-none">
                  KulimaTech
                </span>
                <span className="text-[11px] text-gray-500 font-medium tracking-wide mt-1">
                  Entre com as suas credenciais
                </span>
              </div>
            </Link>
          </div>

          {/* Banner de Erros */}
          {(validationError || error) && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Erro na autenticação</span>
                <p className="mt-0.5">{validationError || error}</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo: Email Institucional */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-normal text-gray-700">
                Email pessoal:
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@kulimatech.gov.mz"
                className="w-full px-3.5 py-2.5 rounded-md bg-[#eef3f9] border border-[#d6e0ea] text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f38]/20 focus:border-[#0f1f38] transition-all"
              />
            </div>

            {/* Campo: Palavra-passe */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-normal text-gray-700">
                Palavra-passe:
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-md bg-[#eef3f9] border border-[#d6e0ea] text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f38]/20 focus:border-[#0f1f38] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Linha: Manter Sessão e Esqueceu a Senha */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#0f1f38] focus:ring-[#0f1f38] accent-[#0f1f38]"
                />
                <span className="text-xs text-gray-600 font-normal">Manter sessão iniciada</span>
              </label>

              <Link
                href="/recuperar-senha"
                className="text-xs text-[#0f1f38] font-semibold hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Botão Entrar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-md font-semibold text-sm bg-[#0c1e36] hover:bg-[#152e50] text-white focus:outline-none focus:ring-2 focus:ring-[#0c1e36]/30 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>A entrar...</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </div>
          </form>

          {/* Links de Rodapé */}
          <div className="space-y-3 pt-2 text-center text-xs text-gray-600">

            <div className="pt-2 border-t border-gray-100">
              Ainda não tem conta?{' '}
              <Link
                href="/registo"
                className="font-semibold text-[#0f1f38] hover:underline"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}