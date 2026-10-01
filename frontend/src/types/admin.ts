export type QuoteStatus = 'PENDING' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface AdminQuote {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle: string;
  service: string;
  serviceLabel: string;
  message?: string;
  status: QuoteStatus;
  estimatedValue: number;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardMetrics {
  overview: {
    totalQuotes: number;
    pendingCount: number;
    contactedCount: number;
    scheduledCount: number;
    completedCount: number;
    totalRevenueEstimated: number;
    completedRevenue: number;
    totalAccesses: number;
    conversionRate: string;
  };
  weeklyAccesses: Array<{ day: string; accesses: number }>;
  serviceChartData: Array<{ name: string; count: number; percentage: number }>;
  recentQuotes: AdminQuote[];
}

export interface AdminUser {
  email: string;
  name: string;
  role: string;
}
