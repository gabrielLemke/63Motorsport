import { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  Share,
  PlusSquare,
  CheckCircle2,
  Wrench,
  MoreVertical,
  Sparkles,
  ExternalLink
} from 'lucide-react';

declare global {
  interface Window {
    __deferredPwaPrompt?: any;
  }
}

interface PwaInstallPromptProps {
  onOpenOperationsApp: () => void;
  forceOpenModal?: boolean;
  onCloseForcedModal?: () => void;
}

export type DevicePlatform = 'ios' | 'android' | 'desktop';

export function detectPlatform(): DevicePlatform {
  const ua = window.navigator.userAgent.toLowerCase();
  const isIos =
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIos) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

export function isRunningStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as any).standalone) ||
    new URLSearchParams(window.location.search).get('source') === 'pwa'
  );
}

export function PwaInstallPrompt({
  onOpenOperationsApp,
  forceOpenModal = false,
  onCloseForcedModal
}: PwaInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => window.__deferredPwaPrompt || null);
  const [platform, setPlatform] = useState<DevicePlatform>('desktop');
  const [isStandalone, setIsStandalone] = useState(false);
  const [showAutoPrompt, setShowAutoPrompt] = useState(false);
  const [showStepGuide, setShowStepGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    const detected = detectPlatform();
    const standalone = isRunningStandalone();
    setPlatform(detected);
    setIsStandalone(standalone);

    // Se o usuário acessar pelo celular (Google / Safari / Chrome no iPhone ou Android) e ainda não estiver no App instalado,
    // encaminha automaticamente para baixar/instalar o aplicativo!
    const dismissedSession = sessionStorage.getItem('63motorsport_pwa_prompt_dismissed');
    const isMobileViewport = window.innerWidth <= 900 || detected === 'ios' || detected === 'android';

    if (!standalone && isMobileViewport && !dismissedSession) {
      const timer = setTimeout(() => {
        setShowAutoPrompt(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__deferredPwaPrompt = e;
      setDeferredPrompt(e);
    };

    const handleCustomReady = () => {
      if (window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt);
      }
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      window.__deferredPwaPrompt = null;
      setTimeout(() => {
        setShowAutoPrompt(false);
        if (onCloseForcedModal) onCloseForcedModal();
      }, 2200);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handleCustomReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handleCustomReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onCloseForcedModal]);

  const handleDismiss = () => {
    sessionStorage.setItem('63motorsport_pwa_prompt_dismissed', '1');
    setShowAutoPrompt(false);
    setShowStepGuide(false);
    if (onCloseForcedModal) onCloseForcedModal();
  };

  const handleTriggerInstall = async () => {
    const activePrompt = deferredPrompt || window.__deferredPwaPrompt;

    if (activePrompt) {
      try {
        activePrompt.prompt();
        const choiceResult = await activePrompt.userChoice;
        if (choiceResult?.outcome === 'accepted') {
          setInstalledSuccess(true);
          window.__deferredPwaPrompt = null;
          setDeferredPrompt(null);
        }
        return;
      } catch (err) {
        console.warn('Erro ao disparar prompt nativo PWA:', err);
      }
    }

    // Se estiver no iPhone (iOS) ou no WebView do Google onde o prompt nativo exige ação pelo menu do navegador,
    // exibe o passo a passo visual imediato para instalar na tela inicial
    setShowStepGuide(true);
  };

  const isVisible = (showAutoPrompt && !isStandalone) || forceOpenModal;
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#11131A] border border-red-500/40 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] overflow-hidden relative">
        {/* Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        <div className="p-5 sm:p-6 space-y-5">
          {/* Header with App Icon & Close */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#090A0D] border-2 border-red-500/50 flex flex-col items-center justify-center shadow-lg shrink-0 relative">
                <span className="font-['Montserrat'] font-black italic text-xl text-white leading-none">
                  63
                </span>
                <span className="text-[7px] font-mono font-bold text-red-500 tracking-widest mt-0.5">
                  APP PRO
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090A0D] absolute -top-1 -right-1" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>App Oficial PWA / TWA</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight font-['Montserrat']">
                  Baixar App 63 Motorsport
                </h3>
                <p className="text-xs text-slate-400">
                  Compatível com <strong className="text-slate-200">iPhone (iOS)</strong>,{' '}
                  <strong className="text-slate-200">Android</strong> e Computador
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {installedSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white uppercase">
                Aplicativo Instalado com Sucesso!
              </h4>
              <p className="text-xs text-slate-300">
                O ícone oficial <strong>63 Motorsport</strong> já foi adicionado à tela inicial do seu aparelho.
              </p>
            </div>
          ) : (
            <>
              {/* Recursos do App para Mecânicos, Operação e Clientes */}
              <div className="bg-[#171A24] border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="font-bold text-white uppercase text-[11px] tracking-wider text-red-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Acesso Rápido para Mecânicos, Operação e Diretoria:</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Checklist de entrada e saída do veículo direto na rampa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Câmera integrada para tirar fotos de evidência pelo celular</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Histórico completo do início ao fim da manutenção e Laudo PDF</span>
                  </li>
                </ul>
              </div>

              {/* Guia Visual Específico se for iPhone (iOS) ou se o usuário clicou para ver instruções */}
              {(platform === 'ios' || showStepGuide) && (
                <div className="bg-[#0D0F14] border border-amber-500/30 rounded-xl p-4 space-y-3">
                  {platform === 'ios' ? (
                    <>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                        <Share className="w-4 h-4 shrink-0" />
                        <span>Como Instalar no iPhone / iPad (iOS):</span>
                      </div>
                      <ol className="space-y-2 text-xs text-slate-200">
                        <li className="flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold shrink-0">
                            1
                          </span>
                          <span>
                            Toque no ícone <strong>Compartilhar</strong>{' '}
                            <Share className="w-3.5 h-3.5 inline text-blue-400 mx-0.5" /> na barra inferior (Safari) ou superior (Chrome/Google).
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold shrink-0">
                            2
                          </span>
                          <span>
                            Role o menu e toque em{' '}
                            <strong className="text-white">
                              "Adicionar à Tela de Início" <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" />
                            </strong>
                            .
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold shrink-0">
                            3
                          </span>
                          <span>
                            Confirme em <strong>"Adicionar"</strong> para baixar o App na tela do seu iPhone!
                          </span>
                        </li>
                      </ol>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                        <MoreVertical className="w-4 h-4 shrink-0" />
                        <span>Instalação Rápida no Android / Navegador Google:</span>
                      </div>
                      <ol className="space-y-2 text-xs text-slate-200">
                        <li className="flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold shrink-0">
                            1
                          </span>
                          <span>
                            Toque no menu de <strong>3 pontos (⋮)</strong> no canto superior direito do navegador.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold shrink-0">
                            2
                          </span>
                          <span>
                            Selecione <strong>"Instalar aplicativo"</strong> ou{' '}
                            <strong>"Adicionar à tela inicial"</strong>.
                          </span>
                        </li>
                      </ol>
                    </>
                  )}
                </div>
              )}

              {/* Botões Principais de Ação */}
              <div className="space-y-2.5 pt-1">
                {platform !== 'ios' && (
                  <button
                    type="button"
                    onClick={handleTriggerInstall}
                    className="w-full py-3.5 px-4 rounded-xl font-black uppercase tracking-wider text-xs text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar / Instalar Aplicativo Agora</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleDismiss();
                    onOpenOperationsApp();
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all ${
                    platform === 'ios'
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_25px_rgba(239,68,68,0.4)]'
                      : 'bg-[#1D212D] hover:bg-[#262B3A] text-slate-100 border border-white/10'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  <span>Abrir Central dos Mecânicos / Operação</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                >
                  Continuar navegando no site
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
