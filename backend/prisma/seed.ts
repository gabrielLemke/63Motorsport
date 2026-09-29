import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏁 Iniciando seed de projetos da 63 Motorsport...');

  await prisma.dynoProject.deleteMany();

  const projects = [
    {
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
      mods: JSON.stringify([
        'Downpipe 3" em Inox 304 com manta térmica',
        'Intake R600 RacingLine',
        'Inlet Pipe & Muffler Delete',
        'Intercooler frontal de alta vazão',
        'Mapa de ECU & TCU 63 Motorsport (Pops & Bangs no Sport)'
      ]),
      isFeatured: true
    },
    {
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
      mods: JSON.stringify([
        'Turbinas híbridas Pure Stage 2 High Flow',
        'Charge pipes em alumínio e J-Pipe',
        'Downpipes sem restrição',
        'Bielas e pistões forjados Carrillo / CP-Carrillo',
        'Crank Hub reforçado com 4 pinos',
        'Acerto com mapas alternáveis via volante'
      ]),
      isFeatured: true
    },
    {
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
      mods: JSON.stringify([
        'Sensor Flex Fuel com calibração automática',
        'Downpipe 3.5" inox com cat-back esportivo',
        'Inlet 4" CTS Turbo com filtro cônico de alto fluxo',
        'Intercooler Wagner Tuning EVO3',
        'Calibração de DSG 7 velocidades DQ500'
      ]),
      isFeatured: true
    }
  ];

  for (const proj of projects) {
    await prisma.dynoProject.create({ data: proj });
  }

  console.log(`✅ Seed concluído! ${projects.length} projetos inseridos no banco.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
