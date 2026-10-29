import { AdminQuote, AdminUser, DashboardMetrics, QuoteStatus } from '../types/admin';
import { supabaseRest } from '../lib/supabase';

const TOKEN_KEY = '63motorsport_admin_token';
const USER_KEY = '63motorsport_admin_user';
const STORE_KEY = '63motorsport_admin_local_quotes_v1';

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
  }
];

function fromSupabaseQuote(row: any): AdminQuote {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || '',
    vehicle: row.vehicle,
    service: row.service,
    serviceLabel: row.service_label || row.service,
    message: row.message || '',
    status: (row.status as QuoteStatus) || 'PENDING',
    estimatedValue: Number(row.estimated_value || 3500),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

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

function normalizeUserRole(user: any): AdminUser {
  const rawRole = String(user?.role || '').toUpperCase();
  const role = rawRole === 'OPERATOR' ? 'OPERATOR' : 'DIRECTOR';
  return {
    email: user?.email || 'admin@63motorsport.com.br',
    name: user?.name || (role === 'DIRECTOR' ? 'Gabriel Lemke // Diretoria 63' : 'Lucas M. // Operador de Pátio'),
    role,
    specialty:
      user?.specialty ||
      (role === 'DIRECTOR' ? 'Diretoria & Engenharia Chefe' : 'Mecânica de Performance & Vistoria')
  };
}

export const adminApi = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser(): AdminUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return normalizeUserRole(parsed);
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; user: AdminUser }> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Perfil Diretoria
    if (
      (cleanEmail === 'admin@63motorsport.com.br' ||
        cleanEmail === 'diretoria@63motorsport.com.br' ||
        cleanEmail === 'admin@63.com') &&
      password === 'admin123'
    ) {
      const directorUser: AdminUser = {
        email: cleanEmail,
        name: 'Gabriel Lemke // Diretoria 63',
        role: 'DIRECTOR',
        specialty: 'Diretoria & Engenharia Chefe'
      };
      localStorage.setItem(TOKEN_KEY, 'supabase_session_63motorsport_director');
      localStorage.setItem(USER_KEY, JSON.stringify(directorUser));
      return { success: true, user: directorUser };
    }

    // 2. Perfil Operador / Pátio / Mecânico
    if (
      (cleanEmail === 'operador@63motorsport.com.br' ||
        cleanEmail === 'mecanico@63motorsport.com.br' ||
        cleanEmail === 'patio@63motorsport.com.br') &&
      (password === 'operador123' || password === 'admin123')
    ) {
      const operatorUser: AdminUser = {
        email: cleanEmail,
        name: 'Lucas M. // Operador Chefe de Pátio',
        role: 'OPERATOR',
        specialty: 'Mecânica de Performance & Vistoria'
      };
      localStorage.setItem(TOKEN_KEY, 'supabase_session_63motorsport_operator');
      localStorage.setItem(USER_KEY, JSON.stringify(operatorUser));
      return { success: true, user: operatorUser };
    }

    throw new Error(
      'Credenciais incorretas. Use admin@63motorsport.com.br (senha: admin123) para Diretoria ou operador@63motorsport.com.br (senha: operador123) para Operador.'
    );
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async getQuotes(filter?: { status?: string; search?: string }): Promise<AdminQuote[]> {
    let list: AdminQuote[] = [];

    try {
      const rows = await supabaseRest.select('quotes', 'select=*&order=created_at.desc');
      if (rows && rows.length > 0) {
        list = rows.map(fromSupabaseQuote);
        saveLocalStore(list);
      } else {
        list = getLocalStore();
      }
    } catch (err) {
      console.warn('Fallback local para getQuotes:', err);
      list = getLocalStore();
    }

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

  async getDashboard(): Promise<DashboardMetrics> {
    const quotes = await this.getQuotes();
    let totalAccesses = 2340;

    try {
      const tel = await supabaseRest.select('site_telemetry', 'select=*&id=eq.main');
      if (tel && tel.length > 0 && tel[0].total_accesses) {
        totalAccesses = Number(tel[0].total_accesses);
      }
    } catch {
      // Usa valor padrão
    }

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
        totalAccesses,
        conversionRate: ((totalQuotes / Math.max(1, totalAccesses)) * 100).toFixed(1)
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

  async updateQuoteStatus(id: string, newStatus: QuoteStatus): Promise<AdminQuote> {
    const quotes = getLocalStore();
    const item = quotes.find((q) => q.id === id);
    if (item) {
      item.status = newStatus;
      item.updatedAt = new Date().toISOString();
      saveLocalStore(quotes);
    }

    try {
      const updatedRows = await supabaseRest.update(
        'quotes',
        `id=eq.${encodeURIComponent(id)}`,
        {
          status: newStatus,
          updated_at: new Date().toISOString()
        }
      );
      if (updatedRows && updatedRows.length > 0) {
        return fromSupabaseQuote(updatedRows[0]);
      }
    } catch (err) {
      console.warn('Fallback local para updateQuoteStatus:', err);
    }

    if (item) return item;
    throw new Error('Orçamento não encontrado');
  },

  async deleteQuote(id: string): Promise<boolean> {
    const quotes = getLocalStore();
    saveLocalStore(quotes.filter((q) => q.id !== id));

    try {
      await supabaseRest.remove('quotes', `id=eq.${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn('Aviso ao deletar quote no Supabase:', err);
    }

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
