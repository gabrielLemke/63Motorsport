import { useState, useEffect } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesGrid } from './components/ServicesGrid';
import { VisualIdentityGuide } from './components/VisualIdentityGuide';
import { Footer } from './components/Footer';
import { QuoteModal } from './components/QuoteModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import {
  AdminLogin,
  AdminLayout,
  AdminDashboard,
  AdminQuotesGrid,
  OrdersGrid,
  WorkshopOperationsView,
  ClientsVehiclesView
} from './components/admin';
import { DynoProject, ServiceType } from './types';
import { AdminUser, AdminQuote, AdminTab, UserRole } from './types/admin';
import { fetchDynoProjects } from './services/api';
import { adminApi } from './services/adminApi';

export function App() {
  // Navigation & View States
  const [view, setView] = useState<'site' | 'admin'>('site');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('operations');
  const [pendingQuotesCount, setPendingQuotesCount] = useState<number>(2);
  const [quoteForNewOS, setQuoteForNewOS] = useState<AdminQuote | null>(null);

  // Public Site & PWA States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceType>('REMAP_STAGE2');
  const [projects, setProjects] = useState<DynoProject[]>([]);

  const effectiveRole: UserRole = roleOverride || adminUser?.role || 'DIRECTOR';

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
    const storedUser = adminApi.getCurrentUser();
    if (storedUser) {
      setAdminUser(storedUser);
      setAdminTab('operations');
    }

    const params = new URLSearchParams(window.location.search);
    const isStandaloneApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as any).standalone);

    // Se abrir pelo ícone do App instalado (PWA) ou URL ?admin=true, abre direto a operação!
    if (
      params.get('admin') === 'true' ||
      params.get('source') === 'pwa' ||
      window.location.hash === '#admin' ||
      isStandaloneApp
    ) {
      setView('admin');
    }

    const tabParam = params.get('tab') as AdminTab | null;
    if (tabParam && ['operations', 'clients', 'orders', 'quotes', 'dashboard'].includes(tabParam)) {
      setAdminTab(tabParam);
    }

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
    setRoleOverride(null);
  };

  const handleToggleRoleView = () => {
    const nextRole: UserRole = effectiveRole === 'DIRECTOR' ? 'OPERATOR' : 'DIRECTOR';
    setRoleOverride(nextRole);
    if (nextRole === 'OPERATOR' && (adminTab === 'dashboard' || adminTab === 'quotes')) {
      setAdminTab('operations');
    }
  };

  const handleCreateOrderFromQuote = (quote: AdminQuote) => {
    setQuoteForNewOS(quote);
    setAdminTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (view === 'admin') {
    return (
      <>
        {!adminUser ? (
          <AdminLogin
            onLoginSuccess={(user) => {
              setAdminUser(user);
              setRoleOverride(null);
              setAdminTab('operations');
              refreshPendingCount();
            }}
            onBackToSite={handleBackToSite}
          />
        ) : (
          <AdminLayout
            user={adminUser}
            effectiveRole={effectiveRole}
            onToggleRoleView={adminUser.role === 'DIRECTOR' ? handleToggleRoleView : undefined}
            activeTab={adminTab}
            onSelectTab={setAdminTab}
            pendingQuotesCount={pendingQuotesCount}
            onLogout={handleLogout}
            onViewSite={handleBackToSite}
            onInstallApp={() => setIsPwaModalOpen(true)}
          >
            {adminTab === 'operations' ? (
              <WorkshopOperationsView userRole={effectiveRole} userName={adminUser.name} />
            ) : adminTab === 'clients' ? (
              <ClientsVehiclesView userRole={effectiveRole} userName={adminUser.name} />
            ) : adminTab === 'orders' ? (
              <OrdersGrid
                initialQuoteForNewOS={quoteForNewOS}
                onClearInitialQuote={() => setQuoteForNewOS(null)}
                userRole={effectiveRole}
                userName={adminUser.name}
              />
            ) : adminTab === 'quotes' && effectiveRole === 'DIRECTOR' ? (
              <AdminQuotesGrid
                onRefreshMetrics={refreshPendingCount}
                onCreateOrder={handleCreateOrderFromQuote}
              />
            ) : (
              <AdminDashboard
                onNavigateToQuotes={() => {
                  setAdminTab('quotes');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </AdminLayout>
        )}

        <PwaInstallPrompt
          onOpenOperationsApp={handleOpenAdmin}
          forceOpenModal={isPwaModalOpen}
          onCloseForcedModal={() => setIsPwaModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0D] text-slate-100 flex flex-col overflow-x-hidden w-full max-w-full relative">
      <AnnouncementBar onInstallApp={() => setIsPwaModalOpen(true)} />
      <Navbar
        onOpenQuote={() => handleOpenQuote()}
        onOpenAdmin={handleOpenAdmin}
        onInstallApp={() => setIsPwaModalOpen(true)}
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

      <FloatingWhatsApp onOpenQuote={() => handleOpenQuote()} />

      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          refreshPendingCount();
        }}
        initialService={activeService}
      />

      {/* Prompt Automático de Download do Aplicativo PWA/TWA ao acessar pelo celular */}
      <PwaInstallPrompt
        onOpenOperationsApp={handleOpenAdmin}
        forceOpenModal={isPwaModalOpen}
        onCloseForcedModal={() => setIsPwaModalOpen(false)}
      />
    </div>
  );
}

export default App;
