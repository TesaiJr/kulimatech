'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sprout, Mail, ArrowLeft, Send, CheckCircle2, PhoneCall } from 'lucide-react';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FEFAE0] text-[#002626] p-6 sm:p-10">
      <div className="w-full max-w-md space-y-6">
        {/* Topo: Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-[#95C623] text-[#002626] flex items-center justify-center shadow-md">
              <Sprout className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold tracking-tight text-[#002626] block">iMunda</span>
              <span className="text-[10px] font-medium tracking-wide uppercase text-[#0E4749] block">
                SDAE Nhamatanda
              </span>
            </div>
          </Link>
        </div>

        {/* Card Principal */}
        <div className="p-8 rounded-3xl bg-white border border-[#8EB69B]/40 shadow-xl space-y-6">
          {!submitted ? (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-[#002626]">Recuperar Palavra-passe</h1>
                <p className="text-xs text-[#0E4749]/80 leading-relaxed">
                  Introduza o e-mail associado à sua conta do iMunda. Enviaremos as instruções
                  para redefinir a sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="recup-email" className="block text-xs font-bold uppercase tracking-wider text-[#0E4749]">
                    Endereço de E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0E4749]/60">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="recup-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@imunda.gov.mz"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#8EB69B]/40 text-[#002626] placeholder-[#0E4749]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#95C623] focus:border-[#0E4749] transition-all shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#002626] text-[#FEFAE0] hover:bg-[#0E4749] focus:outline-none focus:ring-2 focus:ring-[#95C623] transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-[#FEFAE0]/30 border-t-[#FEFAE0] rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enviar Instruções</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-[#95C623]/20 text-[#002626] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#002626]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#002626]">Instruções Enviadas</h3>
                <p className="text-xs text-[#0E4749]/80 max-w-xs mx-auto leading-relaxed">
                  Se o e-mail <span className="font-semibold text-[#002626]">{email}</span> estiver registado no
                  sistema, receberá uma mensagem com o link de recuperação.
                </p>
              </div>
            </div>
          )}

          {/* Suporte Local em Nhamatanda */}
          <div className="p-3.5 rounded-2xl bg-[#8EB69B]/15 border border-[#8EB69B]/30 flex items-start gap-3">
            <PhoneCall className="w-4 h-4 text-[#0E4749] shrink-0 mt-0.5" />
            <div className="text-xs text-[#0E4749] leading-relaxed">
              <span className="font-bold block text-[#002626]">Suporte em Campo (SDAE)</span>
              Agricultores sem acesso direto ao e-mail podem solicitar a recuperação presencialmente
              junto ao técnico extensionista da sua zona em Nhamatanda.
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002626] hover:text-[#0E4749] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao ecrã de Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}