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
  checklist?: any;
  evidences?: any[];
  timeline?: any[];
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

let memoryOrders: ServiceOrder[] = [
  {
    id: 'os-001',
    osNumber: 'OS-2026-0042',
    status: 'COMPLETED',
    operationalPhase: 'READY',
    leadOperator: 'Gabriel Lemke // Chefe de Calibração',
    boxRamp: 'Box 03 - Dinamômetro Servitec 4x4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    maintenanceStartedAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
    maintenanceCompletedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    deliveryDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    client: {
      name: 'Rodrigo Alcantara',
      document: '045.892.119-42',
      phone: '(47) 99882-1455',
      email: 'rodrigo.alcantara@gmail.com',
      city: 'Joinville / SC',
      address: 'Rua das Palmeiras, 450 - América'
    },
    vehicle: {
      model: 'VW Golf GTI MK7 2.0 TSI',
      brand: 'Volkswagen',
      plate: 'BRA-2E19',
      year: '2018/2019',
      mileage: '68.420 km',
      fuel: 'Gasolina Podium',
      color: 'Branco Puro',
      engine: '2.0 TSI (EA888 Gen 3 MQB)',
      chassis: '9BWAA45G8JP018492',
      currentSetup: 'Intake R600 RacingLine, Downpipe 3" Inox 304, Velas NGK Grau 9'
    },
    dynoTelemetry: {
      beforeHp: 220,
      afterHp: 332,
      beforeTorque: 35.0,
      afterTorque: 49.8,
      boostPressure: 1.65,
      tuner: 'Gabriel Lemke // 63 Motorsport Lab'
    },
    items: [
      {
        id: 'item-1',
        type: 'SERVICE',
        description: 'Mapeamento Custom de ECU Stage 2 em Dinamômetro 4x4 (Mapa Duplo Podium/Comum)',
        quantity: 1,
        unitPrice: 3200,
        totalPrice: 3200,
        executed: true,
        operator: 'Gabriel Lemke'
      },
      {
        id: 'item-2',
        type: 'SERVICE',
        description: 'Calibração de Câmbio DSG DQ250 (Aumento de pressão de embreagem e shift points)',
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
        executed: true,
        operator: 'Gabriel Lemke'
      },
      {
        id: 'item-3',
        type: 'PART',
        description: 'Jogo de Velas Iridium NGK Racing R7437-9 (Grau Frio 9)',
        quantity: 1,
        unitPrice: 650,
        totalPrice: 650,
        executed: true,
        operator: 'Lucas M.'
      },
      {
        id: 'item-4',
        type: 'SERVICE',
        description: 'Sessão de Aferição e Datalog no Dinamômetro Servitec 4x4 (6 passagens com log OBD-II)',
        quantity: 1,
        unitPrice: 600,
        totalPrice: 600,
        executed: true,
        operator: 'Gabriel Lemke'
      }
    ],
    subtotalServices: 5300,
    subtotalParts: 650,
    discount: 250,
    totalAmount: 5700,
    paymentMethod: 'Pix à vista (Desconto pontual aplicado)',
    warrantyTerms:
      'Garantia de 90 dias ou 5.000 km sobre os serviços de calibração eletrônica. A 63 Motorsport garante a integridade dos parâmetros de ignição, AFR e pressão de turbo aferidos em nosso dinamômetro Servitec 4x4.',
    notes:
      'Veículo entregue higienizado e aferido. Recomendado utilizar exclusivamente Gasolina Podium ou Octapro para manter o rendimento de 332 WHP e 49.8 kgfm.',
    quoteId: 'lead-001'
  },
  {
    id: 'os-002',
    osNumber: 'OS-2026-0043',
    status: 'IN_PROGRESS',
    operationalPhase: 'TUNING',
    leadOperator: 'Lucas M. // Mecânico Chefe',
    boxRamp: 'Rampa 02 - Preparação Turbo & Motor',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    maintenanceStartedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    deliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    client: {
      name: 'Eduardo Silveira',
      document: '812.334.909-15',
      phone: '(47) 99123-8877',
      email: 'silveira.m2@outlook.com',
      city: 'Florianópolis / SC',
      address: 'Av. Beira Mar Norte, 1200'
    },
    vehicle: {
      model: 'BMW M2 Competition (F87)',
      brand: 'BMW',
      plate: 'MSM-0063',
      year: '2020/2021',
      mileage: '34.100 km',
      fuel: 'Etanol E85 / Gasolina Podium',
      color: 'Hockenheim Silver',
      engine: '3.0 Twin-Turbo (S55)',
      chassis: 'WBS2U7C09L7E90063',
      currentSetup: 'Downpipes Inox, Charge Pipes Alumínio, Turbinas Híbridas Pure Stage 2'
    },
    dynoTelemetry: {
      beforeHp: 410,
      afterHp: 585,
      beforeTorque: 56.1,
      afterTorque: 76.8,
      boostPressure: 1.95,
      tuner: 'Gabriel Lemke // 63 Motorsport Lab'
    },
    items: [
      {
        id: 'item-201',
        type: 'PART',
        description: 'Kit de Turbinas Híbridas Pure Stage 2 High-Flow (Twin Turbo S55)',
        quantity: 1,
        unitPrice: 17500,
        totalPrice: 17500,
        executed: true,
        operator: 'Lucas M.'
      },
      {
        id: 'item-202',
        type: 'SERVICE',
        description: 'Mão de Obra Especializada para Montagem de Turbocompressores e Linhas de Óleo/Água',
        quantity: 1,
        unitPrice: 3800,
        totalPrice: 3800,
        executed: true,
        operator: 'Lucas M.'
      },
      {
        id: 'item-203',
        type: 'PART',
        description: 'Velas de Ignição de Alto Desempenho BMW M8 Gapped 0.022"',
        quantity: 1,
        unitPrice: 950,
        totalPrice: 950,
        executed: true,
        operator: 'Lucas M.'
      },
      {
        id: 'item-204',
        type: 'SERVICE',
        description: 'Desenvolvimento de Calibração Customizada Bootmod3 / MHD com sensor Flex Fuel',
        quantity: 1,
        unitPrice: 4200,
        totalPrice: 4200,
        executed: false,
        operator: 'Gabriel Lemke'
      }
    ],
    subtotalServices: 8000,
    subtotalParts: 18450,
    discount: 1450,
    totalAmount: 25000,
    paymentMethod: '50% Entrada (Pix) + 50% na Entrega das Chaves (Cartão 6x)',
    warrantyTerms:
      'Garantia de 6 meses sobre a instalação e calibração. A garantia não cobre quebra de transmissão caso o veículo seja submetido a arrancadas em pista sem controle de tração adequado.',
    notes:
      'Fase atual: instalação mecânica concluída na rampa 2. Próximo passo: primeiros testes e calibração no dinamômetro 4x4.',
    quoteId: 'lead-002'
  }
];

let nextOrderSeq = 45;

export class ServiceOrderService {
  static async listOrders(filter?: { status?: string; search?: string }): Promise<ServiceOrder[]> {
    let list = [...memoryOrders];

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((o) => o.status === filter.status);
    }

    if (filter?.search) {
      const term = filter.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.osNumber.toLowerCase().includes(term) ||
          o.client.name.toLowerCase().includes(term) ||
          o.vehicle.model.toLowerCase().includes(term) ||
          (o.vehicle.plate && o.vehicle.plate.toLowerCase().includes(term)) ||
          o.client.phone.includes(term)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getOrderById(id: string): Promise<ServiceOrder | null> {
    const order = memoryOrders.find((o) => o.id === id || o.osNumber === id);
    return order || null;
  }

  static async createOrder(data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const year = new Date().getFullYear();
    const osNumber = `OS-${year}-${String(nextOrderSeq++).padStart(4, '0')}`;
    const id = `os-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const items = data.items || [];
    const subtotalServices = items
      .filter((i) => i.type === 'SERVICE')
      .reduce((acc, i) => acc + (i.totalPrice || i.quantity * i.unitPrice), 0);
    const subtotalParts = items
      .filter((i) => i.type === 'PART')
      .reduce((acc, i) => acc + (i.totalPrice || i.quantity * i.unitPrice), 0);
    const discount = data.discount || 0;
    const totalAmount = Math.max(0, subtotalServices + subtotalParts - discount);

    const newOrder: ServiceOrder = {
      id,
      osNumber,
      status: data.status || 'IN_PROGRESS',
      operationalPhase: data.operationalPhase || 'CHECKIN',
      leadOperator: data.leadOperator || 'Lucas M. // Operador Chefe',
      boxRamp: data.boxRamp || 'Rampa 01 - Recepção & Diagnóstico',
      createdAt: nowIso,
      updatedAt: nowIso,
      maintenanceStartedAt: data.maintenanceStartedAt || nowIso,
      maintenanceCompletedAt: data.maintenanceCompletedAt,
      deliveryDate: data.deliveryDate,
      client: {
        name: data.client?.name || 'Cliente Sem Nome',
        document: data.client?.document || '',
        phone: data.client?.phone || '',
        email: data.client?.email || '',
        city: data.client?.city || '',
        address: data.client?.address || ''
      },
      vehicle: {
        model: data.vehicle?.model || 'Veículo Não Informado',
        brand: data.vehicle?.brand || '',
        plate: data.vehicle?.plate || '',
        year: data.vehicle?.year || '',
        mileage: data.vehicle?.mileage || '',
        fuel: data.vehicle?.fuel || 'Gasolina Podium',
        color: data.vehicle?.color || '',
        engine: data.vehicle?.engine || '',
        chassis: data.vehicle?.chassis || '',
        currentSetup: data.vehicle?.currentSetup || ''
      },
      dynoTelemetry: data.dynoTelemetry,
      checklist: data.checklist,
      evidences: data.evidences || [],
      timeline: data.timeline || [
        {
          id: `log-${Date.now()}`,
          stage: 'CHECKIN',
          title: 'Recepção do Veículo & Abertura da Manutenção',
          description: `Entrada do veículo ${data.vehicle?.model || ''} (${data.vehicle?.plate || 'S/ Placa'}) no pátio da 63 Motorsport.`,
          operator: data.leadOperator || 'Lucas M.',
          timestamp: nowIso
        }
      ],
      items,
      subtotalServices,
      subtotalParts,
      discount,
      totalAmount,
      paymentMethod: data.paymentMethod || 'A Combinar',
      warrantyTerms:
        data.warrantyTerms ||
        'Garantia padrão de 90 dias sobre serviços mecânicos e calibração de injeção eletrônica 63 Motorsport.',
      notes: data.notes || '',
      quoteId: data.quoteId
    };

    memoryOrders.unshift(newOrder);
    return newOrder;
  }

  static async updateOrder(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder | null> {
    const index = memoryOrders.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const existing = memoryOrders[index];

    const items = data.items || existing.items;
    const subtotalServices = items
      .filter((i) => i.type === 'SERVICE')
      .reduce((acc, i) => acc + (i.totalPrice || i.quantity * i.unitPrice), 0);
    const subtotalParts = items
      .filter((i) => i.type === 'PART')
      .reduce((acc, i) => acc + (i.totalPrice || i.quantity * i.unitPrice), 0);
    const discount = data.discount !== undefined ? data.discount : existing.discount;
    const totalAmount = Math.max(0, subtotalServices + subtotalParts - discount);

    const updated: ServiceOrder = {
      ...existing,
      ...data,
      client: {
        ...existing.client,
        ...data.client
      },
      vehicle: {
        ...existing.vehicle,
        ...data.vehicle
      },
      checklist: data.checklist !== undefined ? data.checklist : existing.checklist,
      evidences: data.evidences !== undefined ? data.evidences : existing.evidences,
      timeline: data.timeline !== undefined ? data.timeline : existing.timeline,
      items,
      subtotalServices,
      subtotalParts,
      discount,
      totalAmount,
      updatedAt: new Date().toISOString()
    };

    memoryOrders[index] = updated;
    return updated;
  }

  static async deleteOrder(id: string): Promise<boolean> {
    const initialLen = memoryOrders.length;
    memoryOrders = memoryOrders.filter((o) => o.id !== id);
    return memoryOrders.length < initialLen;
  }
}
