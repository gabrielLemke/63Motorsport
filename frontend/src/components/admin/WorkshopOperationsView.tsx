import { useState, useEffect } from 'react';
import {
  Wrench,
  ClipboardCheck,
  Camera,
  History,
  Plus,
  Search,
  Car,
  User,
  Clock,
  Flag,
  Printer,
  CheckCircle2,
  RefreshCw,
  Gauge,
  Fuel,
  MessageCircle
} from 'lucide-react';
import { ServiceOrder, OperationalPhase } from '../../types/serviceOrder';
import { UserRole } from '../../types/admin';
import { serviceOrderApi } from '../../services/serviceOrderApi';
import { OrderOperationalModal } from './orders/OrderOperationalModal';
import { OrderFormModal } from './orders/OrderFormModal';
import { OrderPdfView } from './orders/OrderPdfView';

interface WorkshopOperationsViewProps {
  userRole: UserRole;
  userName: string;
}

const PHASE_STEPS: Array<{ key: OperationalPhase; short: string; label: string; color: string }> = [
  {
    key: 'CHECKIN',
    short: '1. Check-in',
    label: '1. Check-in & Vistoria',
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
  },
  {
    key: 'DIAGNOSIS',
    short: '2. Diagnóstico',
    label: '2. Diagnóstico & Scanner',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  },
  {
    key: 'DISASSEMBLY',
    short: '3. Mecânica',
    label: '3. Execução Mecânica',
    color: 'bg-orange-500/15 text-orange-400 border-orange-500/30'
  },
  {
    key: 'TUNING',
    short: '4. Dinamômetro',
    label: '4. Acerto ECU & Dinamômetro',
    color: 'bg-red-500/15 text-red-400 border-red-500/30'
  },
  {
    key: 'QA_CHECKOUT',
    short: '5. Vistoria Saída',
    label: '5. Checklist Final & Rodagem',
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  },
  {
    key: 'READY',
    short: '6. Pronto',
    label: '6. Manutenção Concluída',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  }
];

export function WorkshopOperationsView({ userRole, userName }: WorkshopOperationsViewProps) {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<'ALL' | 'ACTIVE' | OperationalPhase>('ALL');

  // Modais
  const [operationalModalState, setOperationalModalState] = useState<{
    order: ServiceOrder;
    tab: 'overview' | 'checklist' | 'evidences' | 'timeline';
  } | null>(null);
  const [isNewCheckinOpen, setIsNewCheckinOpen] = useState(false);
  const [pdfOrder, setPdfOrder] = useState<ServiceOrder | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await serviceOrderApi.listOrders({ search: searchQuery });
      setOrders(data);
    } catch (err) {
      console.error('Erro ao carregar operação de pátio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [searchQuery]);

  const handleSaveOperationalChanges = async (
    id: string,
    payload: Partial<ServiceOrder>
  ): Promise<ServiceOrder> => {
    const updated = await serviceOrderApi.updateOrder(id, payload);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    if (operationalModalState?.order.id === id) {
      setOperationalModalState((prev) => (prev ? { ...prev, order: updated } : null));
    }
    return updated;
  };

  // Avança ou troca a fase operacional direto do card do pátio em 1 clique!
  const handleQuickChangePhase = async (order: ServiceOrder, nextPhase: OperationalPhase) => {
    const patch: Partial<ServiceOrder> = {
      operationalPhase: nextPhase,
      status: nextPhase === 'READY' ? 'COMPLETED' : order.status === 'DRAFT' ? 'IN_PROGRESS' : order.status
    };
    if (nextPhase === 'READY' && !order.maintenanceCompletedAt) {
      patch.maintenanceCompletedAt = new Date().toISOString();
    }
    await handleSaveOperationalChanges(order.id, patch);
  };

  // Marca/desmarca tarefa feita direto do card do pátio em 1 clique!
  const handleQuickToggleTask = async (order: ServiceOrder, itemId: string) => {
    const updatedItems = order.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            executed: !item.executed,
            operator: !item.executed ? userName : item.operator
          }
        : item
    );
    await handleSaveOperationalChanges(order.id, { items: updatedItems });
  };

  const handleCreateNewCheckin = async (payload: Partial<ServiceOrder>) => {
    const created = await serviceOrderApi.createOrder({
      ...payload,
      leadOperator: userName,
      operationalPhase: 'CHECKIN'
    });
    setOrders((prev) => [created, ...prev]);
    // Abre imediatamente o painel operacional na aba de Checklist de Entrada!
    setOperationalModalState({ order: created, tab: 'checklist' });
  };

  // Filtragem por Fase Operacional
  const filteredOrders = orders.filter((o) => {
    const phase = o.operationalPhase || 'CHECKIN';
    if (phaseFilter === 'ALL') return true;
    if (phaseFilter === 'ACTIVE') {
      return o.status === 'IN_PROGRESS' || o.status === 'WAITING_PARTS' || phase !== 'READY';
    }
    return phase === phaseFilter;
  });

  // KPIs de Operação
  const activeRampCount = orders.filter(
    (o) => o.status === 'IN_PROGRESS' || o.status === 'WAITING_PARTS'
  ).length;
  const totalEvidencesCount = orders.reduce((acc, o) => acc + (o.evidences?.length || 0), 0);
  const totalTimelineLogs = orders.reduce((acc, o) => acc + (o.timeline?.length || 0), 0);
  const completedMaintenances = orders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'DELIVERED' || o.operationalPhase === 'READY'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header da Central de Operação */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white font-['Montserrat']">
              Controle de Operação & Pátio
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-red-600/15 text-red-400 border border-red-500/30 uppercase">
              {userRole === 'DIRECTOR' ? 'DIRETORIA & OPERADORES' : 'MODO OPERADOR TÉCNICO'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Toque diretamente nas etapas ou nos itens de cada carro para atualizar o progresso em 1 clique
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadOrders}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 bg-[#151820] border border-white/10 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-red-500" />
            <span>Atualizar Pátio</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewCheckinOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Receber Veículo (Check-in Rápido)</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs Operacionais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Veículos nas Rampas / Box
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {activeRampCount}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Em manutenção ativa no pátio</p>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Fotos de Evidência
          </span>
          <span className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
            {totalEvidencesCount}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Entrada, execução e finalização</p>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Registros na Linha do Tempo
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
            {totalTimelineLogs}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Etapas auditadas nos veículos</p>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Manutenções Finalizadas
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {completedMaintenances}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Com checklist de saída concluído</p>
        </div>
      </div>

      {/* Busca e Filtro por Estágio de Oficina */}
      <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar carro no pátio por placa, modelo, nome do cliente ou Nº da OS..."
            className="w-full bg-[#0D0E12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { key: 'ALL', label: `Todos (${orders.length})` },
            { key: 'ACTIVE', label: `No Pátio (${activeRampCount})` },
            { key: 'CHECKIN', label: '1. Check-in / Vistoria' },
            { key: 'DIAGNOSIS', label: '2. Diagnóstico' },
            { key: 'DISASSEMBLY', label: '3. Mecânica & Peças' },
            { key: 'TUNING', label: '4. Dinamômetro & ECU' },
            { key: 'QA_CHECKOUT', label: '5. Checklist Final' },
            { key: 'READY', label: '6. Finalizados' }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setPhaseFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                phaseFilter === tab.key
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-[#181B22] text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Veículos em Controle Operacional */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-400">Carregando veículos em operação...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-12 text-center">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Nenhum Veículo Encontrado neste Estágio
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto mb-4">
            Clique no botão abaixo para dar entrada em um veículo e iniciar seu checklist, registro de fotos e histórico de manutenção.
          </p>
          <button
            type="button"
            onClick={() => setIsNewCheckinOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            <span>Receber Veículo Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredOrders.map((order) => {
            const phase = order.operationalPhase || 'CHECKIN';
            const currentPhaseIdx = PHASE_STEPS.findIndex((p) => p.key === phase);
            const badge = PHASE_STEPS[currentPhaseIdx] || PHASE_STEPS[0];
            const evidencesList = order.evidences || [];
            const timelineList = order.timeline || [];
            const checklistItems = order.checklist?.items || [];
            const checkedCount = checklistItems.filter(
              (i) => i.entryStatus === 'OK' || i.exitStatus === 'OK' || i.exitStatus === 'CORRIGIDO'
            ).length;
            const alertItemsCount = checklistItems.filter(
              (i) => i.entryStatus === 'AVARIA' || i.entryStatus === 'ATENCAO'
            ).length;
            const executedCount = order.items.filter((i) => i.executed).length;
            const latestLog = timelineList[timelineList.length - 1];

            // Cálculo de progresso geral do veículo (0 a 100%)
            const phaseProgress = ((currentPhaseIdx + 1) / PHASE_STEPS.length) * 50;
            const tasksProgress =
              order.items.length > 0 ? (executedCount / order.items.length) * 50 : 50;
            const totalProgress = Math.min(100, Math.round(phaseProgress + tasksProgress));

            return (
              <div
                key={order.id}
                className="bg-[#12141A] border border-white/10 hover:border-white/20 rounded-2xl p-4 sm:p-6 shadow-xl transition-all space-y-4"
              >
                {/* Topo do Card: Identificação do Carro, Cliente, Box e Fase */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-red-600 text-white">
                        {order.osNumber}
                      </span>
                      {order.vehicle.plate && (
                        <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-[#1B1F2A] text-amber-400 border border-amber-500/40">
                          {order.vehicle.plate}
                        </span>
                      )}
                      <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-['Montserrat']">
                        {order.vehicle.model}
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-red-500" />
                        Cliente: <strong className="text-slate-200">{order.client.name}</strong> (
                        {order.client.phone})
                      </span>
                      <span className="flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                        Box: <strong className="text-emerald-400">{order.boxRamp || 'Rampa 01'}</strong>
                      </span>
                      <span>
                        Mecânico: <strong className="text-slate-200">{order.leadOperator || userName}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Marcos de Início e Fim + Progresso */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <div className="px-3 py-1.5 rounded-xl bg-[#171A24] border border-white/5 flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Início:{' '}
                        <strong>
                          {order.maintenanceStartedAt
                            ? new Date(order.maintenanceStartedAt).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </strong>
                      </span>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                        order.maintenanceCompletedAt
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                          : 'bg-[#171A24] border-white/5 text-slate-400'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>
                        Fim:{' '}
                        <strong>
                          {order.maintenanceCompletedAt
                            ? new Date(order.maintenanceCompletedAt).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : `${totalProgress}% Concluído`}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* BARRA DE MUDANÇA DE ESTÁGIO EM 1 TOQUE DIRETO NO PÁTIO */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                    <span>Avanço Rápido de Etapa no Pátio (1 Clique):</span>
                    <span className="text-emerald-400 font-bold">{totalProgress}% Progresso Total</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                    {PHASE_STEPS.map((step, idx) => {
                      const isCurrent = step.key === phase;
                      const isDone = idx < currentPhaseIdx;
                      return (
                        <button
                          key={step.key}
                          type="button"
                          onClick={() => handleQuickChangePhase(order, step.key)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase transition-all border text-center truncate ${
                            isCurrent
                              ? 'bg-red-600 text-white border-red-500 shadow-md'
                              : isDone
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-[#161922] text-slate-400 border-white/5 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {isDone ? `✓ ${step.short}` : step.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid Central: Resumo de Checklist, Coisas Feitas (Clicáveis!) e Fotos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Coluna 1: Resumo do Checklist de Entrada/Saída */}
                  <div
                    onClick={() => setOperationalModalState({ order, tab: 'checklist' })}
                    className="bg-[#161922] hover:bg-[#1B1F2B] border border-white/5 hover:border-white/15 rounded-xl p-3.5 space-y-2 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4" />
                        Checklist do Veículo
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {checkedCount}/{checklistItems.length} OK
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-1">
                      <div className="bg-[#0E1016] p-2 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                        <span>Km: {order.checklist?.mileageEntry || order.vehicle.mileage || '-'}</span>
                      </div>
                      <div className="bg-[#0E1016] p-2 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tanque: {order.checklist?.fuelLevelEntry || '1/2'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 truncate">
                        OBD: <span className="text-slate-200">{order.checklist?.obdFaultCodesEntry || '0 falhas'}</span>
                      </span>
                      {alertItemsCount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                          {alertItemsCount} atenção
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Coluna 2: Coisas Feitas no Carro (Checkboxes diretos no card!) */}
                  <div className="bg-[#161922] border border-white/5 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Coisas Feitas (Toque p/ Marcar)
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {executedCount}/{order.items.length} feitos
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                      {order.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleQuickToggleTask(order, item.id)}
                          className="w-full text-left flex items-center gap-2 text-xs py-1 px-2 rounded-lg bg-[#0E1016] hover:bg-white/5 border border-white/5 transition-colors"
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 ${
                              item.executed
                                ? 'bg-emerald-500 text-black'
                                : 'border border-slate-500 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                          <span
                            className={`truncate ${
                              item.executed ? 'text-emerald-300 line-through' : 'text-slate-200'
                            }`}
                          >
                            {item.description}
                          </span>
                        </button>
                      ))}
                    </div>

                    {latestLog && (
                      <div className="pt-1 border-t border-white/5 text-[11px] text-slate-400 truncate">
                        Último: <strong className="text-slate-200">{latestLog.title}</strong>
                      </div>
                    )}
                  </div>

                  {/* Coluna 3: Fotos de Evidência (Miniaturas) */}
                  <div className="bg-[#161922] border border-white/5 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                        <Camera className="w-4 h-4" />
                        Fotos & Evidências
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {evidencesList.length} fotos
                      </span>
                    </div>

                    {evidencesList.length > 0 ? (
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {evidencesList.slice(0, 4).map((ev) => (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() =>
                              setOperationalModalState({ order, tab: 'evidences' })
                            }
                            className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/15 shrink-0 group"
                            title={ev.title}
                          >
                            <img
                              src={ev.imageUrl}
                              alt={ev.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setOperationalModalState({ order, tab: 'evidences' })}
                          className="w-12 h-12 rounded-lg border border-dashed border-white/20 hover:border-red-500 flex items-center justify-center text-slate-400 hover:text-red-400 shrink-0"
                          title="Adicionar nova foto"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOperationalModalState({ order, tab: 'evidences' })}
                        className="w-full py-2.5 rounded-lg border border-dashed border-red-500/30 bg-red-600/5 hover:bg-red-600/15 text-xs font-bold text-red-300 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>+ Tirar 1ª Foto de Entrada</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>Entrada: {evidencesList.filter((e) => e.phase === 'ENTRY').length}</span>
                      <span>•</span>
                      <span>Execução: {evidencesList.filter((e) => e.phase === 'PROCESS').length}</span>
                      <span>•</span>
                      <span>Saída: {evidencesList.filter((e) => e.phase === 'EXIT').length}</span>
                    </div>
                  </div>
                </div>

                {/* Barra de Ações Operacionais Rápidas */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOperationalModalState({ order, tab: 'overview' })}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-md transition-all"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Painel Completo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOperationalModalState({ order, tab: 'checklist' })}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1F2A] hover:bg-[#252A38] text-slate-200 border border-white/10 transition-colors"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Checklist</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOperationalModalState({ order, tab: 'evidences' })}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1F2A] hover:bg-[#252A38] text-slate-200 border border-white/10 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>+ Foto ({evidencesList.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOperationalModalState({ order, tab: 'timeline' })}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1F2A] hover:bg-[#252A38] text-slate-200 border border-white/10 transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-blue-400" />
                      <span>Linha do Tempo ({timelineList.length})</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const cleanPhone = order.client.phone.replace(/\D/g, '');
                        const msg = encodeURIComponent(
                          `🏁 *63 MOTORSPORT // ATUALIZAÇÃO DO SEU VEÍCULO*\n` +
                            `Olá *${order.client.name}*!\n\n` +
                            `O seu *${order.vehicle.model}* (${order.vehicle.plate || 'OS ' + order.osNumber}) encontra-se na etapa: *${badge.label}* (${totalProgress}% concluído).\n` +
                            `✅ Serviços executados: ${executedCount}/${order.items.length}\n` +
                            `📸 Fotos registradas: ${evidencesList.length}\n\n` +
                            `Qualquer novidade avisamos por aqui!`
                        );
                        window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-colors"
                      title="Enviar status atual para o WhatsApp do cliente em 1 clique"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Avisar Cliente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPdfOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-red-500" />
                      <span>Laudo / PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Operacional (Checklist, Fotos, Coisas Feitas, Histórico) */}
      {operationalModalState && (
        <OrderOperationalModal
          order={operationalModalState.order}
          userRole={userRole}
          userName={userName}
          initialTab={operationalModalState.tab}
          onClose={() => setOperationalModalState(null)}
          onSaveOrder={handleSaveOperationalChanges}
          onOpenPdf={(orderToPrint) => {
            setOperationalModalState(null);
            setPdfOrder(orderToPrint);
          }}
        />
      )}

      {/* Modal para Receber Novo Veículo no Pátio */}
      {isNewCheckinOpen && (
        <OrderFormModal
          isOpen={isNewCheckinOpen}
          onClose={() => setIsNewCheckinOpen(false)}
          onSave={handleCreateNewCheckin}
          userRole={userRole}
        />
      )}

      {/* Visualização em PDF / Dossiê Técnico */}
      {pdfOrder && (
        <OrderPdfView
          order={pdfOrder}
          userRole={userRole}
          onClose={() => setPdfOrder(null)}
        />
      )}
    </div>
  );
}
