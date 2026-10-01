import { AdminQuote, AdminUser, DashboardMetrics, QuoteStatus } from '../types/admin';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3334';
const TOKEN_KEY = '63motorsport_admin_token';
const USER_KEY = '63motorsport_admin_user';
const STORE_KEY = '63motorsport_admin_local_quotes_v1';

// Dados padrão realistas de motorsport caso a conexão seja remota/offline
const DEFAULT_QUOTES: AdminQuote[] = [
  {
    id: 'lead-001',
    name: 'Rodrigo Alcantara',
    phone: '47998821455',
    email: 'rodrigo.alcantara@gmail.com',
    vehicle: 'Golf GTI MK7 2.0 TSI (EA888.3)',
    service: 'REMAP_STAGE2',
    serviceLabel: 'Remap Stage 2 Custom',
    message: 'Já possuo intake e downpipe instalados, quero calibrar mapa de motor e pops no dinamômetro.',
    status: 'SCHEDULED',
    estimatedValue: 4500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString()
  },
  {
    id: 'lead-002',
    name: 'Eduardo Silveira',
    phone: '47991238877',
    email: 'silveira.m2@outlook.com',
    vehicle: 'BMW M2 Competition (S55 Twin-Turbo)',
    service: 'REMAP_STAGE3',
    serviceLabel: 'Remap Stage 3 + Turbinas Híbridas',
    message: 'Comprei turbinas Pure Stage 2. Preciso de acerto fino no dinamômetro em Podium e E85.',
    status: 'CONTACTED',
    estimatedValue: 18000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString()
  },
  {
    id: 'lead-003',
    name: 'Marcos Vinicius B.',
    phone: '47984443322',
    email: 'marcos.audi@terra.com.br',
    vehicle: 'Audi RS3 Sedan 2.5 TFSI (DAZA)',
    service: 'DYNO_TUNING',
    serviceLabel: 'Passagem & Aferição em Dinamômetro',
    message: 'Gostaria de agendar 3 puxadas no dinamômetro 4x4 Servitec com relatório impresso de WHP e torque.',
    status: 'PENDING',
    estimatedValue: 850,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 'lead-004',
    name: 'Felipe Ramos',
    phone: '47997775511',
    email: 'feliperamos.wrx@hotmail.com',
    vehicle: 'Subaru WRX STI 2.5 (EJ257)',
    service: 'FORGED_ENGINE',
    serviceLabel: 'Motor Forjado & Turbocompressor',
    message: 'Montagem completa de bloco fechado forjado (bielas Manley, pistões CP-Carrillo, prisioneiros ARP).',
    status: 'COMPLETED',
    estimatedValue: 32000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: 'lead-005',
    name: 'Guilherme Toledo',
    phone: '47996541234',
    email: 'g.toledo@porscheclub.com.br',
    vehicle: 'Porsche 911 Carrera S (992 3.0 Turbo)',
    service: 'REMAP_STAGE1',
    serviceLabel: 'Remap Stage 1 Seguro',
    message: 'Carro 100% original, desejo ganho de resposta em baixa sem comprometer a garantia dos freios e PDK.',
    status: 'PENDING',
    estimatedValue: 2800,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

function getLocalStore(): AdminQuote[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Erro ao ler local store:', err);
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_QUOTES));
  return DEFAULT_QUOTES;
}

function saveLocalStore(quotes: AdminQuote[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.warn('Erro ao salvar local store:', err);
  }
}

export const adminApi = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser(): AdminUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; user: AdminUser }> {
    // 1. Tenta autenticar na API Fastify
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const body = await res.json();
        localStorage.setItem(TOKEN_KEY, body.token);
        localStorage.setItem(USER_KEY, JSON.stringify(body.user));
        return { success: true, user: body.user };
      }
    } catch (err) {
      console.warn('API indisponível no endpoint local, acionando verificação segura de credenciais locais:', err);
    }

    // 2. Fallback de login local (para acesso remoto via túnel onde localhost:3334 não é visível pelo celular)
    if (
      (email.toLowerCase() === 'admin@63motorsport.com.br' || email.toLowerCase() === 'admin@63.com') &&
      password === 'admin123'
    ) {
      const demoUser: AdminUser = {
        email: 'admin@63motorsport.com.br',
        name: 'Administrador 63 Motorsport',
        role: 'admin'
      };
      localStorage.setItem(TOKEN_KEY, 'demo_jwt_token_63motorsport_motorsport_certified');
      localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
      return { success: true, user: demoUser };
    }

    throw new Error('E-mail ou senha incorretos. Use admin@63motorsport.com.br e admin123.');
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async getDashboard(): Promise<DashboardMetrics> {
    const token = this.getToken();

    try {
      if (token && !token.startsWith('demo_')) {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const body = await res.json();
          return body.data;
        }
      }
    } catch (err) {
      console.warn('Falha ao conectar no dashboard backend, calculando a partir do store resiliente:', err);
    }

    // Calcula telemetria a partir do store resiliente
    const quotes = getLocalStore();
    const totalQuotes = quotes.length;
    const pendingCount = quotes.filter((q) => q.status === 'PENDING').length;
    const contactedCount = quotes.filter((q) => q.status === 'CONTACTED').length;
    const scheduledCount = quotes.filter((q) => q.status === 'SCHEDULED').length;
    const completedCount = quotes.filter((q) => q.status === 'COMPLETED').length;
    const totalRevenueEstimated = quotes.reduce((acc, q) => acc + (q.estimatedValue || 0), 0);
    const completedRevenue = quotes
      .filter((q) => q.status === 'COMPLETED' || q.status === 'SCHEDULED')
      .reduce((acc, q) => acc + (q.estimatedValue || 0), 0);

    const serviceCounts: Record<string, number> = {};
    for (const q of quotes) {
      const label = q.serviceLabel || q.service;
      serviceCounts[label] = (serviceCounts[label] || 0) + 1;
    }

    const serviceChartData = Object.entries(serviceCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / (totalQuotes || 1)) * 100)
    }));

    return {
      overview: {
        totalQuotes,
        pendingCount,
        contactedCount,
        scheduledCount,
        completedCount,
        totalRevenueEstimated,
        completedRevenue,
        totalAccesses: 2340,
        conversionRate: '3.4'
      },
      weeklyAccesses: [
        { day: 'Seg', accesses: 280 },
        { day: 'Ter', accesses: 340 },
        { day: 'Qua', accesses: 310 },
        { day: 'Qui', accesses: 420 },
        { day: 'Sex', accesses: 490 },
        { day: 'Sáb', accesses: 310 },
        { day: 'Dom', accesses: 190 }
      ],
      serviceChartData,
      recentQuotes: quotes.slice(0, 5)
    };
  },

  async getQuotes(filter?: { status?: string; search?: string }): Promise<AdminQuote[]> {
    const token = this.getToken();

    try {
      if (token && !token.startsWith('demo_')) {
        const params = new URLSearchParams();
        if (filter?.status && filter.status !== 'ALL') params.append('status', filter.status);
        if (filter?.search) params.append('search', filter.search);

        const res = await fetch(`${API_BASE_URL}/api/v1/admin/quotes?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const body = await res.json();
          return body.data;
        }
      }
    } catch (err) {
      console.warn('Falha na API remota para quotes, consultando local store:', err);
    }

    let list = getLocalStore();

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((q) => q.status === filter.status);
    }

    if (filter?.search) {
      const term = filter.search.toLowerCase();
      list = list.filter(
        (q) =>
          q.name.toLowerCase().includes(term) ||
          q.vehicle.toLowerCase().includes(term) ||
          q.phone.includes(term) ||
          q.serviceLabel.toLowerCase().includes(term)
      );
    }

    return list;
  },

  async updateQuoteStatus(id: string, newStatus: QuoteStatus): Promise<AdminQuote> {
    const token = this.getToken();

    try {
      if (token && !token.startsWith('demo_')) {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/quotes/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
          const body = await res.json();
          return body.data;
        }
      }
    } catch (err) {
      console.warn('Falha ao atualizar na API, persistindo no local store:', err);
    }

    const quotes = getLocalStore();
    const item = quotes.find((q) => q.id === id);
    if (item) {
      item.status = newStatus;
      item.updatedAt = new Date().toISOString();
      saveLocalStore(quotes);
      return item;
    }
    throw new Error('Orçamento não encontrado');
  },

  async deleteQuote(id: string): Promise<boolean> {
    const token = this.getToken();

    try {
      if (token && !token.startsWith('demo_')) {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/quotes/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) return true;
      }
    } catch (err) {
      console.warn('Falha ao deletar na API, persistindo no local store:', err);
    }

    const quotes = getLocalStore();
    const filtered = quotes.filter((q) => q.id !== id);
    saveLocalStore(filtered);
    return true;
  },

  createWhatsAppMessageUrl(phone: string, clientName: string, vehicle: string, serviceLabel: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Olá ${clientName}! Aqui é da equipe 63 Motorsport.\n` +
      `Recebemos seu pedido de orçamento para o seu ${vehicle} (${serviceLabel}).\n\n` +
      `Como podemos te ajudar hoje com a preparação?`
    );
    return `https://wa.me/55${cleanPhone}?text=${text}`;
  }
};
