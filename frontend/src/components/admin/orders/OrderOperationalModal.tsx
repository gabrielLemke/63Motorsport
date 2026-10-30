import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import {
  X,
  ClipboardCheck,
  Camera,
  History,
  Wrench,
  CheckCircle2,
  Plus,
  Trash2,
  Play,
  Flag,
  Clock,
  User,
  Gauge,
  Fuel,
  ShieldCheck,
  Upload,
  Eye,
  Printer,
  Sparkles
} from 'lucide-react';
import {
  ServiceOrder,
  OperationalPhase,
  ChecklistEntryStatus,
  ChecklistExitStatus,
  FuelLevel,
  EvidencePhase,
  TimelineStage,
  createDefaultChecklist
} from '../../../types/serviceOrder';
import { UserRole } from '../../../types/admin';

interface OrderOperationalModalProps {
  order: ServiceOrder;
  userRole: UserRole;
  userName: string;
  initialTab?: 'overview' | 'checklist' | 'evidences' | 'timeline';
  onClose: () => void;
  onSaveOrder: (id: string, payload: Partial<ServiceOrder>) => Promise<ServiceOrder>;
  onOpenPdf?: (order: ServiceOrder) => void;
}

const PHASE_STEPS: Array<{ key: OperationalPhase; label: string; short: string }> = [
  { key: 'CHECKIN', label: '1. Recepção & Vistoria', short: 'Check-in' },
  { key: 'DIAGNOSIS', label: '2. Diagnóstico & Scanner', short: 'Diagnóstico' },
  { key: 'DISASSEMBLY', label: '3. Execução Mecânica', short: 'Mecânica' },
  { key: 'TUNING', label: '4. Acerto ECU & Dinô', short: 'Dinamômetro' },
  { key: 'QA_CHECKOUT', label: '5. Checklist Final & QA', short: 'Vistoria Saída' },
  { key: 'READY', label: '6. Finalizado / Pronto', short: 'Concluído' }
];

const RAMP_OPTIONS = [
  'Rampa 01 - Recepção & Revisão Rápida',
  'Rampa 02 - Preparação Turbo & Motor',
  'Box 03 - Dinamômetro Servitec 4x4',
  'Rampa 04 - Freios, Suspensão & Track Prep',
  'Pátio Interno - Aguardando Peças / Entrega'
];

const QUICK_WORK_PRESETS: Array<{ type: 'SERVICE' | 'PART'; label: string; description: string }> = [
  {
    type: 'SERVICE',
    label: '+ Leitura Scanner OBD (0 Falhas)',
    description: 'Diagnóstico eletrônico completo via Scanner OBD-II (0 códigos de falha ativos)'
  },
  {
    type: 'SERVICE',
    label: '+ Teste de Pressurização (Boost Leak)',
    description: 'Teste de estanqueidade do sistema de pressurização/intercooler sem vazamentos'
  },
  {
    type: 'SERVICE',
    label: '+ Instalação Downpipe & Intake',
    description: 'Montagem física de Downpipe em Inox 304 e sistema de admissão (Intake)'
  },
  {
    type: 'SERVICE',
    label: '+ Troca de Velas & Revisão Ignição',
    description: 'Substituição de jogo de velas Iridium com aferição de gap e inspeção de bobinas'
  },
  {
    type: 'SERVICE',
    label: '+ Acerto ECU/TCU no Dinamômetro',
    description: 'Calibração customizada de mapa no Dinamômetro Servitec 4x4 (AFR, Boost e Ignição aferidos)'
  },
  {
    type: 'PART',
    label: '+ Fluido de Freio Motul RBF 660',
    description: 'Aplicação e sangria completa com Fluido de Freio Racing Motul RBF 660'
  },
  {
    type: 'PART',
    label: '+ Kit Óleo Motul 8100 + Filtro',
    description: 'Troca de óleo 100% sintético Motul 8100 5W40 + Filtro de Óleo Original'
  }
];

const QUICK_PHOTO_CAPTIONS: Array<{
  phase: EvidencePhase;
  category: string;
  title: string;
  notes: string;
}> = [
  {
    phase: 'ENTRY',
    category: 'Vistoria Externa & Lataria',
    title: 'Recepção do Veículo na Rampa (Frente & Placa)',
    notes: 'Registro visual do veículo na chegada à oficina antes do início da intervenção.'
  },
  {
    phase: 'ENTRY',
    category: 'Scanner OBD-II & Eletrônica',
    title: 'Painel de Instrumentos, Hodômetro (Km) & Nível de Combustível',
    notes: 'Conferência de quilometragem de entrada e luzes de advertência no painel.'
  },
  {
    phase: 'ENTRY',
    category: 'Avaria Prévia Encontrada',
    title: 'Detalhe de Marca / Risco Prévio na Recepção',
    notes: 'Evidência registrada no check-in antes do início dos trabalhos.'
  },
  {
    phase: 'PROCESS',
    category: 'Cofre do Motor & Pressurização',
    title: 'Cofre do Motor Durante a Manutenção / Preparação',
    notes: 'Inspeção de componentes, linhas de vácuo/pressurização e conexões.'
  },
  {
    phase: 'PROCESS',
    category: 'Peça Aplicada / Desmontagem',
    title: 'Peça de Performance Instalada e Torqueada no Veículo',
    notes: 'Componente montado seguindo especificação técnica da 63 Motorsport.'
  },
  {
    phase: 'EXIT',
    category: 'Gráfico Dinamômetro Servitec',
    title: 'Resultado de Aferição no Dinamômetro Servitec 4x4',
    notes: 'Curvas de potência (WHP) e torque (kgfm) validadas após calibração.'
  },
  {
    phase: 'EXIT',
    category: 'Veículo Finalizado para Entrega',
    title: 'Veículo Revisado, Limpo e Pronto para Entrega ao Cliente',
    notes: 'Checklist de saída aprovado em 100% dos itens.'
  }
];

/**
 * Redimensiona e comprime uma imagem enviada pelo celular/computador via Canvas
 * para armazenamento leve e rápido no banco/localStorage e impressão no PDF.
 */
function compressImageFile(file: File, maxWidth = 960, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(e.target?.result || ''));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = String(e.target?.result || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function OrderOperationalModal({
  order,
  userRole,
  userName,
  initialTab = 'overview',
  onClose,
  onSaveOrder,
  onOpenPdf
}: OrderOperationalModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'evidences' | 'timeline'>(
    initialTab
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Estados Operacionais Gerais
  const [operationalPhase, setOperationalPhase] = useState<OperationalPhase>(
    order.operationalPhase || 'CHECKIN'
  );
  const [leadOperator, setLeadOperator] = useState(order.leadOperator || userName);
  const [boxRamp, setBoxRamp] = useState(order.boxRamp || RAMP_OPTIONS[0]);
  const [maintenanceStartedAt, setMaintenanceStartedAt] = useState(
    order.maintenanceStartedAt || order.createdAt
  );
  const [maintenanceCompletedAt, setMaintenanceCompletedAt] = useState(
    order.maintenanceCompletedAt || ''
  );
  const [notes, setNotes] = useState(order.notes || '');
  const [currentSetup, setCurrentSetup] = useState(order.vehicle.currentSetup || '');
  const [items, setItems] = useState(order.items || []);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskType, setNewTaskType] = useState<'SERVICE' | 'PART'>('SERVICE');

  // Estado do Checklist
  const [checklist, setChecklist] = useState(() =>
    order.checklist || createDefaultChecklist(order.vehicle.mileage || '', userName)
  );
  const [newCheckItemLabel, setNewCheckItemLabel] = useState('');

  // Estado de Fotos / Evidências
  const [evidences, setEvidences] = useState(order.evidences || []);
  const [evidenceFilter, setEvidenceFilter] = useState<'ALL' | EvidencePhase>('ALL');
  const [newEvPhase, setNewEvPhase] = useState<EvidencePhase>('ENTRY');
  const [newEvCategory, setNewEvCategory] = useState('Vistoria Externa & Lataria');
  const [newEvTitle, setNewEvTitle] = useState('');
  const [newEvNotes, setNewEvNotes] = useState('');
  const [newEvPreview, setNewEvPreview] = useState<string>('');
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Estado da Linha do Tempo (Histórico do início ao fim)
  const [timeline, setTimeline] = useState(order.timeline || []);
  const [newLogStage, setNewLogStage] = useState<TimelineStage>('MECHANICAL');
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDesc, setNewLogDesc] = useState('');
  const [newLogDuration, setNewLogDuration] = useState<number | ''>(45);

  const showFeedback = (msg: string) => {
    setSaveFeedback(msg);
    setTimeout(() => setSaveFeedback(null), 2800);
  };

  // Persistência unificada
  const handlePersistChanges = async (
    customPatch?: Partial<ServiceOrder>,
    message = 'Salvo automaticamente na nuvem!'
  ) => {
    setIsSaving(true);
    try {
      const payload: Partial<ServiceOrder> = {
        operationalPhase,
        leadOperator,
        boxRamp,
        maintenanceStartedAt,
        maintenanceCompletedAt: maintenanceCompletedAt || undefined,
        notes,
        vehicle: {
          ...order.vehicle,
          currentSetup,
          mileage: checklist.mileageExit || checklist.mileageEntry || order.vehicle.mileage
        },
        items,
        checklist,
        evidences,
        timeline,
        ...customPatch
      };
      await onSaveOrder(order.id, payload);
      showFeedback(message);
    } catch (err) {
      console.error('Erro ao salvar controle operacional:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Mudar fase com auto-save imediato
  const handleSelectPhase = async (nextPhase: OperationalPhase) => {
    setOperationalPhase(nextPhase);
    await handlePersistChanges(
      { operationalPhase: nextPhase },
      `Estágio atualizado para: ${PHASE_STEPS.find((s) => s.key === nextPhase)?.short}`
    );
  };

  // Ação rápida: Iniciar Manutenção Agora
  const handleStartMaintenanceNow = async () => {
    const nowIso = new Date().toISOString();
    setMaintenanceStartedAt(nowIso);
    setOperationalPhase('DIAGNOSIS');
    const entryLog = {
      id: `tl-${Date.now()}`,
      stage: 'CHECKIN' as TimelineStage,
      title: 'Início Formal da Manutenção no Box / Rampa',
      description: `Manutenção iniciada em ${boxRamp} sob responsabilidade de ${leadOperator}.`,
      operator: userName,
      timestamp: nowIso,
      durationMinutes: 15
    };
    const updatedTimeline = [entryLog, ...timeline];
    setTimeline(updatedTimeline);
    await handlePersistChanges(
      {
        status: 'IN_PROGRESS',
        operationalPhase: 'DIAGNOSIS',
        maintenanceStartedAt: nowIso,
        timeline: updatedTimeline
      },
      'Início da manutenção registrado no histórico!'
    );
  };

  // Ação rápida: Finalizar Manutenção Agora
  const handleFinishMaintenanceNow = async () => {
    const nowIso = new Date().toISOString();
    setMaintenanceCompletedAt(nowIso);
    setOperationalPhase('READY');
    const updatedChecklist = {
      ...checklist,
      exitCompletedAt: nowIso,
      inspectorExit: userName,
      obdFaultCodesExit: checklist.obdFaultCodesExit || '0 códigos de falha (100% limpo)',
      items: checklist.items.map((item) => ({
        ...item,
        exitStatus: (item.entryStatus === 'AVARIA' || item.entryStatus === 'ATENCAO'
          ? 'CORRIGIDO'
          : 'OK') as ChecklistExitStatus
      }))
    };
    setChecklist(updatedChecklist);

    const exitLog = {
      id: `tl-${Date.now()}`,
      stage: 'COMPLETED' as TimelineStage,
      title: 'Fim da Manutenção, Checklist de Saída Aprovado & Veículo Liberado',
      description: `Todos os serviços e revisões de segurança foram concluídos. Veículo pronto para entrega (${
        updatedChecklist.mileageExit || updatedChecklist.mileageEntry || 'km aferido'
      }).`,
      operator: userName,
      timestamp: nowIso,
      durationMinutes: 30
    };
    const updatedTimeline = [...timeline, exitLog];
    setTimeline(updatedTimeline);
    const updatedItems = items.map((i) => ({ ...i, executed: true, operator: i.operator || userName }));
    setItems(updatedItems);

    await handlePersistChanges(
      {
        status: 'COMPLETED',
        operationalPhase: 'READY',
        maintenanceCompletedAt: nowIso,
        checklist: updatedChecklist,
        timeline: updatedTimeline,
        items: updatedItems
      },
      'Manutenção finalizada e histórico encerrado com sucesso!'
    );
  };

  // Marcar/desmarcar execução de item de serviço ou peça (com Auto-Save!)
  const handleToggleItemExecuted = async (itemId: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            executed: !item.executed,
            operator: !item.executed ? userName : item.operator
          }
        : item
    );
    setItems(updatedItems);
    await handlePersistChanges({ items: updatedItems }, 'Status do serviço atualizado!');
  };

  // Adicionar tarefa em 1 clique a partir dos atalhos rápidos
  const handleQuickAddWorkPreset = async (preset: (typeof QUICK_WORK_PRESETS)[number]) => {
    const newItem = {
      id: `item-${Date.now()}`,
      type: preset.type,
      description: preset.description,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      executed: true,
      operator: userName
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);

    const autoLog = {
      id: `tl-${Date.now() + 1}`,
      stage: 'MECHANICAL' as TimelineStage,
      title: `${preset.type === 'SERVICE' ? 'Serviço Executado' : 'Peça Aplicada'}: ${preset.description}`,
      description: `Registrado em 1 toque por ${userName} (${boxRamp}).`,
      operator: userName,
      timestamp: new Date().toISOString(),
      durationMinutes: 30
    };
    const updatedTimeline = [...timeline, autoLog];
    setTimeline(updatedTimeline);

    await handlePersistChanges(
      { items: updatedItems, timeline: updatedTimeline },
      'Adicionado às Coisas Feitas e salvo na Linha do Tempo!'
    );
  };

  // Adicionar nova tarefa/peça digitada manualmente
  const handleAddOperationalTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;

    const newItem = {
      id: `item-${Date.now()}`,
      type: newTaskType,
      description: newTaskDesc.trim(),
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      executed: true,
      operator: userName
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);

    const autoLog = {
      id: `tl-${Date.now() + 1}`,
      stage: 'MECHANICAL' as TimelineStage,
      title: `${newTaskType === 'SERVICE' ? 'Serviço Executado' : 'Peça Aplicada'}: ${newTaskDesc.trim()}`,
      description: `Registrado na operação por ${userName} no ${boxRamp}.`,
      operator: userName,
      timestamp: new Date().toISOString(),
      durationMinutes: 30
    };
    const updatedTimeline = [...timeline, autoLog];
    setTimeline(updatedTimeline);
    setNewTaskDesc('');

    await handlePersistChanges(
      { items: updatedItems, timeline: updatedTimeline },
      'Item registrado no carro e salvo na Linha do Tempo!'
    );
  };

  // Atualizar item do checklist
  const handleUpdateChecklistItem = (
    itemId: string,
    field: 'entryStatus' | 'exitStatus' | 'notes',
    value: string
  ) => {
    setChecklist((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    }));
  };

  const handleApproveAllEntryChecklist = async () => {
    const updatedChecklist = {
      ...checklist,
      inspectorEntry: userName,
      entryCompletedAt: new Date().toISOString(),
      obdFaultCodesEntry: checklist.obdFaultCodesEntry || '0 códigos de falha na entrada',
      items: checklist.items.map((item) => ({
        ...item,
        entryStatus: 'OK' as ChecklistEntryStatus
      }))
    };
    setChecklist(updatedChecklist);
    await handlePersistChanges(
      { checklist: updatedChecklist },
      'Checklist de Entrada marcado como 100% OK e salvo!'
    );
  };

  const handleApproveAllExitChecklist = async () => {
    const updatedChecklist = {
      ...checklist,
      inspectorExit: userName,
      exitCompletedAt: new Date().toISOString(),
      obdFaultCodesExit: checklist.obdFaultCodesExit || '0 códigos de falha (100% limpo)',
      items: checklist.items.map((item) => ({
        ...item,
        exitStatus: (item.entryStatus === 'AVARIA' || item.entryStatus === 'ATENCAO'
          ? 'CORRIGIDO'
          : 'OK') as ChecklistExitStatus
      }))
    };
    setChecklist(updatedChecklist);
    await handlePersistChanges(
      { checklist: updatedChecklist },
      'Checklist de Saída aprovado em 100% e salvo!'
    );
  };

  const handleAddCustomChecklistItem = async () => {
    if (!newCheckItemLabel.trim()) return;
    const updatedChecklist = {
      ...checklist,
      items: [
        ...checklist.items,
        {
          id: `chk-${Date.now()}`,
          category: 'MOTOR_FLUIDOS' as const,
          label: newCheckItemLabel.trim(),
          entryStatus: 'OK' as ChecklistEntryStatus,
          exitStatus: 'OK' as ChecklistExitStatus,
          notes: ''
        }
      ]
    };
    setChecklist(updatedChecklist);
    setNewCheckItemLabel('');
    await handlePersistChanges({ checklist: updatedChecklist }, 'Novo ponto adicionado ao Checklist!');
  };

  // Upload de fotos pelo celular ou PC
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const compressed = await compressImageFile(files[0]);
      setNewEvPreview(compressed);
      if (!newEvTitle) {
        const phaseDefaultTitle =
          newEvPhase === 'ENTRY'
            ? 'Foto de Vistoria na Entrada'
            : newEvPhase === 'PROCESS'
            ? 'Registro Durante a Manutenção'
            : 'Veículo Finalizado para Entrega';
        setNewEvTitle(`${phaseDefaultTitle} - ${order.vehicle.model}`);
      }
    } catch (err) {
      console.error('Erro ao processar foto:', err);
    }
  };

  const handleAddEvidence = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEvTitle.trim()) return;

    const finalImageUrl =
      newEvPreview ||
      `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="800" height="500" fill="#0D0F14"/>
        <rect x="28" y="28" width="744" height="444" rx="16" fill="#13161F" stroke="#EF4444" stroke-width="2" stroke-opacity="0.5"/>
        <text x="60" y="90" fill="#EF4444" font-family="monospace" font-weight="bold" font-size="16">63 MOTORSPORT // ${newEvCategory.toUpperCase()}</text>
        <text x="60" y="180" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24">${newEvTitle.replace(/[<>&"]/g, '')}</text>
        <text x="60" y="230" fill="#94A3B8" font-family="sans-serif" font-size="15">${(newEvNotes || 'Evidência técnica registrada na operação').slice(0, 75).replace(/[<>&"]/g, '')}</text>
        <text x="60" y="420" fill="#64748B" font-family="monospace" font-size="14">VEÍCULO: ${order.vehicle.model.replace(/[<>&"]/g, '')} (${order.vehicle.plate || 'S/ PLACA'}) • OPERADOR: ${userName.replace(/[<>&"]/g, '')}</text>
      </svg>`)}`;

    const createdEvidence = {
      id: `ev-${Date.now()}`,
      phase: newEvPhase,
      category: newEvCategory,
      title: newEvTitle.trim(),
      notes: newEvNotes.trim(),
      imageUrl: finalImageUrl,
      author: userName,
      createdAt: new Date().toISOString()
    };

    const updatedEvidences = [createdEvidence, ...evidences];
    setEvidences(updatedEvidences);

    const phaseLabel =
      newEvPhase === 'ENTRY'
        ? 'Vistoria de Entrada'
        : newEvPhase === 'PROCESS'
        ? 'Durante a Manutenção'
        : 'Finalização / Entrega';
    const updatedTimeline = [
      ...timeline,
      {
        id: `tl-ev-${Date.now()}`,
        stage: (newEvPhase === 'ENTRY'
          ? 'CHECKIN'
          : newEvPhase === 'EXIT'
          ? 'COMPLETED'
          : 'MECHANICAL') as TimelineStage,
        title: `Foto de Evidência Anexada (${phaseLabel}): ${newEvTitle.trim()}`,
        description: newEvNotes.trim() || `Registro fotográfico na categoria ${newEvCategory}.`,
        operator: userName,
        timestamp: new Date().toISOString()
      }
    ];
    setTimeline(updatedTimeline);

    setNewEvTitle('');
    setNewEvNotes('');
    setNewEvPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';

    await handlePersistChanges(
      { evidences: updatedEvidences, timeline: updatedTimeline },
      'Foto de evidência registrada e salva no histórico!'
    );
  };

  const handleDeleteEvidence = async (id: string) => {
    const updated = evidences.filter((e) => e.id !== id);
    setEvidences(updated);
    await handlePersistChanges({ evidences: updated }, 'Evidência removida.');
  };

  // Adicionar registro na Linha do Tempo
  const handleAddTimelineEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (!newLogTitle.trim()) return;

    const newEntry = {
      id: `tl-${Date.now()}`,
      stage: newLogStage,
      title: newLogTitle.trim(),
      description:
        newLogDesc.trim() || 'Procedimento técnico executado conforme padrão 63 Motorsport.',
      operator: userName,
      timestamp: new Date().toISOString(),
      durationMinutes: newLogDuration === '' ? undefined : Number(newLogDuration)
    };

    const updatedTimeline = [...timeline, newEntry];
    setTimeline(updatedTimeline);
    setNewLogTitle('');
    setNewLogDesc('');

    await handlePersistChanges(
      { timeline: updatedTimeline },
      'Etapa registrada na Linha do Tempo do veículo!'
    );
  };

  const handleDeleteTimelineEntry = async (id: string) => {
    const updated = timeline.filter((t) => t.id !== id);
    setTimeline(updated);
    await handlePersistChanges({ timeline: updated }, 'Registro removido da linha do tempo.');
  };

  const filteredEvidences =
    evidenceFilter === 'ALL' ? evidences : evidences.filter((e) => e.phase === evidenceFilter);

  const checklistOkCount = checklist.items.filter(
    (i) => i.entryStatus === 'OK' || i.exitStatus === 'OK' || i.exitStatus === 'CORRIGIDO'
  ).length;
  const executedItemsCount = items.filter((i) => i.executed).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-5">
      <div className="bg-[#0F1117] border border-white/15 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:px-6 border-b border-white/10 bg-[#141720] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/15 text-red-500 border border-red-500/30 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-red-600 text-white">
                  {order.osNumber}
                </span>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-['Montserrat']">
                  {order.vehicle.model}
                </h2>
                {order.vehicle.plate && (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1F2430] text-amber-400 border border-amber-500/30">
                    {order.vehicle.plate}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Proprietário: <strong className="text-slate-200">{order.client.name}</strong> (
                {order.client.phone}) •{' '}
                <span className="text-emerald-400 font-semibold">{boxRamp}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {saveFeedback && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {saveFeedback}
              </span>
            )}

            {onOpenPdf && (
              <button
                type="button"
                onClick={() => onOpenPdf(order)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 bg-[#1E222D] hover:bg-[#272C3A] border border-white/10 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-red-500" />
                <span>Laudo / PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handlePersistChanges()}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Tudo'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Navigation Tabs */}
        <div className="bg-[#12151E] border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>1. Pátio & Coisas Feitas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/30">
              {executedItemsCount}/{items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'checklist'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>2. Checklist Rápido (Entrada/Saída)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/30">
              {checklistOkCount}/{checklist.items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evidences')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'evidences'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>3. Fotos & Evidências</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/30">
              {evidences.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'timeline'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4" />
            <span>4. Linha do Tempo</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/30">
              {timeline.length}
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* =========================================================
              ABA 1: CONTROLE DE PÁTIO, INÍCIO/FIM & COISAS FEITAS
          ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stepper da Fase Operacional */}
              <div className="bg-[#151822] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-red-400">
                      Estágio Operacional do Veículo na Oficina (Salva em 1 Toque)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Toque na etapa atual do carro para atualizar o painel do pátio imediatamente
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartMaintenanceNow}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Marcar Início Agora</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFinishMaintenanceNow}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black transition-all"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Concluir Tudo & Liberar Carro</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {PHASE_STEPS.map((step, idx) => {
                    const currentIdx = PHASE_STEPS.findIndex((s) => s.key === operationalPhase);
                    const isCurrent = step.key === operationalPhase;
                    const isPassed = idx < currentIdx;

                    return (
                      <button
                        key={step.key}
                        type="button"
                        onClick={() => handleSelectPhase(step.key)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? 'bg-red-600/20 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-[#0D0F14] border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-1">
                          <span>ETAPA 0{idx + 1}</span>
                          {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-xs font-bold leading-snug">{step.short}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Marcos de Início e Fim + Box + Operador */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <div className="bg-[#0D0F14] border border-white/10 rounded-xl p-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Início da Manutenção
                    </label>
                    <input
                      type="datetime-local"
                      value={maintenanceStartedAt ? maintenanceStartedAt.slice(0, 16) : ''}
                      onChange={(e) =>
                        setMaintenanceStartedAt(
                          e.target.value ? new Date(e.target.value).toISOString() : ''
                        )
                      }
                      className="w-full bg-[#161922] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="bg-[#0D0F14] border border-white/10 rounded-xl p-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5 text-emerald-400" />
                      Fim / Conclusão da Manutenção
                    </label>
                    <input
                      type="datetime-local"
                      value={maintenanceCompletedAt ? maintenanceCompletedAt.slice(0, 16) : ''}
                      onChange={(e) =>
                        setMaintenanceCompletedAt(
                          e.target.value ? new Date(e.target.value).toISOString() : ''
                        )
                      }
                      className="w-full bg-[#161922] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="bg-[#0D0F14] border border-white/10 rounded-xl p-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-red-400" />
                      Box / Rampa Alocada
                    </label>
                    <select
                      value={boxRamp}
                      onChange={(e) => setBoxRamp(e.target.value)}
                      className="w-full bg-[#161922] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {RAMP_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-[#0D0F14] border border-white/10 rounded-xl p-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      Operador / Preparador Líder
                    </label>
                    <input
                      type="text"
                      value={leadOperator}
                      onChange={(e) => setLeadOperator(e.target.value)}
                      placeholder="Nome do mecânico / operador"
                      className="w-full bg-[#161922] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Coisas Feitas no Carro (Serviços e Peças Executadas) */}
              <div className="bg-[#151822] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-red-400">
                      Coisas Feitas no Carro (Toque para Marcar Concluído ou Use os Atalhos)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Cada item marcado ou adicionado já fica salvo no histórico do veículo automaticamente
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {executedItemsCount} de {items.length} concluídos
                  </span>
                </div>

                {/* ATALHOS DE 1 TOQUE PARA O MECÂNICO */}
                <div className="p-3 rounded-xl bg-[#0D0F14] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-red-400" />
                    Adição Rápida em 1 Toque (Registra no carro e na Linha do Tempo):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_WORK_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleQuickAddWorkPreset(preset)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#161A24] hover:bg-red-600/20 border border-white/10 hover:border-red-500/40 text-[11px] font-bold text-slate-200 hover:text-white transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista de Itens com Checkbox Operacional */}
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItemExecuted(item.id)}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                        item.executed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-white'
                          : 'bg-[#0D0F14] border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(item.executed)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded accent-emerald-500 mt-0.5 sm:mt-0"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-500">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                item.type === 'SERVICE'
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {item.type === 'SERVICE' ? 'SERVIÇO' : 'PEÇA'}
                            </span>
                            <span
                              className={`text-xs sm:text-sm font-bold ${
                                item.executed ? 'text-emerald-100' : 'text-white'
                              }`}
                            >
                              {item.description}
                            </span>
                          </div>
                          {item.operator && (
                            <span className="text-[11px] text-emerald-400 font-mono block mt-1">
                              ✓ Executado por: {item.operator}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-xs font-mono text-slate-400">Qtd: {item.quantity}</span>
                        {userRole === 'DIRECTOR' && item.totalPrice > 0 && (
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            item.executed
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {item.executed ? '✓ Feito' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form Rápido para Adicionar Item Feito no Carro */}
                <form
                  onSubmit={handleAddOperationalTask}
                  className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2"
                >
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as 'SERVICE' | 'PART')}
                    className="bg-[#0D0F14] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-200"
                  >
                    <option value="SERVICE">+ Outro Serviço</option>
                    <option value="PART">+ Outra Peça</option>
                  </select>

                  <input
                    type="text"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Ou digite outra coisa feita no carro..."
                    className="flex-1 bg-[#0D0F14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar no Carro</span>
                  </button>
                </form>
              </div>

              {/* Setup Atualizado e Observações Técnicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#151822] border border-white/10 rounded-2xl p-4 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-400">
                    Setup Atualizado do Veículo (Peças & Stage)
                  </label>
                  <textarea
                    rows={3}
                    value={currentSetup}
                    onChange={(e) => setCurrentSetup(e.target.value)}
                    placeholder="Ex: Intake R600, Downpipe Inox 304, Velas Grau 9, Mapa Stage 2..."
                    className="w-full bg-[#0D0F14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="bg-[#151822] border border-white/10 rounded-2xl p-4 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-400">
                    Parecer Técnico & Recomendações Pós-Manutenção
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações de entrega, recomendações de combustível, próxima revisão..."
                    className="w-full bg-[#0D0F14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ABA 2: CHECKLIST DE VISTORIA RÁPIDO (1 TOQUE)
          ========================================================= */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              {/* Parâmetros Vitais de Entrada vs Saída */}
              <div className="bg-[#151822] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-red-400">
                      Checklist Rápido de Recepção (Entrada) e Liberação (Saída)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Use os botões de aprovação em 1 clique abaixo e marque apenas se houver algum item com atenção/avaria
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApproveAllEntryChecklist}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Marcar Entrada 100% OK</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApproveAllExitChecklist}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Aprovar Saída 100% OK</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-[#0D0F14] border border-white/10 rounded-xl p-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-red-400" />
                      Km de Entrada
                    </label>
                    <input
                      type="text"
                      value={checklist.mileageEntry}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, mileageEntry: e.target.value }))
                      }
                      placeholder="Ex: 68.420 km"
                      className="w-full bg-[#161922] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="bg-[#0D0F14] border border-white/10 rounded-xl p-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                      Km de Saída (Entrega)
                    </label>
                    <input
                      type="text"
                      value={checklist.mileageExit || ''}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, mileageExit: e.target.value }))
                      }
                      placeholder="Ex: 68.445 km"
                      className="w-full bg-[#161922] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="bg-[#0D0F14] border border-white/10 rounded-xl p-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" />
                      Combustível (Entrada)
                    </label>
                    <select
                      value={checklist.fuelLevelEntry}
                      onChange={(e) =>
                        setChecklist((prev) => ({
                          ...prev,
                          fuelLevelEntry: e.target.value as FuelLevel
                        }))
                      }
                      className="w-full bg-[#161922] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    >
                      <option value="RESERVA">Reserva</option>
                      <option value="1/4">1/4 de Tanque</option>
                      <option value="1/2">1/2 Tanque</option>
                      <option value="3/4">3/4 de Tanque</option>
                      <option value="CHEIO">Tanque Cheio (100%)</option>
                    </select>
                  </div>

                  <div className="bg-[#0D0F14] border border-white/10 rounded-xl p-3">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                      Combustível (Saída)
                    </label>
                    <select
                      value={checklist.fuelLevelExit || '1/2'}
                      onChange={(e) =>
                        setChecklist((prev) => ({
                          ...prev,
                          fuelLevelExit: e.target.value as FuelLevel
                        }))
                      }
                      className="w-full bg-[#161922] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    >
                      <option value="RESERVA">Reserva</option>
                      <option value="1/4">1/4 de Tanque</option>
                      <option value="1/2">1/2 Tanque</option>
                      <option value="3/4">3/4 de Tanque</option>
                      <option value="CHEIO">Tanque Cheio (100%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Scanner OBD-II na Entrada (Erros / DTCs)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={checklist.obdFaultCodesEntry}
                        onChange={(e) =>
                          setChecklist((prev) => ({ ...prev, obdFaultCodesEntry: e.target.value }))
                        }
                        className="flex-1 bg-[#0D0F14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setChecklist((prev) => ({
                            ...prev,
                            obdFaultCodesEntry: '0 códigos de falha ativos'
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase shrink-0"
                      >
                        0 Erros
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Scanner OBD-II na Saída (Após Intervenção)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={checklist.obdFaultCodesExit || ''}
                        onChange={(e) =>
                          setChecklist((prev) => ({ ...prev, obdFaultCodesExit: e.target.value }))
                        }
                        className="flex-1 bg-[#0D0F14] border border-white/10 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setChecklist((prev) => ({
                            ...prev,
                            obdFaultCodesExit: '0 códigos de falha (100% limpo)'
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase shrink-0"
                      >
                        100% Limpo
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Avarias Prévias de Lataria / Pintura / Rodas
                    </label>
                    <input
                      type="text"
                      value={checklist.bodyworkNotes || ''}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, bodyworkNotes: e.target.value }))
                      }
                      className="w-full bg-[#0D0F14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Pertences Deixados no Interior do Veículo
                    </label>
                    <input
                      type="text"
                      value={checklist.personalBelongings || ''}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, personalBelongings: e.target.value }))
                      }
                      className="w-full bg-[#0D0F14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tabela dos Itens de Checklist com Botões de 1 Toque */}
              <div className="bg-[#151822] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-red-400">
                    12 Pontos de Inspeção Técnica (Toque Direto: OK / Atenção / Avaria)
                  </h3>
                  <button
                    type="button"
                    onClick={() => handlePersistChanges(undefined, 'Checklist salvo com sucesso!')}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold uppercase"
                  >
                    Salvar Checklist
                  </button>
                </div>

                <div className="space-y-2.5">
                  {checklist.items.map((chk, idx) => (
                    <div
                      key={chk.id}
                      className="p-3 rounded-xl bg-[#0D0F14] border border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center"
                    >
                      <div className="lg:col-span-4 flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500 w-6 shrink-0">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs font-bold text-slate-100">{chk.label}</span>
                      </div>

                      {/* Botões de 1 Toque - Entrada */}
                      <div className="lg:col-span-3 flex items-center gap-1">
                        <span className="text-[10px] font-mono uppercase text-slate-500 mr-1 shrink-0">
                          Ent:
                        </span>
                        {(
                          [
                            { val: 'OK', label: 'OK', active: 'bg-emerald-600 text-white border-emerald-500' },
                            { val: 'ATENCAO', label: 'Atenção', active: 'bg-amber-500 text-black border-amber-400' },
                            { val: 'AVARIA', label: 'Avaria', active: 'bg-red-600 text-white border-red-500' }
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() =>
                              handleUpdateChecklistItem(chk.id, 'entryStatus', opt.val)
                            }
                            className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                              chk.entryStatus === opt.val
                                ? opt.active
                                : 'bg-[#161922] text-slate-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Botões de 1 Toque - Saída */}
                      <div className="lg:col-span-3 flex items-center gap-1">
                        <span className="text-[10px] font-mono uppercase text-slate-500 mr-1 shrink-0">
                          Saí:
                        </span>
                        {(
                          [
                            { val: 'OK', label: 'OK', active: 'bg-emerald-600 text-white border-emerald-500' },
                            { val: 'CORRIGIDO', label: 'Corrigido', active: 'bg-blue-600 text-white border-blue-500' },
                            { val: 'PENDENTE', label: 'Pend.', active: 'bg-amber-500 text-black border-amber-400' }
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() =>
                              handleUpdateChecklistItem(chk.id, 'exitStatus', opt.val)
                            }
                            className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                              chk.exitStatus === opt.val
                                ? opt.active
                                : 'bg-[#161922] text-slate-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <div className="lg:col-span-2">
                        <input
                          type="text"
                          value={chk.notes || ''}
                          onChange={(e) =>
                            handleUpdateChecklistItem(chk.id, 'notes', e.target.value)
                          }
                          placeholder="Obs..."
                          className="w-full bg-[#161922] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Adicionar novo ponto de inspeção */}
                <div className="pt-2 border-t border-white/10 flex gap-2">
                  <input
                    type="text"
                    value={newCheckItemLabel}
                    onChange={(e) => setNewCheckItemLabel(e.target.value)}
                    placeholder="Adicionar ponto extra ao checklist deste carro (ex: Pressão diferencial de combustível LPFP/HPFP)..."
                    className="flex-1 bg-[#0D0F14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomChecklistItem}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-[#222634] hover:bg-[#2c3142] text-white border border-white/10"
                  >
                    + Item Checklist
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ABA 3: FOTOS & EVIDÊNCIAS (ENTRADA, DURANTE, SAÍDA)
          ========================================================= */}
          {activeTab === 'evidences' && (
            <div className="space-y-6">
              {/* Formulário de Upload / Registro de Evidência */}
              <form
                onSubmit={handleAddEvidence}
                className="bg-[#151822] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-red-400">
                      Adicionar Nova Foto / Evidência Técnica
                    </h3>
                    <p className="text-xs text-slate-400">
                      Toque em uma legenda pronta abaixo e abra a câmera do celular para anexar em segundos
                    </p>
                  </div>
                </div>

                {/* ATALHOS DE LEGENDA EM 1 TOQUE */}
                <div className="p-3 rounded-xl bg-[#0D0F14] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-red-400" />
                    Legendas Rápidas (1 Toque preenche Fase, Categoria e Título):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PHOTO_CAPTIONS.map((cap) => (
                      <button
                        key={cap.title}
                        type="button"
                        onClick={() => {
                          setNewEvPhase(cap.phase);
                          setNewEvCategory(cap.category);
                          setNewEvTitle(cap.title);
                          setNewEvNotes(cap.notes);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#161A24] hover:bg-red-600/20 border border-white/10 hover:border-red-500/40 text-[11px] font-bold text-slate-200 hover:text-white transition-all"
                      >
                        📸 {cap.title.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Fase da Manutenção *
                    </label>
                    <select
                      value={newEvPhase}
                      onChange={(e) => setNewEvPhase(e.target.value as EvidencePhase)}
                      className="w-full bg-[#0D0F14] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white"
                    >
                      <option value="ENTRY">1. Entrada / Vistoria Inicial</option>
                      <option value="PROCESS">2. Durante a Manutenção / Peças</option>
                      <option value="EXIT">3. Finalização / Dinamômetro / Entrega</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Categoria da Evidência
                    </label>
                    <select
                      value={newEvCategory}
                      onChange={(e) => setNewEvCategory(e.target.value)}
                      className="w-full bg-[#0D0F14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Vistoria Externa & Lataria">Vistoria Externa & Lataria</option>
                      <option value="Cofre do Motor & Pressurização">Cofre do Motor & Pressurização</option>
                      <option value="Peça Aplicada / Desmontagem">Peça Aplicada / Desmontagem</option>
                      <option value="Scanner OBD-II & Eletrônica">Scanner OBD-II & Eletrônica</option>
                      <option value="Gráfico Dinamômetro Servitec">Gráfico Dinamômetro Servitec</option>
                      <option value="Avaria Prévia Encontrada">Avaria Prévia Encontrada</option>
                      <option value="Veículo Finalizado para Entrega">Veículo Finalizado para Entrega</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Capturar Foto (iPhone / Android / PC)
                    </label>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 rounded-xl px-2.5 py-2 text-xs font-bold text-red-300 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Câmera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#0D0F14] hover:bg-[#191D28] border border-dashed border-white/20 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Galeria / PC</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Título / Legenda da Evidência *
                    </label>
                    <input
                      type="text"
                      required
                      value={newEvTitle}
                      onChange={(e) => setNewEvTitle(e.target.value)}
                      placeholder="Ex: Instalação das turbinas Pure Stage 2 concluída"
                      className="w-full bg-[#0D0F14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Observação Técnica da Foto
                    </label>
                    <input
                      type="text"
                      value={newEvNotes}
                      onChange={(e) => setNewEvNotes(e.target.value)}
                      placeholder="Detalhes do estado da peça, torque aplicado, km..."
                      className="w-full bg-[#0D0F14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Salvar Foto no Histórico</span>
                  </button>
                </div>

                {newEvPreview && (
                  <div className="p-3 rounded-xl bg-[#0D0F14] border border-emerald-500/30 flex items-center gap-3">
                    <img
                      src={newEvPreview}
                      alt="Preview"
                      className="w-20 h-14 object-cover rounded-lg border border-white/10"
                    />
                    <div className="text-xs">
                      <span className="text-emerald-400 font-bold block">
                        Foto carregada e comprimida com sucesso!
                      </span>
                      <span className="text-slate-400">
                        Clique em "Salvar Foto no Histórico" para gravar na nuvem.
                      </span>
                    </div>
                  </div>
                )}
              </form>

              {/* Filtros de Fase das Evidências */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    { key: 'ALL', label: `Todas (${evidences.length})` },
                    {
                      key: 'ENTRY',
                      label: `1. Entrada (${evidences.filter((e) => e.phase === 'ENTRY').length})`
                    },
                    {
                      key: 'PROCESS',
                      label: `2. Durante Manutenção (${
                        evidences.filter((e) => e.phase === 'PROCESS').length
                      })`
                    },
                    {
                      key: 'EXIT',
                      label: `3. Finalização / Saída (${
                        evidences.filter((e) => e.phase === 'EXIT').length
                      })`
                    }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setEvidenceFilter(tab.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        evidenceFilter === tab.key
                          ? 'bg-red-600 text-white'
                          : 'bg-[#151822] text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Galeria de Evidências */}
              {filteredEvidences.length === 0 ? (
                <div className="bg-[#151822] border border-white/10 rounded-2xl p-10 text-center">
                  <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white uppercase">
                    Nenhuma evidência fotográfica nesta fase
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Utilize o formulário acima para anexar fotos da vistoria de entrada, peças aplicadas ou entrega.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvidences.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-[#151822] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-lg group"
                    >
                      <div className="relative h-44 bg-black overflow-hidden">
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase shadow ${
                              ev.phase === 'ENTRY'
                                ? 'bg-emerald-600 text-white'
                                : ev.phase === 'PROCESS'
                                ? 'bg-amber-500 text-black'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {ev.phase === 'ENTRY'
                              ? '1. ENTRADA'
                              : ev.phase === 'PROCESS'
                              ? '2. EXECUÇÃO'
                              : '3. FINALIZAÇÃO'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/80 text-slate-200 border border-white/10">
                            {ev.category}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewLightboxUrl(ev.imageUrl)}
                            className="p-1.5 rounded-lg bg-black/75 text-white hover:bg-red-600 transition-colors"
                            title="Ampliar Evidência"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvidence(ev.id)}
                            className="p-1.5 rounded-lg bg-black/75 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                            title="Remover Evidência"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="text-sm font-bold text-white leading-snug">{ev.title}</h4>
                          {ev.notes && (
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ev.notes}</p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>Por: {ev.author}</span>
                          <span>
                            {new Date(ev.createdAt).toLocaleDateString('pt-BR')}{' '}
                            {new Date(ev.createdAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              ABA 4: LINHA DO TEMPO / HISTÓRICO DO INÍCIO AO FIM
          ========================================================= */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Formulário para registrar novo evento no histórico */}
              <form
                onSubmit={handleAddTimelineEntry}
                className="bg-[#151822] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-red-400">
                    Registrar Etapa Executada no Histórico da Manutenção
                  </h3>
                  <p className="text-xs text-slate-400">
                    Documente cada intervenção técnica para compor o prontuário do início ao fim da manutenção
                  </p>
                </div>

                {/* Atalhos Rápidos de Preenchimento */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-500 mr-1">
                    Atalhos Rápidos:
                  </span>
                  {[
                    {
                      stage: 'CHECKIN' as TimelineStage,
                      title: 'Check-in e Vistoria Inicial Concluída',
                      desc: 'Conferência completa de fluidos, carroceria e leitura inicial de scanner OBD-II.'
                    },
                    {
                      stage: 'MECHANICAL' as TimelineStage,
                      title: 'Desmontagem e Instalação de Upgrade Mecânico',
                      desc: 'Montagem de componentes de performance com torqueamento aferido conforme manual técnico.'
                    },
                    {
                      stage: 'ECU_DYNO' as TimelineStage,
                      title: 'Calibração de ECU/TCU no Dinamômetro Servitec 4x4',
                      desc: 'Acerto customizado em dinamômetro com monitoramento de AFR, ignição, boost e EGT.'
                    },
                    {
                      stage: 'TESTING' as TimelineStage,
                      title: 'Teste de Rodagem & Validação de Segurança',
                      desc: 'Rodagem técnica para verificação de ausência de vazamentos, ruídos ou códigos de falha.'
                    }
                  ].map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        setNewLogStage(preset.stage);
                        setNewLogTitle(preset.title);
                        setNewLogDesc(preset.desc);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#0D0F14] hover:bg-red-600/20 border border-white/10 hover:border-red-500/40 text-[11px] text-slate-300 hover:text-white transition-colors"
                    >
                      + {preset.title}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Tipo de Etapa
                    </label>
                    <select
                      value={newLogStage}
                      onChange={(e) => setNewLogStage(e.target.value as TimelineStage)}
                      className="w-full bg-[#0D0F14] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white"
                    >
                      <option value="CHECKIN">1. Recepção / Check-in</option>
                      <option value="INSPECTION">2. Diagnóstico / Scanner</option>
                      <option value="MECHANICAL">3. Execução Mecânica / Peças</option>
                      <option value="ECU_DYNO">4. Calibração ECU / Dinamômetro</option>
                      <option value="TESTING">5. Teste de Rodagem / QA</option>
                      <option value="COMPLETED">6. Conclusão / Entrega</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Título da Etapa Realizada *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLogTitle}
                      onChange={(e) => setNewLogTitle(e.target.value)}
                      placeholder="Ex: Instalação de Downpipe Inox 304 e Velas NGK Grau 9"
                      className="w-full bg-[#0D0F14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Tempo de Execução (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newLogDuration}
                      onChange={(e) =>
                        setNewLogDuration(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="45"
                      className="w-full bg-[#0D0F14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newLogDesc}
                    onChange={(e) => setNewLogDesc(e.target.value)}
                    placeholder="Detalhamento técnico (torques aplicados, leituras aferidas, peças trocadas)..."
                    className="flex-1 bg-[#0D0F14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shrink-0 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar ao Histórico</span>
                  </button>
                </div>
              </form>

              {/* Linha do Tempo Visual */}
              <div className="bg-[#151822] border border-white/10 rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white font-['Montserrat']">
                      Diário Cronológico da Manutenção (Início ao Fim)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Início:{' '}
                      {maintenanceStartedAt
                        ? new Date(maintenanceStartedAt).toLocaleString('pt-BR')
                        : 'Não registrado'}{' '}
                      • Fim:{' '}
                      {maintenanceCompletedAt
                        ? new Date(maintenanceCompletedAt).toLocaleString('pt-BR')
                        : 'Em andamento'}
                    </p>
                  </div>
                </div>

                <div className="relative pl-6 border-l-2 border-red-600/40 space-y-6">
                  {timeline.map((log, index) => (
                    <div
                      key={log.id}
                      className="relative bg-[#0D0F14] border border-white/10 rounded-xl p-4"
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full absolute -left-[31px] top-5 border-2 border-[#0F1117] ${
                          log.stage === 'COMPLETED'
                            ? 'bg-emerald-500'
                            : log.stage === 'ECU_DYNO'
                            ? 'bg-red-500'
                            : 'bg-amber-400'
                        }`}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400">
                            PASSO #{String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                            {log.stage}
                          </span>
                          <h4 className="text-sm font-bold text-white">{log.title}</h4>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                          {log.durationMinutes && <span>⏱ {log.durationMinutes} min</span>}
                          <span>
                            {new Date(log.timestamp).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTimelineEntry(log.id)}
                            className="text-slate-500 hover:text-red-400"
                            title="Remover registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{log.description}</p>
                      <div className="mt-2 text-[11px] font-mono text-emerald-400">
                        Responsável Técnico: {log.operator}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lightbox para Ampliar Foto de Evidência */}
        {previewLightboxUrl && (
          <div
            onClick={() => setPreviewLightboxUrl(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          >
            <img
              src={previewLightboxUrl}
              alt="Evidência Ampliada"
              className="max-w-full max-h-[88vh] rounded-2xl border border-white/20 shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
