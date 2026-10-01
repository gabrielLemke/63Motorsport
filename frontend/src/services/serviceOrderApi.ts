import { ServiceOrder, OrderStatus } from '../types/serviceOrder';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3334';
const TOKEN_KEY = '63motorsport_admin_token';
const STORE_KEY = '63motorsport_admin_service_orders_v1';

const DEFAULT_ORDERS: ServiceOrder[] = [
  {
    id: 'os-001',
    osNumber: 'OS-2026-0042',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
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
      currentSetup: 'Intake R600 RacingLine, Downpipe 3" Inox 304'
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
        totalPrice: 3200
      },
      {
        id: 'item-2',
        type: 'SERVICE',
        description: 'Calibração de Câmbio DSG DQ250 (Aumento de pressão de embreagem e shift points)',
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500
      },
      {
        id: 'item-3',
        type: 'PART',
        description: 'Jogo de Velas Iridium NGK Racing R7437-9 (Grau Frio 9)',
        quantity: 1,
        unitPrice: 650,
        totalPrice: 650
      },
      {
        id: 'item-4',
        type: 'SERVICE',
        description: 'Sessão de Aferição e Datalog no Dinamômetro Servitec 4x4 (6 passagens com log OBD-II)',
        quantity: 1,
        unitPrice: 600,
        totalPrice: 600
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    deliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
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
      currentSetup: 'Downpipes sem restrição, Charge Pipes de alumínio'
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
        totalPrice: 17500
      },
      {
        id: 'item-202',
        type: 'SERVICE',
        description: 'Mão de Obra Especializada para Montagem de Turbocompressores e Linhas de Óleo/Água',
        quantity: 1,
        unitPrice: 3800,
        totalPrice: 3800
      },
      {
        id: 'item-203',
        type: 'PART',
        description: 'Velas de Ignição de Alto Desempenho BMW M8 Gapped 0.022"',
        quantity: 1,
        unitPrice: 950,
        totalPrice: 950
      },
      {
        id: 'item-204',
        type: 'SERVICE',
        description: 'Desenvolvimento de Calibração Customizada Bootmod3 / MHD com sensor Flex Fuel',
        quantity: 1,
        unitPrice: 4200,
        totalPrice: 4200
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

function getLocalStore(): ServiceOrder[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Erro ao ler ordens do localStorage:', err);
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_ORDERS));
  return DEFAULT_ORDERS;
}

function saveLocalStore(orders: ServiceOrder[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn('Erro ao salvar ordens no localStorage:', err);
  }
}

export const serviceOrderApi = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  async listOrders(filter?: { status?: string; search?: string }): Promise<ServiceOrder[]> {
    const token = this.getToken();

    try {
      if (token && !token.startsWith('demo_')) {
        const params = new URLSearchParams();
        if (filter?.status && filter.status !== 'ALL') params.append('status', filter.status);
        if (filter?.search) params.append('search', filter.search);

        const res = await fetch(`${API_BASE_URL}/api/v1/admin/orders?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const body = await res.json();
          return body.data;
        }
      }
    } catch (err) {
      console.warn('Falha na conexão com API remota, usando store local:', err);
    }

    let list = getLocalStore();

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
  },

  async getOrder(id: string): Promise<ServiceOrder | null> {
    const token = this.getToken();

    try {
      if (token && !token.startsWith('demo_')) {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const body = await res.json();
          return body.data;
        }
      }
    } catch (err) {
      console.warn('Falha na API remota ao buscar OS:', err);
    }

    const list = getLocalStore();
    return list.find((o) => o.id === id || o.osNumber === id) || null;
  },

  async createOrder(data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const token = this.getToken();

    try {
      if (token && !token.startsWith('demo_')) {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const body = await res.json();
          return body.data;
        }
      }
    } catch (err) {
      console.warn('Falha na API remota ao criar OS, salvando no local store:', err);
    }

    const list = getLocalStore();
    const nextNum = list.length + 43;
    const year = new Date().getFullYear();
    const osNumber = `OS-${year}-${String(nextNum).padStart(4, '0')}`;
    const id = `os-${Date.now()}`;

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryDate: data.deliveryDate,
      client: {
        name: data.client?.name || 'Cliente',
        document: data.client?.document || '',
        phone: data.client?.phone || '',
        email: data.client?.email || '',
        city: data.client?.city || '',
        address: data.client?.address || ''
      },
      vehicle: {
        model: data.vehicle?.model || 'Veículo',
        brand: data.vehicle?.brand || '',
        plate: data.vehicle?.plate || '',
        year: data.vehicle?.year || '',
        mileage: data.vehicle?.mileage || '',
        fuel: data.vehicle?.fuel || 'Gasolina Podium',
        color: data.vehicle?.color || '',
        engine: data.vehicle?.engine || '',
        currentSetup: data.vehicle?.currentSetup || ''
      },
      dynoTelemetry: data.dynoTelemetry,
      items,
      subtotalServices,
      subtotalParts,
      discount,
      totalAmount,
      paymentMethod: data.paymentMethod || 'A Combinar',
      warrantyTerms:
        data.warrantyTerms ||
        'Garantia de 90 dias sobre serviços e calibração de injeção eletrônica 63 Motorsport.',
      notes: data.notes || '',
      quoteId: data.quoteId
    };

    list.unshift(newOrder);
    saveLocalStore(list);
    return newOrder;
  },

  async updateOrder(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const token = this.getToken();

    try {
      if (token && !token.startsWith('demo_')) {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const body = await res.json();
          return body.data;
        }
      }
    } catch (err) {
      console.warn('Falha na API remota ao atualizar OS, salvando no local store:', err);
    }

    const list = getLocalStore();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('OS não encontrada');

    const existing = list[index];
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
      client: { ...existing.client, ...data.client },
      vehicle: { ...existing.vehicle, ...data.vehicle },
      items,
      subtotalServices,
      subtotalParts,
      discount,
      totalAmount,
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    saveLocalStore(list);
    return updated;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<ServiceOrder> {
    return this.updateOrder(id, { status });
  },

  async deleteOrder(id: string): Promise<boolean> {
    const token = this.getToken();

    try {
      if (token && !token.startsWith('demo_')) {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) return true;
      }
    } catch (err) {
      console.warn('Falha na API remota ao deletar OS, removendo do local store:', err);
    }

    const list = getLocalStore();
    const filtered = list.filter((o) => o.id !== id);
    saveLocalStore(filtered);
    return true;
  }
};
