import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { QuoteInput, ServiceType } from '../types';
import { submitQuote } from '../services/api';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceType;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose, initialService }) => {
  const [formData, setFormData] = useState<QuoteInput>({
    name: '',
    phone: '',
    email: '',
    vehicle: '',
    service: initialService || 'REMAP_STAGE2',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await submitQuote(formData);
      setSuccess(true);

      // Aguarda 1.2 segundos para feedback visual e redireciona para o WhatsApp
      setTimeout(() => {
        window.open(response.data.whatsappUrl, '_blank');
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12141A] border border-zinc-700/80 rounded-2xl shadow-2xl p-5 sm:p-8 text-left max-h-[92vh] overflow-y-auto">
        
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-racing">
              Orçamento Solicitado!
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm">
              Conectando você diretamente ao preparador no WhatsApp...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 sm:mb-6 pr-8">
              <span className="text-[11px] sm:text-xs text-red-500 font-bold uppercase tracking-wider">
                63 Motorsport Lab
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-racing tracking-tight mt-0.5">
                Solicitar Orçamento Técnico
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Preencha os dados do seu veículo para direcionarmos sua consultoria com o preparador responsável.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm sm:text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(47) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm sm:text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Veículo & Motor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Golf GTI 2.0 TSI MK7"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm sm:text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Serviço de Interesse *</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value as ServiceType })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="REMAP_STAGE1">Remap Stage 1 (ECU)</option>
                    <option value="REMAP_STAGE2">Remap Stage 2 (Downpipe + Intake)</option>
                    <option value="REMAP_STAGE3">Remap Stage 3 (Turbina Híbrida)</option>
                    <option value="FORGED_ENGINE">Motor Forjado & Bielas/Pistões</option>
                    <option value="DYNO_TUNING">Passagem de Dinamômetro</option>
                    <option value="TRACK_PREP">Track-Day Prep & Freios/Suspensão</option>
                    <option value="MAINTENANCE">Manutenção Mecânica de Performance</option>
                    <option value="OTHER">Outro Projeto Customizado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">E-mail (Opcional)</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm sm:text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Detalhes do Projeto / Upgrades Atuais</label>
                <textarea
                  rows={2}
                  placeholder="Conte se o carro já possui algum upgrade (escape, filtro, turbina) ou sua meta de potência..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm sm:text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-extrabold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50 text-xs sm:text-sm font-racing"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando Orçamento...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar & Iniciar Conversa no WhatsApp
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
