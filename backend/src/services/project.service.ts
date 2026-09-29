import { prisma } from '../lib/prisma.js';
import { ProjectQueryInput } from '../schemas/project.schema.js';

const FALLBACK_PROJECTS = [
  {
    id: 'proj-1',
    slug: 'golf-gti-mk7-stage2',
    title: 'Golf GTI MK7 2.0 TSI - Stage 2 Custom',
    vehicle: 'VW Golf GTI MK7',
    engine: '2.0 TSI (EA888 Gen 3)',
    stage: 'STAGE 2 CUSTOM',
    originalHp: 220,
    originalTorque: 35.0,
    tunedHp: 330,
    tunedTorque: 49.8,
    peakRpm: 6200,
    boostPressure: 1.6,
    fuel: 'Gasolina Podium',
    mods: [
      'Downpipe 3" em Inox 304 com manta térmica',
      'Intake R600 RacingLine',
      'Inlet Pipe & Muffler Delete',
      'Intercooler frontal de alta vazão',
      'Mapa de ECU & TCU 63 Motorsport (Pops & Bangs no Sport)'
    ],
    isFeatured: true
  },
  {
    id: 'proj-2',
    slug: 'bmw-m2-competition-stage3',
    title: 'BMW M2 Competition - Stage 3 Pure Turbos',
    vehicle: 'BMW M2 Competition (F87)',
    engine: '3.0 Twin-Turbo (S55)',
    stage: 'STAGE 3 FORGED',
    originalHp: 410,
    originalTorque: 56.1,
    tunedHp: 580,
    tunedTorque: 76.5,
    peakRpm: 6800,
    boostPressure: 1.9,
    fuel: 'Etanol E85',
    mods: [
      'Turbinas híbridas Pure Stage 2 High Flow',
      'Charge pipes em alumínio e J-Pipe',
      'Downpipes sem restrição',
      'Bielas e pistões forjados Carrillo / CP-Carrillo',
      'Crank Hub reforçado com 4 pinos',
      'Acerto com mapas alternáveis via volante'
    ],
    isFeatured: true
  },
  {
    id: 'proj-3',
    slug: 'audi-rs3-8v-stage2-flex',
    title: 'Audi RS3 8V - 2.5 TFSI 5 Cilindros Stage 2 Flex',
    vehicle: 'Audi RS3 Sedan (8V)',
    engine: '2.5 TFSI DAZA 5 Cilindros',
    stage: 'STAGE 2 FLEX',
    originalHp: 400,
    originalTorque: 48.9,
    tunedHp: 535,
    tunedTorque: 69.2,
    peakRpm: 6400,
    boostPressure: 1.7,
    fuel: 'Etanol / Podium Flex',
    mods: [
      'Sensor Flex Fuel com calibração automática',
      'Downpipe 3.5" inox com cat-back esportivo',
      'Inlet 4" CTS Turbo com filtro cônico de alto fluxo',
      'Intercooler Wagner Tuning EVO3',
      'Calibração de DSG 7 velocidades DQ500'
    ],
    isFeatured: true
  }
];

export class ProjectService {
  static async listProjects(query?: ProjectQueryInput) {
    try {
      const where: Record<string, unknown> = {};
      if (query?.stage) where.stage = query.stage;
      if (typeof query?.featured === 'boolean') where.isFeatured = query.featured;

      const items = await prisma.dynoProject.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      if (items.length > 0) {
        return items.map((p) => ({
          ...p,
          mods: typeof p.mods === 'string' ? JSON.parse(p.mods) : p.mods
        }));
      }
    } catch (err) {
      console.warn('⚠️ Utilizando projetos em fallback:', err);
    }

    return FALLBACK_PROJECTS;
  }
}
