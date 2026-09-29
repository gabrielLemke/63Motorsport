import { useState, useEffect } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesGrid } from './components/ServicesGrid';
import { VisualIdentityGuide } from './components/VisualIdentityGuide';
import { Footer } from './components/Footer';
import { QuoteModal } from './components/QuoteModal';
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
    <div className="min-h-screen bg-[#090A0D] text-slate-100 flex flex-col">
      <AnnouncementBar />
      <Navbar onOpenQuote={() => handleOpenQuote()} />
      <main className="flex-1">
        <Hero onOpenQuote={() => handleOpenQuote()} projects={projects} />
        <ServicesGrid onSelectService={(service) => handleOpenQuote(service)} />
        <VisualIdentityGuide />
      </main>
      <Footer onOpenQuote={() => handleOpenQuote()} />

      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialService={activeService}
      />
    </div>
  );
}

export default App;
