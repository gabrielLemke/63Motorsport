import { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  Clock,
  Car,
  MessageCircle,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  Flame
} from 'lucide-react';
import { DashboardMetrics, AdminQuote } from '../../types/admin';
import { adminApi } from '../../services/adminApi';

interface AdminDashboardProps {
  onNavigateToQuotes: () => void;
}

export function AdminDashboard({ onNavigateToQuotes }: AdminDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getDashboard();
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar telemetria:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    if (!metrics) return;
    const quotes = metrics.recentQuotes;
    const header = 'Nome,Telefone,Veiculo,Servico,Status,ValorEstimado,Data\n';
    const rows = quotes
      .map(
        (q) =>
          `"${q.name}","${q.phone}","${q.vehicle}","${q.serviceLabel}","${q.status}","R$ ${q.estimatedValue}","${new Date(q.createdAt).toLocaleDateString('pt-BR')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `63motorsport_relatorio_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">
          Carregando Telemetria do Servidor...
        </p>
      </div>
    );
  }

  const { overview, weeklyAccesses, serviceChartData, recentQuotes } = metrics;
  const maxAccess = Math.max(...weeklyAccesses.map((d) => d.accesses), 500);

  return (
    <div className="space-y-8">
      {/* Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white font-['Montserrat']">
              Painel de Telemetria
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              TEMPO REAL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Métricas de tráfego, orçamentos e conversões de projetos de alta performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 bg-[#161920] border border-white/10 hover:border-white/20 hover:text-white transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-red-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onNavigateToQuotes}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.25)]"
          >
            <Car className="w-4 h-4" />
            <span>Gerenciar Leads</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Leads */}
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-5 hover:border-red-500/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Orçamentos Recebidos
            </span>
            <div className="p-2.5 rounded-xl bg-red-600/10 text-red-500 group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {overview.totalQuotes}
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              {overview.pendingCount} pendentes
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {overview.scheduledCount} agendados para oficina/dinamômetro
          </p>
        </div>

        {/* Card 2: Pipeline Revenue */}
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-5 hover:border-red-500/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pipeline Estimado
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              R$ {overview.totalRevenueEstimated.toLocaleString('pt-BR')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            R$ {overview.completedRevenue.toLocaleString('pt-BR')} em serviços fechados
          </p>
        </div>

        {/* Card 3: Conversion Rate */}
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-5 hover:border-red-500/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Taxa de Conversão
            </span>
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {overview.conversionRate}%
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +0.8%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Leads gerados vs total de visitantes do site
          </p>
        </div>

        {/* Card 4: Total Accesses */}
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-5 hover:border-red-500/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Acessos do Período
            </span>
            <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {overview.totalAccesses.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-400 font-mono">visitas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Pico de buscas nas sextas e sábados (preparação de pista)
          </p>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Access Bar Chart (2 columns) */}
        <div className="lg:col-span-2 bg-[#12141A] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                Telemetria de Acessos Semanais
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribuição diária de visitantes na vitrine da 63 Motorsport
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              Últimos 7 dias
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-8 pb-4">
            <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {weeklyAccesses.map((item, index) => {
                const heightPercent = Math.max(Math.round((item.accesses / maxAccess) * 100), 12);
                const isPeak = item.accesses >= 400;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip value */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/20 text-white text-[11px] font-mono py-0.5 px-2 rounded-md shadow-lg pointer-events-none mb-1">
                      {item.accesses}
                    </div>

                    {/* Bar container */}
                    <div className="w-full max-w-[42px] bg-[#1C1F28] rounded-t-lg h-full flex items-end p-1">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t transition-all duration-500 ${
                          isPeak
                            ? 'bg-gradient-to-t from-red-600 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                            : 'bg-gradient-to-t from-slate-600 to-slate-400 group-hover:from-red-700 group-hover:to-red-500'
                        }`}
                      />
                    </div>

                    {/* Day label */}
                    <span className={`text-xs font-mono font-bold mt-1 ${isPeak ? 'text-red-400' : 'text-slate-400'}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-r from-red-600 to-red-500" />
                <span>Pico de Tráfego</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-500" />
                <span>Média Regular</span>
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Média diária: ~334 visitas/dia
            </span>
          </div>
        </div>

        {/* Service Popularity Breakdown (1 column) */}
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Serviços Mais Procurados
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Interesse dos clientes por categoria de preparação
            </p>

            {/* List of services with progress bars */}
            <div className="space-y-4">
              {serviceChartData.map((svc, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 truncate max-w-[180px]">
                      {svc.name}
                    </span>
                    <span className="font-mono text-slate-400">
                      {svc.count} <span className="text-[10px] text-slate-500">({svc.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#1C1F28] h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${svc.percentage}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${
                        i === 0
                          ? 'bg-red-500'
                          : i === 1
                          ? 'bg-amber-500'
                          : i === 2
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5">
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-[11px] text-slate-300 leading-tight">
                <strong>Alta Procura:</strong> Remap Stage 2 e Stage 3 lideram com mais de 50% dos pedidos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotes Quick Table */}
      <div className="bg-[#12141A] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              Últimas Solicitações de Orçamento
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Contate os clientes rapidamente pelo WhatsApp para fechar agendamentos
            </p>
          </div>

          <button
            onClick={onNavigateToQuotes}
            className="text-xs font-bold text-red-400 hover:text-white uppercase tracking-wider inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Ver Todos ({overview.totalQuotes})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive Table / Card Container */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Cliente</th>
                <th className="py-3 px-3">Veículo</th>
                <th className="py-3 px-3">Serviço Desejado</th>
                <th className="py-3 px-3">Ticket Est.</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Ação Direta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {recentQuotes.map((q) => {
                const whatsappUrl = adminApi.createWhatsAppMessageUrl(
                  q.phone,
                  q.name,
                  q.vehicle,
                  q.serviceLabel
                );

                return (
                  <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{q.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{q.phone}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-slate-200 font-semibold">{q.vehicle}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/5 text-slate-300 border border-white/10">
                        {q.serviceLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                      R$ {q.estimatedValue.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 transition-all shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chamar</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: AdminQuote['status'] }) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Pendente
        </span>
      );
    case 'CONTACTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <MessageCircle className="w-3 h-3" />
          Contatado
        </span>
      );
    case 'SCHEDULED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
          <Calendar className="w-3 h-3" />
          Agendado
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3" />
          Concluído
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/30">
          Cancelado
        </span>
      );
    default:
      return null;
  }
}
