import { useState, useEffect } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesGrid } from './components/ServicesGrid';
import { VisualIdentityGuide } from './components/VisualIdentityGuide';
import { Footer } from './components/Footer';
import { QuoteModal } from './components/QuoteModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import {
  AdminLogin,
  AdminLayout,
  AdminDashboard,
  AdminQuotesGrid,
  OrdersGrid
} from './components/admin';
import { DynoProject, ServiceType } from './types';
import { AdminUser, AdminQuote } from './types/admin';
import { fetchDynoProjects } from './services/api';
import { adminApi } from './services/adminApi';

export function App() {
  // Navigation & View States
  const [view, setView] = useState<'site' | 'admin'>('site');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminTab, setAdminTab] = useState<'dashboard' | 'quotes' | 'orders'>('dashboard');
  const [pendingQuotesCount, setPendingQuotesCount] = useState<number>(2);
  const [quoteForNewOS, setQuoteForNewOS] = useState<AdminQuote | null>(null);

  // Public Site States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceType>('REMAP_STAGE2');
  const [projects, setProjects] = useState<DynoProject[]>([]);

  // Carrega contagem de orçamentos pendentes
  const refreshPendingCount = async () => {
    try {
      const data = await adminApi.getDashboard();
      if (data?.overview) {
        setPendingQuotesCount(data.overview.pendingCount);
      }
    } catch {
      // Ignora erro
    }
  };

  useEffect(() => {
    // 1. Verifica autenticação persistida
    const storedUser = adminApi.getCurrentUser();
    if (storedUser) {
      setAdminUser(storedUser);
    }

    // 2. Verifica se a URL contém instrução para abrir admin (?admin ou #admin)
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || window.location.hash === '#admin') {
      setView('admin');
    }

    // 3. Carrega projetos do dinamômetro
    fetchDynoProjects().then((data) => {
      if (data && data.length > 0) {
        setProjects(data);
      }
    });

    refreshPendingCount();
  }, []);

  const handleOpenQuote = (service?: ServiceType) => {
    if (service) {
      setActiveService(service);
    }
    setIsModalOpen(true);
  };

  const handleOpenAdmin = () => {
    setView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSite = () => {
    setView('site');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    adminApi.logout();
    setAdminUser(null);
  };

  const handleCreateOrderFromQuote = (quote: AdminQuote) => {
    setQuoteForNewOS(quote);
    setAdminTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Se a visualização for o painel administrativo
  if (view === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => {
            setAdminUser(user);
            refreshPendingCount();
          }}
          onBackToSite={handleBackToSite}
        />
      );
    }

    return (
      <AdminLayout
        user={adminUser}
        activeTab={adminTab}
        onSelectTab={setAdminTab}
        pendingQuotesCount={pendingQuotesCount}
        onLogout={handleLogout}
        onViewSite={handleBackToSite}
      >
        {adminTab === 'dashboard' ? (
          <AdminDashboard
            onNavigateToQuotes={() => {
              setAdminTab('quotes');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : adminTab === 'quotes' ? (
          <AdminQuotesGrid
            onRefreshMetrics={refreshPendingCount}
            onCreateOrder={handleCreateOrderFromQuote}
          />
        ) : (
          <OrdersGrid
            initialQuoteForNewOS={quoteForNewOS}
            onClearInitialQuote={() => setQuoteForNewOS(null)}
          />
        )}
      </AdminLayout>
    );
  }

  // Visualização principal pública da oficina 63 Motorsport
  return (
    <div className="min-h-screen bg-[#090A0D] text-slate-100 flex flex-col overflow-x-hidden w-full max-w-full relative">
      <AnnouncementBar />
      <Navbar
        onOpenQuote={() => handleOpenQuote()}
        onOpenAdmin={handleOpenAdmin}
      />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Hero onOpenQuote={() => handleOpenQuote()} projects={projects} />
        <ServicesGrid onSelectService={(service) => handleOpenQuote(service)} />
        <VisualIdentityGuide />
      </main>
      <Footer
        onOpenQuote={() => handleOpenQuote()}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Botão Flutuante de WhatsApp para Conversão Rápida no Celular */}
      <FloatingWhatsApp onOpenQuote={() => handleOpenQuote()} />

      {/* Modal de Orçamento com Rolagem Segura para Mobile */}
      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          refreshPendingCount();
        }}
        initialService={activeService}
      />
    </div>
  );
}

export default App;
