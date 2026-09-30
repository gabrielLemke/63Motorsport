import { useState, useEffect } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesGrid } from './components/ServicesGrid';
import { VisualIdentityGuide } from './components/VisualIdentityGuide';
import { Footer } from './components/Footer';
import { QuoteModal } from './components/QuoteModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { DynoProject, ServiceType } from './types';
import { fetchDynoProjects } from './services/api';

export function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceType>('REMAP_STAGE2');
  const [projects, setProjects] = useState<DynoProject[]>([]);

  useEffect(() => {
    fetchDynoProjects().then((data) => {
      if (data && data.length > 0) {
        setProjects(data);
      }
    });
  }, []);

  const handleOpenQuote = (service?: ServiceType) => {
    if (service) {
      setActiveService(service);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090A0D] text-slate-100 flex flex-col overflow-x-hidden w-full max-w-full relative">
      <AnnouncementBar />
      <Navbar onOpenQuote={() => handleOpenQuote()} />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Hero onOpenQuote={() => handleOpenQuote()} projects={projects} />
        <ServicesGrid onSelectService={(service) => handleOpenQuote(service)} />
        <VisualIdentityGuide />
      </main>
      <Footer onOpenQuote={() => handleOpenQuote()} />

      {/* Botão Flutuante de WhatsApp para Conversão Rápida no Celular */}
      <FloatingWhatsApp onOpenQuote={() => handleOpenQuote()} />

      {/* Modal de Orçamento com Rolagem Segura para Mobile */}
      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialService={activeService}
      />
    </div>
  );
}

export default App;
