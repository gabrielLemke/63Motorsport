import { useState, type FormEvent } from 'react';
import { Lock, Mail, ShieldAlert, ArrowLeft, Shield, Wrench, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { AdminUser } from '../../types/admin';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToSite: () => void;
}

export function AdminLogin({ onLoginSuccess, onBackToSite }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await adminApi.login(email, password);
      if (result.success) {
        onLoginSuccess(result.user);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Credenciais inválidas. Verifique o e-mail e a senha.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDirector = () => {
    setEmail('admin@63motorsport.com.br');
    setPassword('admin123');
    setErrorMessage(null);
  };

  const handleFillOperator = () => {
    setEmail('operador@63motorsport.com.br');
    setPassword('operador123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#090A0D] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background motorsport grid glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-black to-[#090A0D] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to site button */}
      <div className="w-full max-w-md mb-6 z-10 flex items-center justify-between">
        <button
          onClick={onBackToSite}
          type="button"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg bg-[#13151A] border border-white/5 hover:border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-red-500" />
          Voltar ao Site
        </button>

        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
          PORTAL OPERACIONAL & DIRETORIA
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#13151A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-sm">
        {/* Header with 63 Motorsport branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1C1F26] border border-red-500/30 text-red-500 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <Lock className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl font-black italic tracking-tighter text-white font-['Montserrat']">
              63<span className="text-red-500 font-normal">MOTORSPORT</span>
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-200 uppercase tracking-wider">
            Central de Operação & Diretoria
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle de pátio, clientes, carros, checklists, evidências e histórico de manutenção
          </p>
        </div>

        {/* Seletor Rápido de Perfil (Diretoria vs Operador) */}
        <div className="mb-6 space-y-2">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Selecionar Perfil de Acesso Rápido:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleFillDirector}
              className="p-3 rounded-xl bg-[#1A1D24] hover:bg-red-600/15 border border-white/10 hover:border-red-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-red-400">
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  Diretoria
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-600/20 text-red-400">
                  COMPLETO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">
                Operação + Financeiro, Telemetria, Orçamentos e OS
              </p>
            </button>

            <button
              type="button"
              onClick={handleFillOperator}
              className="p-3 rounded-xl bg-[#1A1D24] hover:bg-emerald-600/15 border border-white/10 hover:border-emerald-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-emerald-400">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  Operador / Pátio
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-400">
                  TÉCNICO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">
                Pátio, Checklist, Fotos, Carros e Histórico (Sem R$)
              </p>
            </button>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              E-mail de Acesso (Diretoria ou Operador)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@63motorsport.com.br ou operador@63motorsport.com.br"
                className="w-full bg-[#0D0E12] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0D0E12] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all duration-200 shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Conexão Criptografada SSL / Controle de Acesso por Perfil
          </p>
        </div>
      </div>
    </div>
  );
}
