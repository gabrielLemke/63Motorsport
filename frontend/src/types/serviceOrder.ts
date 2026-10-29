export type OrderStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED';

export type OperationalPhase =
  | 'CHECKIN'
  | 'DIAGNOSIS'
  | 'DISASSEMBLY'
  | 'TUNING'
  | 'QA_CHECKOUT'
  | 'READY';

export type ChecklistEntryStatus = 'OK' | 'ATENCAO' | 'AVARIA' | 'NA';
export type ChecklistExitStatus = 'OK' | 'CORRIGIDO' | 'PENDENTE' | 'NA';
export type FuelLevel = 'RESERVA' | '1/4' | '1/2' | '3/4' | 'CHEIO';

export interface ChecklistItem {
  id: string;
  category: 'EXTERIOR' | 'MOTOR_FLUIDOS' | 'FREIOS_SUSPENSAO' | 'ELETRONICA_SCANNER' | 'INTERIOR_TESTE';
  label: string;
  entryStatus: ChecklistEntryStatus;
  exitStatus: ChecklistExitStatus;
  notes?: string;
}

export interface VehicleChecklist {
  fuelLevelEntry: FuelLevel;
  fuelLevelExit?: FuelLevel;
  mileageEntry: string;
  mileageExit?: string;
  obdFaultCodesEntry: string;
  obdFaultCodesExit?: string;
  personalBelongings?: string;
  bodyworkNotes?: string;
  inspectorEntry?: string;
  inspectorExit?: string;
  entryCompletedAt?: string;
  exitCompletedAt?: string;
  items: ChecklistItem[];
}

export type EvidencePhase = 'ENTRY' | 'PROCESS' | 'EXIT';

export interface PhotoEvidence {
  id: string;
  phase: EvidencePhase;
  category: string;
  title: string;
  notes?: string;
  imageUrl: string;
  author: string;
  createdAt: string;
}

export type TimelineStage =
  | 'CHECKIN'
  | 'INSPECTION'
  | 'MECHANICAL'
  | 'ECU_DYNO'
  | 'TESTING'
  | 'COMPLETED';

export interface MaintenanceLogEntry {
  id: string;
  stage: TimelineStage;
  title: string;
  description: string;
  operator: string;
  timestamp: string;
  durationMinutes?: number;
}

export interface OrderItem {
  id: string;
  type: 'SERVICE' | 'PART';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  executed?: boolean;
  operator?: string;
}

export interface ServiceOrder {
  id: string;
  osNumber: string;
  status: OrderStatus;
  operationalPhase?: OperationalPhase;
  leadOperator?: string;
  boxRamp?: string;
  createdAt: string;
  updatedAt: string;
  maintenanceStartedAt?: string;
  maintenanceCompletedAt?: string;
  deliveryDate?: string;
  client: {
    name: string;
    document?: string;
    phone: string;
    email?: string;
    city?: string;
    address?: string;
  };
  vehicle: {
    model: string;
    brand?: string;
    plate?: string;
    year?: string;
    mileage?: string;
    fuel?: string;
    color?: string;
    engine?: string;
    chassis?: string;
    currentSetup?: string;
  };
  dynoTelemetry?: {
    beforeHp?: number;
    afterHp?: number;
    beforeTorque?: number;
    afterTorque?: number;
    boostPressure?: number;
    tuner?: string;
  };
  checklist?: VehicleChecklist;
  evidences?: PhotoEvidence[];
  timeline?: MaintenanceLogEntry[];
  items: OrderItem[];
  subtotalServices: number;
  subtotalParts: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  warrantyTerms: string;
  notes?: string;
  quoteId?: string;
}

export function createDefaultChecklist(mileage = '', operator = 'Equipe 63 Motorsport'): VehicleChecklist {
  return {
    fuelLevelEntry: '1/2',
    fuelLevelExit: '1/2',
    mileageEntry: mileage || '',
    mileageExit: '',
    obdFaultCodesEntry: 'Nenhum código de falha (DTC) ativo na entrada',
    obdFaultCodesExit: '0 avarias na memória ECU / TCU após aferição',
    personalBelongings: 'Manual do proprietário no porta-luvas',
    bodyworkNotes: 'Pintura e rodas íntegras, sem amassados aparentes na recepção',
    inspectorEntry: operator,
    inspectorExit: operator,
    entryCompletedAt: new Date().toISOString(),
    items: [
      {
        id: 'chk-1',
        category: 'EXTERIOR',
        label: 'Lataria, Pintura, Para-choques & Faróis',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Sem avarias estéticas externas'
      },
      {
        id: 'chk-2',
        category: 'EXTERIOR',
        label: 'Rodas, Pneus, Calibragem & Torque de Parafusos (120 Nm)',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Pneus em bom estado, torque conferido com torquímetro'
      },
      {
        id: 'chk-3',
        category: 'MOTOR_FLUIDOS',
        label: 'Nível e Integridade do Óleo de Motor (Ausência de Vazamentos)',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Nível correto no cárter, sem vazamento em tampa de válvulas/retentores'
      },
      {
        id: 'chk-4',
        category: 'MOTOR_FLUIDOS',
        label: 'Sistema de Arrefecimento, Aditivo & Pressão de Mangueiras',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Temperatura estabilizada, ventoinhas armando normalmente'
      },
      {
        id: 'chk-5',
        category: 'MOTOR_FLUIDOS',
        label: 'Linha de Pressurização, Turbina, Intercooler & Escape/Downpipe',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Abraçadeiras de alta pressão revisadas sem fuga de boost'
      },
      {
        id: 'chk-6',
        category: 'MOTOR_FLUIDOS',
        label: 'Sistema de Ignição (Velas, Bobinas & Bicos Injetores)',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Sem misfire em carga máxima (WOT)'
      },
      {
        id: 'chk-7',
        category: 'FREIOS_SUSPENSAO',
        label: 'Freios (Pastilhas, Discos e Ponto de Ebulição do Fluido)',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Espessura de pastilhas segura para frenagem de alta velocidade'
      },
      {
        id: 'chk-8',
        category: 'FREIOS_SUSPENSAO',
        label: 'Suspensão, Buchas, Amortecedores & Coxins de Motor/Câmbio',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Sem folgas axiais ou ruídos estruturais'
      },
      {
        id: 'chk-9',
        category: 'ELETRONICA_SCANNER',
        label: 'Bateria, Tensão de Carga do Alternador & Aterramento',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: '14.1V em funcionamento, estabilizador conectado durante gravação de ECU'
      },
      {
        id: 'chk-10',
        category: 'ELETRONICA_SCANNER',
        label: 'Diagnóstico via Scanner OBD-II (ECU Motor, Câmbio TCU e ABS)',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Leitura completa de módulos antes e depois da intervenção'
      },
      {
        id: 'chk-11',
        category: 'INTERIOR_TESTE',
        label: 'Interior, Painel de Instrumentos (Sem Luzes de Anomalia) & Capa de Proteção',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Capa protetora aplicada no banco e volante durante toda a operação'
      },
      {
        id: 'chk-12',
        category: 'INTERIOR_TESTE',
        label: 'Teste Final de Rodagem / Datalog de AFR, Lambda e Temperatura (IAT/EGT)',
        entryStatus: 'OK',
        exitStatus: 'OK',
        notes: 'Parâmetros de segurança validados em pista/dinamômetro'
      }
    ]
  };
}
