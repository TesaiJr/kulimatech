'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sprout,
  Mail,
  ArrowRight,
  CheckCircle2,
  Lock,
  User,
  Phone,
  MapPin,
  Sparkles,
  ArrowLeft,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authService } from '@/features/auth/services/authService';
import { loginSchema, registerSchema } from '@/features/auth/schemas/authSchemas';
import { api, ApiError } from '@/lib/api/client';
import { UserRole } from '@/features/auth/types';

type AuthMode = 'login' | 'register' | 'recover' | 'reset';

const TESTIMONIALS = [
  {
    quote:
      'O KulimaTech tornou o acompanhamento da humidade do solo e a emissão de recomendações técnicas muito mais simples. Tudo num só lugar.',
    author: 'Eng. António Langa',
    role: 'Técnico Extensionista — SDAE Nhamatanda (Posto de Tica)',
    image: '/images/login-hero.jpg',
  },
  {
    quote:
      'Com o KulimaTech sei exatamente o momento ideal para regar o milho e as hortícolas, protegendo as colheitas contra a estiagem em Sofala.',
    author: 'Mateus Cossa',
    role: 'Agricultor Familiar — Associação de Regantes de Lamego',
    image: '/images/hero-crops.jpg',
  },
  {
    quote:
      'A plataforma conecta a investigação científica da UniZambeze com o trabalho de extensão agrária no terreno em Nhamatanda.',
    author: 'Alberto Nhantumbo',
    role: 'Administrador do Sistema — SDAE Nhamatanda',
    image: '/images/hero-irrigation.jpg',
  },
];

const NHAMATANDA_ZONAS = [
  'Lamego',
  'Tica',
  'Metuchira',
  'Nhamatanda (Sede)',
  'Muda',
  'Bebedo',
  'Nhampoca',
  'Siluvo',
  'Chirassicua',
  'Outra localidade',
];

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Estados de Login
  const { login, isLoading: isLoginLoading, error: loginApiError, clearError } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginValidationError, setLoginValidationError] = useState<string | null>(null);

  // Estados de Registo
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regZona, setRegZona] = useState(NHAMATANDA_ZONAS[0]);
  const [regRole, setRegRole] = useState<UserRole>('AGRICULTOR');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);
  const [regTerms, setRegTerms] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessEmail, setRegSuccessEmail] = useState<string | null>(null);

  // Estados de Verificação por Código OTP (Signup)
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Estados de Recuperação de Senha
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverSuccess, setRecoverSuccess] = useState(false);
  const [recoverError, setRecoverError] = useState<string | null>(null);
  const [recoverOtp, setRecoverOtp] = useState<string | null>(null);

  // Estados de Redefinição por OTP ou Link
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetShowPassword, setResetShowPassword] = useState(false);
  const [resetShowConfirmPassword, setResetShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    const urlMode = searchParams.get('mode') as AuthMode;
    if (urlMode && ['login', 'register', 'recover', 'reset'].includes(urlMode)) {
      setMode(urlMode);
    }
  }, [searchParams]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
    setLoginValidationError(null);
    setRegError(null);
    setRecoverError(null);
    setResetError(null);
    setOtpError(null);
    const params = new URLSearchParams(window.location.search);
    params.set('mode', newMode);
    window.history.replaceState(null, '', `?${params.toString()}`);
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };


  // Submit de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoginValidationError(null);

    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      setLoginValidationError(validation.error.issues[0].message);
      return;
    }

    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch {
      // Erro gerenciado pelo useAuth
    }
  };

  // Submit de Registo (com envio de confirmação / OTP via Supabase)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas introduzidas não coincidem.');
      return;
    }

    if (!regTerms) {
      setRegError('Deverá aceitar as condições de serviço e a política de dados para prosseguir.');
      return;
    }

    const payload = {
      nome: regNome,
      email: regEmail,
      telefone: regTelefone || undefined,
      zonaAtuacao: regZona,
      role: regRole,
      password: regPassword,
    };

    const validation = registerSchema.safeParse(payload);
    if (!validation.success) {
      setRegError(validation.error.issues[0].message);
      return;
    }

    setRegLoading(true);
    try {
      // Criar utilizador no backend e disparar envio de e-mail/OTP no servidor
      await api.post('/api/auth/register', payload);
      setRegSuccessEmail(regEmail);
    } catch (err) {
      if (err instanceof ApiError) {
        setRegError(err.message);
      } else {
        setRegError('Não foi possível concluir o registo. Tente novamente.');
      }
    } finally {
      setRegLoading(false);
    }
  };

  // Validação do Código OTP de Registo (digitado no PC a partir do telemóvel)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regSuccessEmail || !otpCode.trim()) {
      setOtpError('Por favor introduza o código de confirmação recebido no seu e-mail.');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      // Validar OTP e ativar conta no servidor
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = await api.post<any>('/api/auth/verify-otp', {
        email: regSuccessEmail,
        token: otpCode.trim(),
        type: 'signup',
      });

      authService.saveSession(session);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setOtpError(err.message);
      } else {
        setOtpError('Código de confirmação incorreto ou expirado.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Reenviar Código OTP
  const handleResendOtp = async () => {
    if (!regSuccessEmail) return;
    setOtpLoading(true);
    setOtpError(null);
    setResendSuccess(false);

    try {
      await api.post('/api/auth/recover', {
        email: regSuccessEmail,
      });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setOtpError(err.message);
      } else {
        setOtpError('Falha ao reenviar código.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Submit de Recuperação de Senha
  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverError(null);
    setRecoverLoading(true);
    setRecoverOtp(null);

    try {
      const res = await api.post<{
        message: string;
        otp?: string;
        actionLink?: string;
        rateLimitBypassed?: boolean;
      }>('/api/auth/recover', {
        email: recoverEmail,
      });

      if (res?.otp) {
        setRecoverOtp(res.otp);
        setResetOtpCode(res.otp);
      }

      setRecoverSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setRecoverError(err.message);
      } else {
        setRecoverError('Falha ao solicitar recuperação de palavra-passe.');
      }
    } finally {
      setRecoverLoading(false);
    }
  };

  // Submit de Redefinição de Senha (por OTP ou Link)
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (resetPassword !== resetConfirmPassword) {
      setResetError('As palavras-passe não coincidem.');
      return;
    }

    if (resetPassword.length < 6) {
      setResetError('A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }

    setResetLoading(true);
    try {
      // Se informou código OTP recebido no telemóvel, validar primeiro
      if (resetOtpCode.trim()) {
        await api.post('/api/auth/verify-otp', {
          email: recoverEmail,
          token: resetOtpCode.trim(),
          type: 'recovery',
        });
      }

      await api.post('/api/auth/reset-password', {
        email: recoverEmail,
        password: resetPassword,
      });

      setResetSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setResetError(err.message);
      } else {
        setResetError('Falha ao redefinir palavra-passe.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const currentQuote = TESTIMONIALS[activeTestimonial];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* ========================================================================= */}
      {/* PAINEL ESQUERDO: FOTOGRAFIA FULL-BLEED + TESTEMUNHO + CARROSSEL (DESKTOP)  */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex relative w-full lg:w-[60%] xl:w-[62%] min-h-screen bg-slate-900 overflow-hidden flex-col justify-between p-6 sm:p-10 lg:p-12">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
          style={{ backgroundImage: `url('${currentQuote.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30" />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-5 h-5 text-secondary stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white drop-shadow">KulimaTech</span>
              <span className="block text-[10px] font-medium tracking-wide uppercase text-white/80 drop-shadow">
                SDAE Nhamatanda • Sofala
              </span>
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Rede Agrária de Nhamatanda</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-xl">
          <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 text-white shadow-2xl">
            <p className="text-sm sm:text-base italic leading-relaxed text-white/95 mb-4">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-surface">{currentQuote.author}</h4>
              <p className="text-xs text-white/70">{currentQuote.role}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Província de Sofala • Moçambique</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevTestimonial}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextTestimonial}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="Próximo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAINEL DIREITO: FORMULÁRIO UNIFICADO (COM SUPORTE A OTP E LINK)           */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[40%] xl:w-[38%] min-h-screen flex flex-col justify-between p-6 sm:p-8 lg:p-10 bg-white overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between lg:justify-end">
            <Link href="/" className="lg:hidden inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                <Sprout className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-bold text-lg text-primary">KulimaTech</span>
            </Link>

            <Link
              href="/"
              className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              ← Voltar ao Início
            </Link>
          </div>

          {/* Seletor de Abas (Entrar / Criar Conta) */}
          {(mode === 'login' || (mode === 'register' && !regSuccessEmail)) && (
            <div className="p-1 rounded-2xl bg-slate-100 flex items-center">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Iniciar Sessão
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>
          )}

          {/* =================================================================== */}
          {/* MODO 1: INICIAR SESSÃO                                              */}
          {/* =================================================================== */}
          {mode === 'login' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-primary tracking-tight">
                  Bem-vindo de volta!
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Introduza as suas credenciais para aceder ao painel operacional do SDAE.
                </p>
              </div>


              {searchParams.get('sessionExpired') === 'true' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 shadow-xs">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>A sua sessão expirou por inatividade ou segurança. Por favor, inicie sessão novamente para continuar.</span>
                </div>
              )}

              {(loginValidationError || loginApiError) && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{loginValidationError || loginApiError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                    Endereço de E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="utilizador@kulimatech.gov.mz"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-primary placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-secondary transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                      Palavra-passe
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('recover')}
                      className="text-xs font-semibold text-secondary hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      type={loginShowPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-primary placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-secondary transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setLoginShowPassword(!loginShowPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-primary text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoginLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Entrar no Sistema</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* =================================================================== */}
          {/* MODO 2: CRIAR CONTA + ENTRADA DE CÓDIGO OTP                          */}
          {/* =================================================================== */}
          {mode === 'register' && (
            <div className="space-y-6">
              {regSuccessEmail ? (
                /* Card Interativo: Validação por OTP ou Link */
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-5 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mx-auto shadow-sm">
                    <KeyRound className="w-7 h-7 stroke-[2.2]" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-primary">Insira o Código de Confirmação</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Enviámos uma mensagem com código de validação para <strong className="text-secondary">{regSuccessEmail}</strong>.
                    </p>
                  </div>

                  {/* Informação prática de suporte móvel */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-left text-xs text-slate-600 space-y-1.5 shadow-xs">
                    <p className="font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      <span>Leu o e-mail no telemóvel?</span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Basta copiar o código de 6 ou 8 dígitos que recebeu na sua caixa de entrada (ou pasta de spam) e introduzi-lo aqui no seu computador:
                    </p>
                  </div>

                  {otpError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-left flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {resendSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-left flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                      <span>Novo código enviado com sucesso! Verifique a sua caixa postal.</span>
                    </div>
                  )}

                  {/* Formulário do Código OTP */}
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="otp-input" className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Código de Confirmação (OTP)
                      </label>
                      <input
                        id="otp-input"
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ''))}
                        placeholder="Ex: 76654239"
                        maxLength={10}
                        className="w-full text-center tracking-widest text-lg font-mono font-bold py-3 px-4 rounded-xl bg-white border border-slate-300 text-primary placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-secondary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-primary text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {otpLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Validar Código & Aceder</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpLoading}
                      className="font-semibold text-secondary hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${otpLoading ? 'animate-spin' : ''}`} />
                      <span>Reenviar Código</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRegSuccessEmail(null);
                        switchMode('login');
                      }}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      Voltar ao Login
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h1 className="text-2xl font-black text-primary tracking-tight">
                      Crie a sua Conta
                    </h1>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Registe-se para monitorar parcelas e receber recomendações técnicas.
                    </p>
                  </div>

                  {regError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label htmlFor="reg-nome" className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          id="reg-nome"
                          type="text"
                          required
                          value={regNome}
                          onChange={(e) => setRegNome(e.target.value)}
                          placeholder="Ex: Mateus Cossa"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="reg-email" className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Endereço de E-mail
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="reg-email"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="seu.email@exemplo.com"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label htmlFor="reg-telefone" className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                          Contacto Telefónico
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <input
                            id="reg-telefone"
                            type="tel"
                            value={regTelefone}
                            onChange={(e) => setRegTelefone(e.target.value)}
                            placeholder="+258 84..."
                            className="w-full pl-8 pr-2 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-accent focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="reg-zona" className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                          Zona de Atuação
                        </label>
                        <select
                          id="reg-zona"
                          value={regZona}
                          onChange={(e) => setRegZona(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-accent focus:outline-none"
                        >
                          {NHAMATANDA_ZONAS.map((z) => (
                            <option key={z} value={z}>
                              {z}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Perfil de Utilizador
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegRole('AGRICULTOR')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            regRole === 'AGRICULTOR'
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          Agricultor Familiar
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('TECNICO')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            regRole === 'TECNICO'
                              ? 'bg-secondary text-white border-secondary'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          Técnico SDAE
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label htmlFor="reg-password" className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                          Palavra-passe
                        </label>
                        <div className="relative">
                          <input
                            id="reg-password"
                            type={regShowPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Mín. 6 caracteres"
                            className="w-full pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-accent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setRegShowPassword(!regShowPassword)}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                            title={regShowPassword ? "Ocultar palavra-passe" : "Ver palavra-passe"}
                          >
                            {regShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="reg-confirm-password" className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                          Confirmar
                        </label>
                        <div className="relative">
                          <input
                            id="reg-confirm-password"
                            type={regShowConfirmPassword ? 'text' : 'password'}
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Repita a senha"
                            className="w-full pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-accent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setRegShowConfirmPassword(!regShowConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                            title={regShowConfirmPassword ? "Ocultar palavra-passe" : "Ver palavra-passe"}
                          >
                            {regShowConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regTerms}
                        onChange={(e) => setRegTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-primary focus:ring-accent"
                      />
                      <span className="text-[11px] text-slate-500 leading-tight">
                        Concordo com os termos e autorizo o envio do código de confirmação.
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-primary text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {regLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Criar Conta</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* MODO 3: RECUPERAR PALAVRA-PASSE VIA SUPABASE                        */}
          {/* =================================================================== */}
          {mode === 'recover' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para Iniciar Sessão</span>
                </button>
                <h1 className="text-2xl font-black text-primary tracking-tight">
                  Recuperar Palavra-passe
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Introduza o e-mail associado à sua conta. Enviaremos as instruções e o código de recuperação.
                </p>
              </div>

              {recoverSuccess ? (
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-primary">Link e Código Enviados!</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Enviámos as instruções para <strong className="text-secondary">{recoverEmail}</strong>.
                    </p>
                  </div>
                  {recoverOtp && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-amber-600" />
                          Código OTP:
                        </span>
                        <span className="font-mono font-black text-sm text-primary bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 tracking-wider">
                          {recoverOtp}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-tight">
                        Código sincronizado com o Supabase. Já o pré-preenchemos para si!
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pode clicar no link recebido no e-mail ou introduzir o código para redefinir agora mesmo.
                  </p>
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-primary text-white hover:bg-secondary transition-all flex items-center justify-center gap-2"
                  >
                    <span>Avançar para Redefinir Senha</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  {recoverError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span>{recoverError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRecoverSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="recover-email" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                        Endereço de E-mail
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="recover-email"
                          type="email"
                          required
                          value={recoverEmail}
                          onChange={(e) => setRecoverEmail(e.target.value)}
                          placeholder="seu.email@kulimatech.gov.mz"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-primary placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-secondary transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={recoverLoading}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-primary text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {recoverLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Enviar Link e Código de Recuperação</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* MODO 4: REDEFINIR NOVA PALAVRA-PASSE (COM SUPORTE A CÓDIGO OTP)    */}
          {/* =================================================================== */}
          {mode === 'reset' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para Iniciar Sessão</span>
                </button>
                <h1 className="text-2xl font-black text-primary tracking-tight">
                  Definir Nova Palavra-passe
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Introduza o código recebido no seu e-mail e a nova palavra-passe.
                </p>
              </div>

              {resetSuccess ? (
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-primary">Palavra-passe Atualizada!</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      A sua nova palavra-passe foi guardada com sucesso. Já pode aceder à sua conta.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-primary text-white hover:bg-secondary transition-all"
                  >
                    Iniciar Sessão Agora
                  </button>
                </div>
              ) : (
                <>
                  {resetError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    {/* Código de Recuperação OTP */}
                    <div className="space-y-1.5">
                      <label htmlFor="reset-otp-input" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                        Código de Recuperação (Recebido por E-mail)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          id="reset-otp-input"
                          type="text"
                          value={resetOtpCode}
                          onChange={(e) => setResetOtpCode(e.target.value.replace(/\s+/g, ''))}
                          placeholder="Ex: 76654239"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        (Se abriu diretamente pelo link do e-mail, pode deixar este campo em branco)
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                        Nova Palavra-passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="new-password"
                          type={resetShowPassword ? 'text' : 'password'}
                          required
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setResetShowPassword(!resetShowPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {resetShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="confirm-new-password" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                        Confirmar Nova Palavra-passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="confirm-new-password"
                          type={resetShowConfirmPassword ? 'text' : 'password'}
                          required
                          value={resetConfirmPassword}
                          onChange={(e) => setResetConfirmPassword(e.target.value)}
                          placeholder="Repita a nova palavra-passe"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setResetShowConfirmPassword(!resetShowConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {resetShowConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-primary text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {resetLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Salvar Nova Palavra-passe</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        {/* Rodapé Institucional */}
        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            KulimaTech © 2026 • SDAE Nhamatanda & UniZambeze • Sofala, Moçambique
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
