'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  Briefcase,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { registerSchema } from '@/features/auth/schemas/authSchemas';

type AutoRegisterRole = 'AGRICULTOR' | 'TECNICO';

const NHAMATANDA_ZONAS_AGRICULTOR = [
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

const SDAE_POSTOS_TECNICO = [
  'Posto Administrativo de Tica (Extensão Agrária)',
  'Posto Administrativo de Nhamatanda-Sede',
  'Setor Agrícola de Lamego & Bebedo',
  'Zona Agroecológica de Metuchira',
  'Sede Distrital do SDAE Nhamatanda',
];

export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth();

  const [role, setRole] = useState<AutoRegisterRole>('AGRICULTOR');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [zonaAtuacao, setZonaAtuacao] = useState(NHAMATANDA_ZONAS_AGRICULTOR[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Força da senha
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Vazia', color: 'bg-gray-200' };
    if (pass.length < 6) return { score: 1, label: 'Muito Fraca', color: 'bg-red-500' };
    if (pass.length < 8) return { score: 2, label: 'Fraca', color: 'bg-amber-500' };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    if (hasLetters && hasNumbers && hasSpecial && pass.length >= 8) {
      return { score: 4, label: 'Excelente', color: 'bg-[#95C623]' };
    }
    if ((hasLetters && hasNumbers) || pass.length >= 8) {
      return { score: 3, label: 'Boa', color: 'bg-[#8EB69B]' };
    }
    return { score: 2, label: 'Regular', color: 'bg-amber-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleRoleChange = (newRole: AutoRegisterRole) => {
    setRole(newRole);
    setZonaAtuacao(
      newRole === 'AGRICULTOR'
        ? NHAMATANDA_ZONAS_AGRICULTOR[0]
        : SDAE_POSTOS_TECNICO[0]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    // Validações imediatas
    if (password !== confirmPassword) {
      setValidationError('As senhas introduzidas não coincidem.');
      return;
    }

    if (!termsAccepted) {
      setValidationError('É necessário aceitar os termos de cooperação agrária.');
      return;
    }

    const payload = {
      nome,
      email,
      password,
      telefone: telefone.trim() || undefined,
      role,
      zonaAtuacao,
    };

    const parseResult = registerSchema.safeParse(payload);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      setValidationError(firstIssue.message);
      return;
    }

    try {
      await register(payload);
    } catch {
      // Erro é tratado e disponibilizado pelo hook useAuth
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FEFAE0] text-[#002626]">
      {/* ========================================================================= */}
      {/* PAINEL ESQUERDO: INSTITUCIONAL & BENEFÍCIOS DO REGISTO                    */}
      {/* ========================================================================= */}
      <div className="lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-[#002626] via-[#0E4749] to-[#002626] text-[#FEFAE0] p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#95C623]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8EB69B]/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#95C623] text-[#002626] flex items-center justify-center shadow-lg shadow-[#95C623]/20 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#FEFAE0]">iMunda</span>
              <span className="block text-[11px] font-medium tracking-wide uppercase text-[#8EB69B]">
                SDAE Nhamatanda • Sofala
              </span>
            </div>
          </Link>

          <div className="mt-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8EB69B]/20 border border-[#8EB69B]/30 text-xs font-semibold text-[#95C623]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apoio à Decisão no Distrito de Nhamatanda</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-[#FEFAE0]">
              Junte-se à rede de monitoria e extensão agrária.
            </h1>
            <p className="text-[#8EB69B] text-base leading-relaxed max-w-lg">
              Registe-se para aceder ao mapa de parcelas, consultar os índices hídricos e receber
              orientações oficiais para mitigar os impactos da estiagem em Moçambique.
            </p>
          </div>
        </div>

        {/* Informações dos Perfis */}
        <div className="my-8 relative z-10 space-y-3.5 max-w-md hidden sm:block">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-[#95C623]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Para Agricultores Familiares</span>
            </div>
            <p className="text-xs text-[#8EB69B] mt-1 leading-relaxed">
              Registe as suas parcelas, consulte o limiar de humidade ideal para milho, feijão ou
              hortícolas e envie dúvidas agronómicas diretamente ao técnico da sua zona.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-[#95C623]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Para Técnicos do SDAE</span>
            </div>
            <p className="text-xs text-[#8EB69B] mt-1 leading-relaxed">
              Acompanhe produtores rurais nos postos administrativos de Tica e Nhamatanda-Sede,
              emita pareceres técnicos e faça a triagem fitossanitária de ocorrências.
            </p>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#8EB69B]">
          <span>Parceria Científica UniZambeze</span>
          <span>Plataforma Oficial SDAE</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAINEL DIREITO: FORMULÁRIO DE REGISTO                                      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6 my-auto">
          {/* Cabeçalho */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#002626]">
              Criar Conta no iMunda
            </h2>
            <p className="text-sm text-[#0E4749]/80">
              Preencha os dados abaixo para iniciar o seu cadastro na plataforma.
            </p>
          </div>

          {/* Banner de Erros */}
          {(validationError || error) && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in duration-200"
            >
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Erro na validação do registo</span>
                <p className="text-xs text-red-700 mt-0.5">{validationError || error}</p>
              </div>
            </div>
          )}

          {/* Seleção do Perfil (Agricultor vs Técnico SDAE) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0E4749]">
              Tipo de Perfil
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('AGRICULTOR')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${role === 'AGRICULTOR'
                    ? 'bg-[#002626] text-[#FEFAE0] border-[#002626] shadow-md ring-2 ring-[#95C623]'
                    : 'bg-white text-[#002626] border-[#8EB69B]/40 hover:border-[#0E4749]'
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold">Agricultor</span>
                  <Sprout className={`w-4 h-4 ${role === 'AGRICULTOR' ? 'text-[#95C623]' : 'text-[#0E4749]'}`} />
                </div>
                <span
                  className={`text-[11px] mt-2 block ${role === 'AGRICULTOR' ? 'text-[#8EB69B]' : 'text-[#0E4749]/70'
                    }`}
                >
                  Produtor familiar no distrito
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('TECNICO')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${role === 'TECNICO'
                    ? 'bg-[#002626] text-[#FEFAE0] border-[#002626] shadow-md ring-2 ring-[#95C623]'
                    : 'bg-white text-[#002626] border-[#8EB69B]/40 hover:border-[#0E4749]'
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold">Técnico SDAE</span>
                  <Briefcase className={`w-4 h-4 ${role === 'TECNICO' ? 'text-[#95C623]' : 'text-[#0E4749]'}`} />
                </div>
                <span
                  className={`text-[11px] mt-2 block ${role === 'TECNICO' ? 'text-[#8EB69B]' : 'text-[#0E4749]/70'
                    }`}
                >
                  Extensionista e validador
                </span>
              </button>
            </div>
          </div>

          {/* Formulário Principal */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label htmlFor="nome" className="block text-xs font-bold uppercase tracking-wider text-[#0E4749]">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0E4749]/60">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Mateus João Cossa"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#8EB69B]/40 text-[#002626] placeholder-[#0E4749]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#95C623] focus:border-[#0E4749] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Linha dupla: E-mail e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* E-mail */}
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="block text-xs font-bold uppercase tracking-wider text-[#0E4749]">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0E4749]/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.mz"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#8EB69B]/40 text-[#002626] placeholder-[#0E4749]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#95C623] focus:border-[#0E4749] transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label htmlFor="telefone" className="block text-xs font-bold uppercase tracking-wider text-[#0E4749]">
                  Contacto (Moçambique)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0E4749]/60">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="+258 84 123 4567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#8EB69B]/40 text-[#002626] placeholder-[#0E4749]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#95C623] focus:border-[#0E4749] transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Campo Específico de Localização Conforme o Perfil */}
            <div className="space-y-1.5">
              <label htmlFor="zonaAtuacao" className="block text-xs font-bold uppercase tracking-wider text-[#0E4749]">
                {role === 'AGRICULTOR'
                  ? 'Zona / Comunidade de Residência (Nhamatanda)'
                  : 'Posto / Área de Atuação Técnica (SDAE)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0E4749]/60">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  id="zonaAtuacao"
                  value={zonaAtuacao}
                  onChange={(e) => setZonaAtuacao(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white border border-[#8EB69B]/40 text-[#002626] text-sm focus:outline-none focus:ring-2 focus:ring-[#95C623] focus:border-[#0E4749] transition-all shadow-sm appearance-none cursor-pointer"
                >
                  {(role === 'AGRICULTOR' ? NHAMATANDA_ZONAS_AGRICULTOR : SDAE_POSTOS_TECNICO).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Linha de Senha e Confirmação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Senha */}
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="block text-xs font-bold uppercase tracking-wider text-[#0E4749]">
                  Palavra-passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0E4749]/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 dígitos"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#8EB69B]/40 text-[#002626] placeholder-[#0E4749]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#95C623] focus:border-[#0E4749] transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#0E4749]/60 hover:text-[#002626]"
                    aria-label="Alternar senha"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmação de Senha */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-[#0E4749]">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0E4749]/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#8EB69B]/40 text-[#002626] placeholder-[#0E4749]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#95C623] focus:border-[#0E4749] transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Medidor visual de força da senha */}
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#0E4749]/70">Força da palavra-passe:</span>
                  <span className="font-bold text-[#002626]">{passwordStrength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                      } ${passwordStrength.score === 1 ? 'w-1/4' : passwordStrength.score === 2 ? 'w-2/4' : passwordStrength.score === 3 ? 'w-3/4' : 'w-full'}`}
                  />
                </div>
              </div>
            )}

            {/* Termos de Serviço */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#002626] focus:ring-[#95C623] border-[#8EB69B]/60 accent-[#002626]"
                />
                <span className="text-xs text-[#0E4749] leading-relaxed">
                  Concordo com o tratamento de dados agroclimáticos para fins de assistência e extensão
                  agrária do SDAE de Nhamatanda.
                </span>
              </label>
            </div>

            {/* Botões de Ação */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#002626] text-[#FEFAE0] hover:bg-[#0E4749] focus:outline-none focus:ring-2 focus:ring-[#95C623] focus:ring-offset-2 transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#FEFAE0]/30 border-t-[#FEFAE0] rounded-full animate-spin" />
                    <span>A criar conta...</span>
                  </>
                ) : (
                  <>
                    <span>Concluir Registo</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-[#0E4749] hover:bg-[#8EB69B]/20 transition-all text-center block"
              >
                Já possui uma conta? Iniciar Sessão
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}