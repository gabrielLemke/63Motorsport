import { useState, useEffect } from 'react';
import {
  Search,
  MessageCircle,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  ChevronDown,
  Car,
  Wrench,
  RefreshCw
} from 'lucide-react';
import { AdminQuote, QuoteStatus } from '../../types/admin';
import { adminApi } from '../../services/adminApi';
import { StatusBadge } from './AdminDashboard';

interface AdminQuotesGridProps {
  onRefreshMetrics?: () => void;
  onCreateOrder?: (quote: AdminQuote) => void;
}

export function AdminQuotesGrid({ onRefreshMetrics, onCreateOrder }: AdminQuotesGridProps) {
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuoteDetails, setSelectedQuoteDetails] = useState<AdminQuote | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getQuotes({
        status: statusFilter,
        search: searchQuery
      });
      setQuotes(data);
    } catch (err) {
      console.error('Erro ao buscar orçamentos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [statusFilter, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: QuoteStatus) => {
    try {
      await adminApi.updateQuoteStatus(id, newStatus);
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
      );
      setActiveDropdownId(null);
      if (onRefreshMetrics) onRefreshMetrics();
    } catch (err) {
      console.error('Falha ao atualizar status:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente remover o orçamento de ${name}?`)) return;

    try {
      await adminApi.deleteQuote(id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      if (selectedQuoteDetails?.id === id) setSelectedQuoteDetails(null);
      if (onRefreshMetrics) onRefreshMetrics();
    } catch (err) {
      console.error('Falha ao remover:', err);
    }
  };

  const filterTabs = [
    { key: 'ALL', label: 'Todos' },
    { key: 'PENDING', label: 'Pendentes' },
    { key: 'CONTACTED', label: 'Contatados' },
    { key: 'SCHEDULED', label: 'Agendados' },
    { key: 'COMPLETED', label: 'Concluídos' },
    { key: 'CANCELLED', label: 'Cancelados' }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white font-['Montserrat']">
            Grid de Orçamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestão de leads recebidos, status de atendimento e conversão direta via WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadQuotes}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 bg-[#151820] border border-white/10 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-red-500" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, veículo, telefone ou serviço..."
              className="w-full bg-[#0D0E12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-[#181B22] text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-400">Carregando orçamentos...</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-12 text-center">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Nenhum Orçamento Encontrado
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Não há solicitações correspondentes aos filtros selecionados. Tente alterar os termos da busca.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Data Grid View (hidden on small mobile) */}
          <div className="hidden lg:block bg-[#12141A] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#151820] border-b border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Cliente & Contato</th>
                  <th className="py-3.5 px-4">Veículo</th>
                  <th className="py-3.5 px-4">Serviço Solicitado</th>
                  <th className="py-3.5 px-4">Ticket Est.</th>
                  <th className="py-3.5 px-4">Status & Alteração</th>
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {quotes.map((q) => {
                  const whatsappUrl = adminApi.createWhatsAppMessageUrl(
                    q.phone,
                    q.name,
                    q.vehicle,
                    q.serviceLabel
                  );

                  return (
                    <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Cliente */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{q.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <span>{q.phone}</span>
                        </div>
                        {q.email && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                            {q.email}
                          </div>
                        )}
                      </td>

                      {/* Veículo */}
                      <td className="py-4 px-4">
                        <div className="text-slate-100 font-semibold">{q.vehicle}</div>
                      </td>

                      {/* Serviço */}
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#181B22] text-slate-200 border border-white/10">
                          {q.serviceLabel}
                        </span>
                        {q.message && (
                          <button
                            type="button"
                            onClick={() => setSelectedQuoteDetails(q)}
                            className="block text-[11px] text-red-400 hover:text-red-300 mt-1 underline cursor-pointer"
                          >
                            Ver detalhes do projeto
                          </button>
                        )}
                      </td>

                      {/* Valor Estimado */}
                      <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                        R$ {q.estimatedValue.toLocaleString('pt-BR')}
                      </td>

                      {/* Status Selector Dropdown */}
                      <td className="py-4 px-4">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDropdownId(activeDropdownId === q.id ? null : q.id)
                            }
                            className="inline-flex items-center gap-1.5 focus:outline-none"
                          >
                            <StatusBadge status={q.status} />
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          {activeDropdownId === q.id && (
                            <div className="absolute left-0 mt-2 w-40 rounded-xl bg-[#1C1F28] border border-white/10 shadow-2xl py-1 z-30 divide-y divide-white/5">
                              <button
                                onClick={() => handleStatusChange(q.id, 'PENDING')}
                                className="w-full text-left px-3 py-1.5 text-xs text-amber-400 hover:bg-white/5 flex items-center gap-2"
                              >
                                <Clock className="w-3.5 h-3.5" /> Pendente
                              </button>
                              <button
                                onClick={() => handleStatusChange(q.id, 'CONTACTED')}
                                className="w-full text-left px-3 py-1.5 text-xs text-blue-400 hover:bg-white/5 flex items-center gap-2"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Contatado
                              </button>
                              <button
                                onClick={() => handleStatusChange(q.id, 'SCHEDULED')}
                                className="w-full text-left px-3 py-1.5 text-xs text-purple-400 hover:bg-white/5 flex items-center gap-2"
                              >
                                <Calendar className="w-3.5 h-3.5" /> Agendado
                              </button>
                              <button
                                onClick={() => handleStatusChange(q.id, 'COMPLETED')}
                                className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-white/5 flex items-center gap-2"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Concluído
                              </button>
                              <button
                                onClick={() => handleStatusChange(q.id, 'CANCELLED')}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 flex items-center gap-2"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancelado
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Data */}
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(q.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onCreateOrder && (
                            <button
                              onClick={() => onCreateOrder(q)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:text-white bg-[#1C1F28] hover:bg-red-600/30 border border-white/10 hover:border-red-500/30 transition-all shadow-sm"
                              title="Gerar Ordem de Serviço (OS) a partir deste orçamento"
                            >
                              <Wrench className="w-3.5 h-3.5 text-red-500" />
                              <span>Gerar OS</span>
                            </button>
                          )}

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => handleDelete(q.id, q.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remover orçamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View (shown on screens < 1024px) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
            {quotes.map((q) => {
              const whatsappUrl = adminApi.createWhatsAppMessageUrl(
                q.phone,
                q.name,
                q.vehicle,
                q.serviceLabel
              );

              return (
                <div
                  key={q.id}
                  className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg space-y-3 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{q.name}</h3>
                      <p className="text-xs font-mono text-slate-400">{q.phone}</p>
                    </div>
                    <StatusBadge status={q.status} />
                  </div>

                  <div className="bg-[#171A22] rounded-xl p-3 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                      <Car className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{q.vehicle}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Serviço: <strong className="text-slate-200">{q.serviceLabel}</strong>
                    </div>
                    <div className="text-xs font-mono text-emerald-400 font-bold">
                      Ticket Estimado: R$ {q.estimatedValue.toLocaleString('pt-BR')}
                    </div>
                  </div>

                  {q.message && (
                    <div className="text-xs text-slate-300 bg-black/30 p-2.5 rounded-lg border border-white/5 italic">
                      "{q.message}"
                    </div>
                  )}

                  {/* Status Picker for Mobile */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Alterar:</span>
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q.id, e.target.value as QuoteStatus)}
                        className="bg-[#1A1D24] text-xs font-bold rounded-lg px-2.5 py-1.5 text-slate-200 border border-white/10 focus:outline-none focus:border-red-500"
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="CONTACTED">Contatado</option>
                        <option value="SCHEDULED">Agendado</option>
                        <option value="COMPLETED">Concluído</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleDelete(q.id, q.name)}
                      className="p-1.5 text-slate-500 hover:text-red-400"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {onCreateOrder && (
                      <button
                        onClick={() => onCreateOrder(q)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-[#1A1D26] hover:bg-red-600/30 border border-white/10 hover:border-red-500/30 transition-all"
                      >
                        <Wrench className="w-3.5 h-3.5 text-red-500" />
                        <span>Gerar OS</span>
                      </button>
                    )}

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all shadow-md"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Quote Detail Modal */}
      {selectedQuoteDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#13151A] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Detalhes do Projeto
              </h3>
              <button
                onClick={() => setSelectedQuoteDetails(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Cliente</span>
                <span className="text-sm font-bold text-white">{selectedQuoteDetails.name}</span>
                <span className="text-slate-400 block font-mono">{selectedQuoteDetails.phone}</span>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Veículo</span>
                <span className="text-sm font-semibold text-slate-200">{selectedQuoteDetails.vehicle}</span>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Serviço</span>
                <span className="text-sm font-semibold text-red-400">{selectedQuoteDetails.serviceLabel}</span>
              </div>

              {selectedQuoteDetails.message && (
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Mensagem do Cliente</span>
                  <div className="mt-1 p-3 rounded-xl bg-black/40 border border-white/5 text-slate-300 text-xs whitespace-pre-wrap leading-relaxed">
                    {selectedQuoteDetails.message}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedQuoteDetails(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Fechar
              </button>
              <a
                href={adminApi.createWhatsAppMessageUrl(
                  selectedQuoteDetails.phone,
                  selectedQuoteDetails.name,
                  selectedQuoteDetails.vehicle,
                  selectedQuoteDetails.serviceLabel
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Iniciar Atendimento
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
