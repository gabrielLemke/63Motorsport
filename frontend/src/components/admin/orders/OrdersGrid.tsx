import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  FileText,
  Printer,
  Edit,
  Trash2,
  Car,
  ChevronDown,
  RefreshCw,
  Clock,
  CheckCircle,
  Package,
  ClipboardCheck,
  Camera,
  History
} from 'lucide-react';
import { ServiceOrder, OrderStatus } from '../../../types/serviceOrder';
import { serviceOrderApi } from '../../../services/serviceOrderApi';
import { OrderPdfView } from './OrderPdfView';
import { OrderFormModal } from './OrderFormModal';
import { OrderOperationalModal } from './OrderOperationalModal';
import { AdminQuote, UserRole } from '../../../types/admin';

interface OrdersGridProps {
  initialQuoteForNewOS?: AdminQuote | null;
  onClearInitialQuote?: () => void;
  userRole?: UserRole;
  userName?: string;
}

export function OrdersGrid({
  initialQuoteForNewOS,
  onClearInitialQuote,
  userRole = 'DIRECTOR',
  userName = 'Equipe 63 Motorsport'
}: OrdersGridProps) {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isOperator = userRole === 'OPERATOR';

  // Modais
  const [selectedOrderForPdf, setSelectedOrderForPdf] = useState<ServiceOrder | null>(null);
  const [operationalOrder, setOperationalOrder] = useState<ServiceOrder | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await serviceOrderApi.listOrders({
        status: statusFilter,
        search: searchQuery
      });
      setOrders(data);
    } catch (err) {
      console.error('Erro ao carregar Ordens de Serviço:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, searchQuery]);

  // Se veio um orçamento para converter em OS, abre o modal automaticamente
  useEffect(() => {
    if (initialQuoteForNewOS) {
      setEditingOrder(null);
      setIsFormOpen(true);
    }
  }, [initialQuoteForNewOS]);

  const handleSaveOrder = async (payload: Partial<ServiceOrder>) => {
    if (editingOrder) {
      const updated = await serviceOrderApi.updateOrder(editingOrder.id, payload);
      setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? updated : o)));
    } else {
      const created = await serviceOrderApi.createOrder(payload);
      setOrders((prev) => [created, ...prev]);
      setOperationalOrder(created);
    }

    if (onClearInitialQuote) onClearInitialQuote();
  };

  const handleSaveOperationalChanges = async (
    id: string,
    payload: Partial<ServiceOrder>
  ): Promise<ServiceOrder> => {
    const updated = await serviceOrderApi.updateOrder(id, payload);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    if (operationalOrder?.id === id) {
      setOperationalOrder(updated);
    }
    return updated;
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      const updated = await serviceOrderApi.updateOrderStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      setActiveDropdownId(null);
    } catch (err) {
      console.error('Falha ao atualizar status da OS:', err);
    }
  };

  const handleDelete = async (id: string, osNumber: string) => {
    if (!window.confirm(`Deseja realmente excluir a ${osNumber}?`)) return;

    try {
      await serviceOrderApi.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      if (selectedOrderForPdf?.id === id) setSelectedOrderForPdf(null);
    } catch (err) {
      console.error('Falha ao excluir OS:', err);
    }
  };

  // KPIs
  const totalOrders = orders.length;
  const inProgressCount = orders.filter(
    (o) => o.status === 'IN_PROGRESS' || o.status === 'WAITING_PARTS'
  ).length;
  const completedCount = orders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'DELIVERED'
  ).length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalPhotos = orders.reduce((acc, o) => acc + (o.evidences?.length || 0), 0);

  const filterTabs = [
    { key: 'ALL', label: 'Todas' },
    { key: 'IN_PROGRESS', label: 'Em Execução' },
    { key: 'WAITING_PARTS', label: 'Aguardando Peças' },
    { key: 'COMPLETED', label: 'Concluídas' },
    { key: 'DELIVERED', label: 'Entregues' },
    { key: 'CANCELLED', label: 'Canceladas' }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white font-['Montserrat']">
              Ordens de Serviço (OS)
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-600/10 text-red-500 border border-red-500/30">
              OFICINA & DINÔ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Controle de manutenções, checklist de entrada/saída, fotos de evidência e geração de dossiê PDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 bg-[#151820] border border-white/10 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-red-500" />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => {
              setEditingOrder(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Ordem de Serviço</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total de OS
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">{totalOrders}</span>
          <p className="text-[10px] text-slate-500 mt-1">Registradas no sistema</p>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Em Andamento
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {inProgressCount}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Na oficina ou rampa</p>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Concluídas / Entregues
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {completedCount}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Aferidas em dinamômetro</p>
        </div>

        {!isOperator ? (
          <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Faturamento em OS
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Serviços e peças aplicadas</p>
          </div>
        ) : (
          <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Fotos & Evidências
            </span>
            <span className="text-xl sm:text-2xl font-black text-red-400 font-mono">
              {totalPhotos} fotos
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Anexadas nos prontuários</p>
          </div>
        )}
      </div>

      {/* Search & Filter Tabs */}
      <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Nº da OS, cliente, modelo do veículo, placa ou telefone..."
            className="w-full bg-[#0D0E12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-medium"
          />
        </div>

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

      {/* Orders List / Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-400">Carregando ordens de serviço...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Nenhuma Ordem de Serviço Encontrada
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            Crie sua primeira ordem de serviço para registrar os trabalhos realizados e gerar o PDF oficial.
          </p>
          <button
            onClick={() => {
              setEditingOrder(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova OS</span>
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-[#12141A] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#151820] border-b border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Nº da OS & Início/Fim</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Veículo & Placa</th>
                  <th className="py-3.5 px-4">Operação (Checklist / Fotos)</th>
                  {!isOperator && <th className="py-3.5 px-4">Valor Total</th>}
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {orders.map((o) => {
                  const chkCount = o.checklist?.items.length || 0;
                  const evCount = o.evidences?.length || 0;
                  const tlCount = o.timeline?.length || 0;

                  return (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* OS Number & Dates */}
                      <td className="py-4 px-4 font-mono">
                        <span className="font-black text-red-500 block">{o.osNumber}</span>
                        <span className="block text-[10px] text-slate-400">
                          Início: {new Date(o.maintenanceStartedAt || o.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {o.maintenanceCompletedAt && (
                          <span className="block text-[10px] text-emerald-400">
                            Fim: {new Date(o.maintenanceCompletedAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </td>

                      {/* Cliente */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{o.client.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{o.client.phone}</div>
                      </td>

                      {/* Veículo */}
                      <td className="py-4 px-4">
                        <div className="text-slate-100 font-semibold">{o.vehicle.model}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {o.vehicle.plate || 'Sem placa'} {o.vehicle.year ? `• ${o.vehicle.year}` : ''}
                        </div>
                      </td>

                      {/* Indicadores Operacionais */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <ClipboardCheck className="w-3 h-3" />
                            {chkCount} itens
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {evCount} fotos
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                            <History className="w-3 h-3" />
                            {tlCount} etapas
                          </span>
                        </div>
                        {o.dynoTelemetry?.afterHp && (
                          <div className="text-[11px] font-mono text-red-400 font-bold mt-1">
                            ⚡ {o.dynoTelemetry.afterHp} WHP ({o.dynoTelemetry.afterTorque} kgfm)
                          </div>
                        )}
                      </td>

                      {/* Valor Total (apenas Diretoria) */}
                      {!isOperator && (
                        <td className="py-4 px-4 font-mono font-black text-emerald-400 text-sm">
                          R$ {o.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      )}

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActiveDropdownId(activeDropdownId === o.id ? null : o.id)}
                            className="inline-flex items-center gap-1.5 focus:outline-none"
                          >
                            <OrderStatusBadge status={o.status} />
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          {activeDropdownId === o.id && (
                            <div className="absolute left-0 mt-2 w-48 rounded-xl bg-[#1C1F28] border border-white/10 shadow-2xl py-1 z-30 divide-y divide-white/5">
                              <button
                                onClick={() => handleStatusChange(o.id, 'IN_PROGRESS')}
                                className="w-full text-left px-3 py-1.5 text-xs text-amber-400 hover:bg-white/5"
                              >
                                Em Execução
                              </button>
                              <button
                                onClick={() => handleStatusChange(o.id, 'WAITING_PARTS')}
                                className="w-full text-left px-3 py-1.5 text-xs text-blue-400 hover:bg-white/5"
                              >
                                Aguardando Peças
                              </button>
                              <button
                                onClick={() => handleStatusChange(o.id, 'COMPLETED')}
                                className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-white/5"
                              >
                                Concluído & Aferido
                              </button>
                              <button
                                onClick={() => handleStatusChange(o.id, 'DELIVERED')}
                                className="w-full text-left px-3 py-1.5 text-xs text-purple-400 hover:bg-white/5"
                              >
                                Entregue ao Cliente
                              </button>
                              <button
                                onClick={() => handleStatusChange(o.id, 'DRAFT')}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5"
                              >
                                Rascunho
                              </button>
                              <button
                                onClick={() => handleStatusChange(o.id, 'CANCELLED')}
                                className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-white/5"
                              >
                                Cancelado
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setOperationalOrder(o)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1E2330] hover:bg-[#272D3D] border border-white/10 shadow-sm"
                            title="Abrir Controle Operacional: Checklist, Fotos de Evidência e Histórico"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Operação</span>
                          </button>

                          <button
                            onClick={() => setSelectedOrderForPdf(o)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm"
                            title="Visualizar e Imprimir Dossiê PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingOrder(o);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                            title="Editar Cadastro da OS"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {!isOperator && (
                            <button
                              onClick={() => handleDelete(o.id, o.osNumber)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                              title="Excluir OS"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-black text-red-500 text-sm block">
                      {o.osNumber}
                    </span>
                    <h3 className="font-bold text-white text-base leading-snug">{o.client.name}</h3>
                    <p className="text-xs font-mono text-slate-400">{o.client.phone}</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>

                <div className="bg-[#171A22] rounded-xl p-3 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold">
                    <Car className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{o.vehicle.model}</span>
                  </div>
                  {o.vehicle.plate && (
                    <div className="text-[11px] font-mono text-slate-400">
                      Placa: {o.vehicle.plate}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300 pt-1">
                    <span>Checklist: {o.checklist?.items.length || 0}</span>
                    <span>•</span>
                    <span>Fotos: {o.evidences?.length || 0}</span>
                    <span>•</span>
                    <span>Etapas: {o.timeline?.length || 0}</span>
                  </div>
                  {!isOperator && (
                    <div className="text-sm font-mono text-emerald-400 font-black pt-1 border-t border-white/5">
                      Total: R$ {o.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setOperationalOrder(o)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-[#1E2330] border border-white/10"
                  >
                    <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                    <span>Operação / Fotos</span>
                  </button>

                  <button
                    onClick={() => setSelectedOrderForPdf(o)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-red-600 hover:bg-red-700"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Laudo PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Controle Operacional */}
      {operationalOrder && (
        <OrderOperationalModal
          order={operationalOrder}
          userRole={userRole}
          userName={userName}
          onClose={() => setOperationalOrder(null)}
          onSaveOrder={handleSaveOperationalChanges}
          onOpenPdf={(orderToPrint) => {
            setOperationalOrder(null);
            setSelectedOrderForPdf(orderToPrint);
          }}
        />
      )}

      {/* PDF View Modal */}
      {selectedOrderForPdf && (
        <OrderPdfView
          order={selectedOrderForPdf}
          userRole={userRole}
          onClose={() => setSelectedOrderForPdf(null)}
        />
      )}

      {/* Form Modal (Create or Edit) */}
      {isFormOpen && (
        <OrderFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingOrder(null);
            if (onClearInitialQuote) onClearInitialQuote();
          }}
          onSave={handleSaveOrder}
          initialOrder={editingOrder}
          initialQuote={initialQuoteForNewOS}
          userRole={userRole}
        />
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Clock className="w-3 h-3" />
          Em Execução
        </span>
      );
    case 'WAITING_PARTS':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <Package className="w-3 h-3" />
          Aguardando Peças
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3" />
          Concluído & Aferido
        </span>
      );
    case 'DELIVERED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
          Entregue ao Cliente
        </span>
      );
    case 'DRAFT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/30">
          Rascunho
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
          Cancelado
        </span>
      );
    default:
      return null;
  }
}
