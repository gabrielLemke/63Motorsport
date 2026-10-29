import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  User,
  History,
  Camera,
  Wrench,
  Plus,
  Phone,
  MapPin,
  CheckCircle2,
  Printer,
  X,
  MessageCircle,
  Clock,
  Flag
} from 'lucide-react';
import { ServiceOrder } from '../../types/serviceOrder';
import { UserRole } from '../../types/admin';
import { serviceOrderApi } from '../../services/serviceOrderApi';
import { OrderOperationalModal } from './orders/OrderOperationalModal';
import { OrderFormModal } from './orders/OrderFormModal';
import { OrderPdfView } from './orders/OrderPdfView';

interface ClientsVehiclesViewProps {
  userRole: UserRole;
  userName: string;
}

interface VehicleDossier {
  key: string;
  plate: string;
  model: string;
  brand?: string;
  year?: string;
  latestMileage?: string;
  fuel?: string;
  currentSetup?: string;
  maxWhp?: number;
  maxTorque?: number;
  client: {
    name: string;
    phone: string;
    document?: string;
    email?: string;
    city?: string;
    address?: string;
  };
  orders: ServiceOrder[];
  totalVisits: number;
  totalEvidences: number;
  totalServicesDone: number;
  totalInvested: number;
  lastVisitDate: string;
}

export function ClientsVehiclesView({ userRole, userName }: ClientsVehiclesViewProps) {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Prontuário selecionado
  const [selectedDossierKey, setSelectedDossierKey] = useState<string | null>(null);
  const [operationalOrder, setOperationalOrder] = useState<ServiceOrder | null>(null);
  const [pdfOrder, setPdfOrder] = useState<ServiceOrder | null>(null);
  const [prefilledOrderForNewVisit, setPrefilledOrderForNewVisit] = useState<ServiceOrder | null>(
    null
  );
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await serviceOrderApi.listOrders();
      setOrders(data);
    } catch (err) {
      console.error('Erro ao carregar prontuários de clientes e veículos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Agrupa todas as Ordens de Serviço por Veículo (Placa ou Modelo+Cliente) para formar o Prontuário Histórico
  const dossiers = useMemo<VehicleDossier[]>(() => {
    const map = new Map<string, VehicleDossier>();

    // Ordena das mais recentes para as mais antigas
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (const o of sorted) {
      const cleanPlate = (o.vehicle.plate || '').trim().toUpperCase();
      const key = cleanPlate || `${o.client.name.toLowerCase()}-${o.vehicle.model.toLowerCase()}`;

      const existing = map.get(key);
      const evidencesCount = o.evidences?.length || 0;
      const itemsCount = o.items?.length || 0;
      const afterHp = o.dynoTelemetry?.afterHp || 0;
      const afterTorque = o.dynoTelemetry?.afterTorque || 0;

      if (!existing) {
        map.set(key, {
          key,
          plate: cleanPlate || 'SEM PLACA',
          model: o.vehicle.model,
          brand: o.vehicle.brand,
          year: o.vehicle.year,
          latestMileage:
            o.checklist?.mileageExit || o.checklist?.mileageEntry || o.vehicle.mileage,
          fuel: o.vehicle.fuel,
          currentSetup: o.vehicle.currentSetup,
          maxWhp: afterHp > 0 ? afterHp : undefined,
          maxTorque: afterTorque > 0 ? afterTorque : undefined,
          client: o.client,
          orders: [o],
          totalVisits: 1,
          totalEvidences: evidencesCount,
          totalServicesDone: itemsCount,
          totalInvested: o.status !== 'CANCELLED' ? o.totalAmount || 0 : 0,
          lastVisitDate: o.createdAt
        });
      } else {
        existing.orders.push(o);
        existing.totalVisits += 1;
        existing.totalEvidences += evidencesCount;
        existing.totalServicesDone += itemsCount;
        if (o.status !== 'CANCELLED') {
          existing.totalInvested += o.totalAmount || 0;
        }
        if (afterHp > (existing.maxWhp || 0)) {
          existing.maxWhp = afterHp;
        }
        if (afterTorque > (existing.maxTorque || 0)) {
          existing.maxTorque = afterTorque;
        }
      }
    }

    const all = Array.from(map.values());
    if (!searchQuery.trim()) return all;

    const term = searchQuery.toLowerCase();
    return all.filter(
      (d) =>
        d.plate.toLowerCase().includes(term) ||
        d.model.toLowerCase().includes(term) ||
        d.client.name.toLowerCase().includes(term) ||
        d.client.phone.includes(term) ||
        (d.client.document && d.client.document.includes(term)) ||
        (d.currentSetup && d.currentSetup.toLowerCase().includes(term))
    );
  }, [orders, searchQuery]);

  const activeDossier = useMemo(
    () => dossiers.find((d) => d.key === selectedDossierKey) || null,
    [dossiers, selectedDossierKey]
  );

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

  const handleCreateNewMaintenance = async (payload: Partial<ServiceOrder>) => {
    const created = await serviceOrderApi.createOrder({
      ...payload,
      leadOperator: userName,
      operationalPhase: 'CHECKIN'
    });
    setOrders((prev) => [created, ...prev]);
    setPrefilledOrderForNewVisit(null);
    setIsNewModalOpen(false);
    setOperationalOrder(created);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white font-['Montserrat']">
              Controle de Clientes & Veículos
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-red-600/15 text-red-400 border border-red-500/30">
              PRONTUÁRIO & HISTÓRICO
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Base unificada de proprietários, veículos preparados, evolução de stage, fotos de evidência e histórico completo de cada passagem pela oficina
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setPrefilledOrderForNewVisit(null);
            setIsNewModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] self-start lg:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Cadastrar Cliente / Novo Carro</span>
        </button>
      </div>

      {/* KPIs de Clientes & Frota */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Veículos Cadastrados
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">
            {dossiers.length}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Com prontuário técnico ativo</p>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total de Passagens (OS)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {orders.length}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Histórico de início e fim</p>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Serviços & Peças no Histórico
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {dossiers.reduce((acc, d) => acc + d.totalServicesDone, 0)}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Intervenções documentadas</p>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Acervo de Evidências
          </span>
          <span className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
            {dossiers.reduce((acc, d) => acc + d.totalEvidences, 0)}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Fotos vinculadas aos carros</p>
        </div>
      </div>

      {/* Barra de Busca por Placa / Cliente / Modelo */}
      <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Consultar prontuário por Placa (ex: BRA-2E19), Modelo do Carro, Nome do Cliente, CPF ou Setup..."
            className="w-full bg-[#0D0E12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-medium"
          />
        </div>
      </div>

      {/* Grid de Cartões de Clientes & Veículos */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-400">Carregando prontuários de veículos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {dossiers.map((dossier) => (
            <div
              key={dossier.key}
              className="bg-[#12141A] border border-white/10 hover:border-red-500/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                {/* Cabeçalho do Carro e Placa */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        {dossier.plate}
                      </span>
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-red-600/15 text-red-400 border border-red-500/30">
                        {dossier.totalVisits} {dossier.totalVisits === 1 ? 'PASSAGEM' : 'PASSAGENS'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1.5 font-['Montserrat']">
                      {dossier.model}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Ano: {dossier.year || '-'} • Último Km: {dossier.latestMileage || '-'} •{' '}
                      {dossier.fuel || 'Gasolina Podium'}
                    </p>
                  </div>

                  {dossier.maxWhp && (
                    <div className="text-right bg-[#181C26] border border-red-500/30 rounded-xl px-3 py-2 shrink-0">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">
                        Telemetria Máx
                      </span>
                      <span className="text-base font-black font-mono text-red-400">
                        {dossier.maxWhp} WHP
                      </span>
                      {dossier.maxTorque && (
                        <span className="block text-[10px] font-mono text-slate-400">
                          {dossier.maxTorque} kgfm
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bloco de Dados do Proprietário */}
                <div className="bg-[#161922] border border-white/5 rounded-xl p-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-red-500" />
                      {dossier.client.name}
                    </span>
                    {dossier.client.document && (
                      <span className="font-mono text-[11px] text-slate-400">
                        CPF/CNPJ: {dossier.client.document}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {dossier.client.phone}
                    </span>
                    {dossier.client.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {dossier.client.city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Setup Atual */}
                {dossier.currentSetup && (
                  <div className="text-xs text-slate-300 bg-[#0E1016] border border-white/5 rounded-xl p-3">
                    <span className="text-[10px] font-bold uppercase text-red-400 block mb-0.5">
                      Setup & Hardware Registrado no Carro:
                    </span>
                    {dossier.currentSetup}
                  </div>
                )}

                {/* Contadores do Prontuário */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-[#161922] p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Coisas Feitas</span>
                    <strong className="text-emerald-400">{dossier.totalServicesDone} itens</strong>
                  </div>
                  <div className="bg-[#161922] p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Fotos Evidência</span>
                    <strong className="text-amber-400">{dossier.totalEvidences} fotos</strong>
                  </div>
                  <div className="bg-[#161922] p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">
                      {userRole === 'DIRECTOR' ? 'Total Investido' : 'Última Passagem'}
                    </span>
                    <strong className="text-white">
                      {userRole === 'DIRECTOR'
                        ? `R$ ${dossier.totalInvested.toLocaleString('pt-BR')}`
                        : new Date(dossier.lastVisitDate).toLocaleDateString('pt-BR')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Ações do Prontuário */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDossierKey(dossier.key)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-md transition-all"
                >
                  <History className="w-4 h-4" />
                  <span>Abrir Histórico Completo do Carro</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const latest = dossier.orders[0];
                    setPrefilledOrderForNewVisit(latest);
                    setIsNewModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1F2A] hover:bg-[#252A38] text-slate-200 border border-white/10 transition-colors"
                  title="Iniciar uma nova manutenção para este mesmo carro e cliente"
                >
                  <Plus className="w-4 h-4 text-red-500" />
                  <span>Nova Manutenção</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          MODAL DE PRONTUÁRIO HISTÓRICO COMPLETO DO VEÍCULO & CLIENTE
      ========================================================= */}
      {activeDossier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6">
          <div className="bg-[#0F1117] border border-white/15 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header do Prontuário */}
            <div className="p-4 sm:px-6 border-b border-white/10 bg-[#141720] flex items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {activeDossier.plate}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white font-['Montserrat']">
                    Prontuário Histórico // {activeDossier.model}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Proprietário: <strong className="text-white">{activeDossier.client.name}</strong> •{' '}
                  {activeDossier.client.phone} • {activeDossier.totalVisits}{' '}
                  {activeDossier.totalVisits === 1 ? 'manutenção registrada' : 'manutenções registradas'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const cleanPhone = activeDossier.client.phone.replace(/\D/g, '');
                    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">WhatsApp Cliente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDossierKey(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corpo do Prontuário: Todas as Passagens do Início ao Fim */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeDossier.orders.map((visit, vIdx) => (
                <div
                  key={visit.id}
                  className="bg-[#151822] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-red-600 text-white">
                          {visit.osNumber}
                        </span>
                        <span className="text-xs font-mono uppercase text-slate-400">
                          Passagem #{activeDossier.orders.length - vIdx}
                        </span>
                        {visit.dynoTelemetry?.afterHp && (
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            ⚡ {visit.dynoTelemetry.afterHp} WHP / {visit.dynoTelemetry.afterTorque} kgfm
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Início:{' '}
                          {new Date(visit.maintenanceStartedAt || visit.createdAt).toLocaleString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flag className="w-3.5 h-3.5 text-emerald-400" />
                          Fim:{' '}
                          {visit.maintenanceCompletedAt
                            ? new Date(visit.maintenanceCompletedAt).toLocaleString('pt-BR')
                            : 'Em Execução no Pátio'}
                        </span>
                        <span>
                          Km: {visit.checklist?.mileageEntry || visit.vehicle.mileage || '-'} →{' '}
                          {visit.checklist?.mileageExit || 'Em aferição'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDossierKey(null);
                          setOperationalOrder(visit);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Editar Operação</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDossierKey(null);
                          setPdfOrder(visit);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase bg-[#1F2430] hover:bg-[#282E3D] text-slate-200 border border-white/10 flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-red-500" />
                        <span>Laudo PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Coisas Feitas nesta Passagem */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Coisas Feitas no Carro nesta Passagem ({visit.items.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {visit.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-[#0D0F14] border border-white/5 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                            <span className="text-slate-200 font-medium">{item.description}</span>
                          </div>
                          {userRole === 'DIRECTOR' && item.totalPrice > 0 && (
                            <span className="font-mono text-emerald-400 font-bold shrink-0">
                              R$ {item.totalPrice.toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Linha do Tempo desta Passagem */}
                  {visit.timeline && visit.timeline.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" />
                        Linha do Tempo da Manutenção (Início ao Fim)
                      </h4>
                      <div className="space-y-2 pl-4 border-l-2 border-red-500/30">
                        {visit.timeline.map((log) => (
                          <div key={log.id} className="text-xs bg-[#0D0F14] p-2.5 rounded-xl border border-white/5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <strong className="text-white">{log.title}</strong>
                              <span className="text-[10px] font-mono text-slate-400">
                                {new Date(log.timestamp).toLocaleString('pt-BR')} • {log.operator}
                              </span>
                            </div>
                            <p className="text-slate-400 mt-0.5">{log.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fotos de Evidência desta Passagem */}
                  {visit.evidences && visit.evidences.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        Fotos & Evidências Registradas ({visit.evidences.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {visit.evidences.map((ev) => (
                          <div
                            key={ev.id}
                            className="bg-[#0D0F14] border border-white/10 rounded-xl overflow-hidden"
                          >
                            <img
                              src={ev.imageUrl}
                              alt={ev.title}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-2.5">
                              <span className="text-[10px] font-mono font-bold text-red-400 uppercase block">
                                {ev.phase === 'ENTRY'
                                  ? '1. Entrada'
                                  : ev.phase === 'PROCESS'
                                  ? '2. Execução'
                                  : '3. Finalização'}
                              </span>
                              <strong className="text-xs text-white block leading-snug">
                                {ev.title}
                              </strong>
                              {ev.notes && (
                                <p className="text-[11px] text-slate-400 mt-0.5">{ev.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Operacional */}
      {operationalOrder && (
        <OrderOperationalModal
          order={operationalOrder}
          userRole={userRole}
          userName={userName}
          onClose={() => setOperationalOrder(null)}
          onSaveOrder={handleSaveOperationalChanges}
          onOpenPdf={(o) => {
            setOperationalOrder(null);
            setPdfOrder(o);
          }}
        />
      )}

      {/* Modal de Nova Manutenção / Cadastro de Cliente & Carro */}
      {isNewModalOpen && (
        <OrderFormModal
          isOpen={isNewModalOpen}
          onClose={() => {
            setIsNewModalOpen(false);
            setPrefilledOrderForNewVisit(null);
          }}
          onSave={handleCreateNewMaintenance}
          userRole={userRole}
          prefillClientAndVehicle={prefilledOrderForNewVisit}
        />
      )}

      {/* PDF / Dossiê */}
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
