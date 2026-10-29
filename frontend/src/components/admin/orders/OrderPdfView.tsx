import { useState } from 'react';
import {
  Printer,
  X,
  MessageCircle,
  Car,
  FileText,
  Wrench,
  ClipboardCheck,
  Camera,
  History,
  EyeOff,
  Eye
} from 'lucide-react';
import { ServiceOrder } from '../../../types/serviceOrder';
import { UserRole } from '../../../types/admin';
import { printIsolatedOrder, getStatusLabel } from './printOrder';

interface OrderPdfViewProps {
  order: ServiceOrder;
  userRole?: UserRole;
  onClose: () => void;
}

export function OrderPdfView({ order, userRole = 'DIRECTOR', onClose }: OrderPdfViewProps) {
  const [hideFinancials, setHideFinancials] = useState<boolean>(userRole === 'OPERATOR');

  const handlePrint = () => {
    printIsolatedOrder(order, { hideFinancials });
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = order.client.phone.replace(/\D/g, '');
    const evidencesCount = order.evidences?.length || 0;
    const timelineCount = order.timeline?.length || 0;

    const text = encodeURIComponent(
      `🏁 *63 MOTORSPORT // DOSSIÊ DE MANUTENÇÃO*\n` +
        `Olá, *${order.client.name}*!\n\n` +
        `O relatório técnico da sua *#${order.osNumber}* referente ao *${order.vehicle.model}* (${
          order.vehicle.plate || 'S/ Placa'
        }) está atualizado.\n\n` +
        `📋 *Status:* ${getStatusLabel(order.status)}\n` +
        `✅ *Checklist de Vistoria:* ${order.checklist?.items.length || 12} itens inspecionados\n` +
        `📸 *Fotos de Evidência:* ${evidencesCount} registros anexados\n` +
        `🛠️ *Etapas Concluídas:* ${timelineCount} marcos no histórico\n` +
        (order.dynoTelemetry?.afterHp
          ? `⚡ *Resultado Dinamômetro:* ${order.dynoTelemetry.afterHp} WHP (${order.dynoTelemetry.afterTorque} kgfm)\n`
          : '') +
        (!hideFinancials
          ? `💰 *Valor Total:* R$ ${order.totalAmount.toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}\n`
          : '') +
        `\nQualquer dúvida estamos à disposição na 63 Motorsport!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  const hpGain =
    order.dynoTelemetry?.afterHp && order.dynoTelemetry?.beforeHp
      ? order.dynoTelemetry.afterHp - order.dynoTelemetry.beforeHp
      : null;

  const torqueGain =
    order.dynoTelemetry?.afterTorque && order.dynoTelemetry?.beforeTorque
      ? (order.dynoTelemetry.afterTorque - order.dynoTelemetry.beforeTorque).toFixed(1)
      : null;

  const checklist = order.checklist;
  const evidences = order.evidences || [];
  const timeline = order.timeline || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Action Bar (hidden on print) */}
      <div className="no-print w-full max-w-4xl bg-[#13151A] border border-white/10 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-2xl sticky top-2 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Montserrat']">
              Dossiê de Manutenção & Ordem de Serviço
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {order.osNumber} • {order.vehicle.model} ({order.client.name})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole === 'DIRECTOR' && (
            <button
              type="button"
              onClick={() => setHideFinancials((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1D202A] text-slate-200 border border-white/10 hover:border-white/20 transition-colors"
              title="Alternar entre OS Comercial (com valores R$) e Laudo Técnico Operacional (sem valores)"
            >
              {hideFinancials ? (
                <>
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Mostrar Valores (R$)</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-amber-400" />
                  <span>Modo Laudo Técnico (Sem R$)</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-md"
            title="Enviar resumo para o cliente no WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Motorsport Sheet (A4 Proportion) */}
      <div
        id="printable-os-sheet"
        className="os-paper w-full max-w-4xl bg-white text-zinc-900 rounded-xl shadow-2xl p-6 sm:p-10 border border-zinc-200 print:shadow-none print:border-none print:p-0 print:m-0 font-['Inter',sans-serif]"
      >
        {/* Header Motorsport */}
        <div className="border-b-2 border-red-600 pb-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-black italic tracking-tighter text-black font-['Montserrat']">
                  63<span className="text-red-600 font-normal">MOTORSPORT</span>
                </span>
                <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 border border-zinc-300 px-1.5 py-0.5 rounded">
                  LAB & DYNO
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Oficina de Preparação Automotiva & Centro de Dinamômetro 4x4
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                CNPJ: 42.163.063/0001-99 • Joinville / SC • Tel / WhatsApp: (47) 99882-1455
              </p>
              <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">
                Operador Líder: <strong>{order.leadOperator || 'Equipe 63 Motorsport'}</strong> •{' '}
                Alocação: <strong>{order.boxRamp || 'Oficina Central'}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right bg-zinc-50 p-3 sm:p-4 rounded-xl border border-zinc-200 w-full sm:w-auto">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                {hideFinancials ? 'LAUDO TÉCNICO DE MANUTENÇÃO' : 'ORDEM DE SERVIÇO & DOSSIÊ'}
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-red-600 tracking-tight">
                {order.osNumber}
              </div>
              <div className="text-xs text-zinc-600 mt-1 flex sm:justify-end items-center gap-2">
                <span>Status:</span>
                <span className="font-bold uppercase text-[11px] text-zinc-800 bg-zinc-200 px-2 py-0.5 rounded">
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="text-[10px] text-zinc-600 font-mono mt-1">
                Início: {new Date(order.maintenanceStartedAt || order.createdAt).toLocaleString('pt-BR')}
              </div>
              {order.maintenanceCompletedAt && (
                <div className="text-[10px] text-emerald-700 font-mono font-bold">
                  Fim: {new Date(order.maintenanceCompletedAt).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client & Vehicle Side-by-Side Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Card 1: Cliente */}
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5 mb-2.5 pb-1 border-b border-zinc-200">
              <Car className="w-3.5 h-3.5" />
              Dados do Proprietário / Cliente
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Nome:</span>
                <strong className="text-zinc-900 text-right">{order.client.name}</strong>
              </div>
              {order.client.document && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">CPF / CNPJ:</span>
                  <span className="font-mono text-zinc-800">{order.client.document}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Telefone:</span>
                <span className="font-mono text-zinc-800">{order.client.phone}</span>
              </div>
              {order.client.city && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cidade / UF:</span>
                  <span className="text-zinc-800">{order.client.city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Veículo */}
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5 mb-2.5 pb-1 border-b border-zinc-200">
              <Wrench className="w-3.5 h-3.5" />
              Identificação do Veículo & Check-in
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Veículo:</span>
                <strong className="text-zinc-900 text-right">{order.vehicle.model}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Placa / Ano:</span>
                <span className="font-mono font-bold text-zinc-800">
                  {order.vehicle.plate || 'Não informada'} • {order.vehicle.year || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Km Entrada → Saída:</span>
                <span className="font-mono text-zinc-800">
                  {checklist?.mileageEntry || order.vehicle.mileage || '-'} →{' '}
                  {checklist?.mileageExit || 'Em aferição'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Combustível / Tanque:</span>
                <span className="text-zinc-800 font-semibold">
                  {order.vehicle.fuel || 'Gasolina Podium'} ({checklist?.fuelLevelEntry || '1/2'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetria de Dinamômetro (Se houver) */}
        {order.dynoTelemetry && (order.dynoTelemetry.afterHp || order.dynoTelemetry.beforeHp) && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-900 text-white shadow-md">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white font-['Montserrat']">
                  Telemetria de Potência & Dinamômetro Servitec 4x4
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Aferição em Roda (WHP)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-zinc-800/80 p-2.5 rounded-lg border border-zinc-700">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Potência Original</span>
                <span className="text-lg font-black font-mono text-zinc-300">
                  {order.dynoTelemetry.beforeHp || '-'} WHP
                </span>
              </div>

              <div className="bg-red-950/40 p-2.5 rounded-lg border border-red-500/40">
                <span className="text-[10px] uppercase font-bold text-red-400 block">Potência Calibrada</span>
                <span className="text-lg font-black font-mono text-red-500">
                  {order.dynoTelemetry.afterHp || '-'} WHP
                </span>
                {hpGain !== null && hpGain > 0 && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 block mt-0.5">
                    +{hpGain} WHP (+{Math.round((hpGain / (order.dynoTelemetry.beforeHp || 1)) * 100)}%)
                  </span>
                )}
              </div>

              <div className="bg-zinc-800/80 p-2.5 rounded-lg border border-zinc-700">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Torque Final</span>
                <span className="text-lg font-black font-mono text-zinc-200">
                  {order.dynoTelemetry.afterTorque || '-'} kgfm
                </span>
                {torqueGain !== null && Number(torqueGain) > 0 && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 block mt-0.5">
                    +{torqueGain} kgfm
                  </span>
                )}
              </div>

              <div className="bg-zinc-800/80 p-2.5 rounded-lg border border-zinc-700">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Pressão de Turbo</span>
                <span className="text-lg font-black font-mono text-zinc-200">
                  {order.dynoTelemetry.boostPressure ? `${order.dynoTelemetry.boostPressure} bar` : 'Aspirado'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Checklist de Entrada e Saída */}
        {checklist && checklist.items && checklist.items.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 mb-2 pb-1 border-b border-zinc-200 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-red-600" />
              Checklist de Vistoria do Veículo (Entrada vs. Saída)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-zinc-50 p-3 rounded-xl border border-zinc-200 mb-3">
              <div>
                <span className="text-zinc-500">Scanner OBD Entrada:</span>{' '}
                <strong className="text-zinc-800">{checklist.obdFaultCodesEntry}</strong>
              </div>
              <div>
                <span className="text-zinc-500">Scanner OBD Saída:</span>{' '}
                <strong className="text-emerald-700">{checklist.obdFaultCodesExit || '0 erros'}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500">Vistoria de Lataria/Rodas:</span>{' '}
                <span className="text-zinc-800">{checklist.bodyworkNotes}</span>
              </div>
            </div>

            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700 font-bold uppercase text-[9px] border-y border-zinc-300">
                  <th className="py-2 px-2.5">#</th>
                  <th className="py-2 px-2.5">Item Auditado</th>
                  <th className="py-2 px-2.5 text-center">Entrada</th>
                  <th className="py-2 px-2.5 text-center">Saída</th>
                  <th className="py-2 px-2.5">Observação Técnica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {checklist.items.map((chk, idx) => (
                  <tr key={chk.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                    <td className="py-1.5 px-2.5 font-mono text-zinc-400">
                      #{String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-1.5 px-2.5 font-semibold text-zinc-900">{chk.label}</td>
                    <td className="py-1.5 px-2.5 text-center font-mono text-[10px] font-bold text-zinc-700">
                      {chk.entryStatus}
                    </td>
                    <td className="py-1.5 px-2.5 text-center font-mono text-[10px] font-bold text-emerald-700">
                      {chk.exitStatus}
                    </td>
                    <td className="py-1.5 px-2.5 text-zinc-600">{chk.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabela de Serviços e Peças (Coisas Feitas no Carro) */}
        <div className="mb-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 mb-2 pb-1 border-b border-zinc-200">
            Coisas Feitas no Carro (Serviços Realizados e Peças Aplicadas)
          </h4>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100 text-zinc-700 font-bold uppercase text-[10px] border-y border-zinc-300">
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Descrição Técnica</th>
                <th className="py-2.5 px-3 text-center">Qtd</th>
                {!hideFinancials ? (
                  <>
                    <th className="py-2.5 px-3 text-right">Unitário (R$)</th>
                    <th className="py-2.5 px-3 text-right">Total (R$)</th>
                  </>
                ) : (
                  <th className="py-2.5 px-3 text-center">Status Execução</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {order.items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                  <td className="py-2.5 px-3 font-mono text-zinc-500 text-[11px]">
                    #{String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                        item.type === 'SERVICE'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-zinc-200 text-zinc-700 border border-zinc-300'
                      }`}
                    >
                      {item.type === 'SERVICE' ? 'SERVIÇO' : 'PEÇA'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-900 font-medium">
                    {item.description}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-zinc-700">
                    {item.quantity}
                  </td>
                  {!hideFinancials ? (
                    <>
                      <td className="py-2.5 px-3 text-right font-mono text-zinc-700">
                        {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                        {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </>
                  ) : (
                    <td className="py-2.5 px-3 text-center font-mono text-[10px] font-bold text-emerald-700">
                      {item.executed !== false ? 'CONCLUÍDO' : 'EM EXECUÇÃO'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Histórico Cronológico (Linha do Tempo do Início ao Fim) */}
        {timeline.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 mb-2 pb-1 border-b border-zinc-200 flex items-center gap-1.5">
              <History className="w-4 h-4 text-red-600" />
              Histórico Cronológico da Manutenção (Início ao Fim)
            </h4>
            <div className="space-y-2">
              {timeline.map((log, idx) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-mono text-[10px] font-bold text-red-600 mr-2">
                      ETAPA #{String(idx + 1).padStart(2, '0')} [{log.stage}]
                    </span>
                    <strong className="text-zinc-900">{log.title}</strong>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{log.description}</p>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 sm:text-right shrink-0">
                    <div>{new Date(log.timestamp).toLocaleString('pt-BR')}</div>
                    <div>Resp: {log.operator}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidências Fotográficas */}
        {evidences.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 mb-2 pb-1 border-b border-zinc-200 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-red-600" />
              Fotos & Evidências Registradas ({evidences.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {evidences.map((ev) => (
                <div
                  key={ev.id}
                  className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 flex flex-col"
                >
                  <img
                    src={ev.imageUrl}
                    alt={ev.title}
                    className="w-full h-32 object-cover border-b border-zinc-200"
                  />
                  <div className="p-2.5 text-[11px]">
                    <span className="font-mono text-[9px] font-bold uppercase text-red-600 block">
                      {ev.phase === 'ENTRY'
                        ? '1. Entrada / Vistoria'
                        : ev.phase === 'PROCESS'
                        ? '2. Durante Manutenção'
                        : '3. Finalização / Saída'}{' '}
                      • {ev.category}
                    </span>
                    <strong className="text-zinc-900 block mt-0.5">{ev.title}</strong>
                    {ev.notes && <p className="text-zinc-600 text-[10px] mt-0.5">{ev.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumo Financeiro (Oculto quando no modo Laudo Técnico / Operador) */}
        {!hideFinancials && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-2">
            <div className="space-y-3 text-xs">
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Condição de Pagamento</span>
                <p className="font-bold text-zinc-900">{order.paymentMethod}</p>
              </div>

              {order.notes && (
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 block">Observações Técnicas</span>
                  <p className="text-zinc-700 text-xs italic">{order.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal Serviços / Mão de Obra:</span>
                <span className="font-mono">
                  R$ {order.subtotalServices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal Peças / Insumos:</span>
                <span className="font-mono">
                  R$ {order.subtotalParts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Desconto Concedido:</span>
                  <span className="font-mono">
                    - R$ {order.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t-2 border-zinc-300 flex justify-between items-baseline">
                <span className="text-sm font-black uppercase tracking-wider text-zinc-900">
                  Valor Total Líquido:
                </span>
                <span className="text-xl font-black font-mono text-red-600">
                  R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Termo de Garantia Oficial */}
        <div className="border border-zinc-300 rounded-xl p-3.5 mb-8 bg-zinc-50/70 text-[10px] text-zinc-600 leading-relaxed">
          <strong className="text-zinc-800 uppercase block mb-1 font-bold">
            Termo de Garantia & Responsabilidade Técnica 63 Motorsport:
          </strong>
          {order.warrantyTerms}
        </div>

        {/* Assinaturas */}
        <div className="pt-6 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-zinc-800 w-3/4 mx-auto mb-2" />
            <strong className="block text-zinc-900">63 MOTORSPORT PERFORMANCE LAB</strong>
            <span className="text-[10px] text-zinc-500">
              {order.leadOperator || 'Responsável Técnico / Preparador'}
            </span>
          </div>

          <div>
            <div className="border-b border-zinc-800 w-3/4 mx-auto mb-2" />
            <strong className="block text-zinc-900">{order.client.name.toUpperCase()}</strong>
            <span className="text-[10px] text-zinc-500">De Acordo / Proprietário do Veículo</span>
          </div>
        </div>

        {/* Rodapé do documento */}
        <div className="mt-8 pt-4 border-t border-zinc-200 text-center text-[9px] font-mono text-zinc-400">
          63 Motorsport High Performance • Documento gerado eletronicamente em{' '}
          {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} • {order.osNumber}
        </div>
      </div>
    </div>
  );
}
