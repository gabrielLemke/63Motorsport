import { ServiceOrder, OrderStatus, createDefaultChecklist } from '../types/serviceOrder';
import { supabaseRest } from '../lib/supabase';

const STORE_KEY = '63motorsport_admin_service_orders_v2';

/**
 * Gera uma imagem SVG em DataURL de alta definição com estética técnica da 63 Motorsport
 * para representar evidências fotográficas reais offline/online e em impressão A4.
 */
function buildMotorsportEvidenceSvg(
  badge: string,
  title: string,
  subtitle: string,
  metric: string,
  accentColor = '#EF4444'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#090A0D"/>
        <stop offset="50%" stop-color="#13161F"/>
        <stop offset="100%" stop-color="#090A0D"/>
      </linearGradient>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#ffffff" stroke-width="0.6" stroke-opacity="0.06"/>
      </pattern>
    </defs>
    <rect width="800" height="500" fill="url(#bg)"/>
    <rect width="800" height="500" fill="url(#grid)"/>
    <circle cx="660" cy="110" r="180" fill="${accentColor}" fill-opacity="0.12"/>
    <rect x="32" y="32" width="736" height="436" rx="18" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="2"/>
    <rect x="56" y="56" width="230" height="34" rx="8" fill="${accentColor}" fill-opacity="0.2" stroke="${accentColor}" stroke-width="1.5"/>
    <text x="72" y="78" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="14" letter-spacing="1.5">${badge}</text>
    <text x="740" y="78" text-anchor="end" fill="#94A3B8" font-family="monospace" font-size="13">63 MOTORSPORT // EVIDÊNCIA TÉCNICA</text>
    <path d="M 60 360 Q 190 340, 290 250 T 520 150 T 730 120" fill="none" stroke="${accentColor}" stroke-width="4" stroke-linecap="round"/>
    <path d="M 60 385 Q 200 370, 310 310 T 540 245 T 730 225" fill="none" stroke="#64748B" stroke-width="2.5" stroke-dasharray="8 6"/>
    <rect x="56" y="210" width="688" height="1" fill="#ffffff" fill-opacity="0.07"/>
    <rect x="56" y="300" width="688" height="1" fill="#ffffff" fill-opacity="0.07"/>
    <text x="56" y="155" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="28">${title}</text>
    <text x="56" y="188" fill="#94A3B8" font-family="sans-serif" font-size="16">${subtitle}</text>
    <rect x="56" y="392" width="688" height="52" rx="10" fill="#0D0F14" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="76" y="424" fill="${accentColor}" font-family="monospace" font-weight="bold" font-size="16">${metric}</text>
    <text x="724" y="424" text-anchor="end" fill="#64748B" font-family="monospace" font-size="13">REGISTRO AUDITADO LAB &amp; DYNO</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const DEFAULT_ORDERS: ServiceOrder[] = [
  {
    id: 'os-001',
    osNumber: 'OS-2026-0042',
    status: 'COMPLETED',
    operationalPhase: 'READY',
    leadOperator: 'Gabriel Lemke // Chefe de Calibração',
    boxRamp: 'Box 03 - Dinamômetro Servitec 4x4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    maintenanceStartedAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
    maintenanceCompletedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
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
      chassis: '9BWAA45G8JP018492',
      currentSetup: 'Intake R600 RacingLine, Downpipe 3" Inox 304, Velas NGK Grau 9'
    },
    dynoTelemetry: {
      beforeHp: 220,
      afterHp: 332,
      beforeTorque: 35.0,
      afterTorque: 49.8,
      boostPressure: 1.65,
      tuner: 'Gabriel Lemke // 63 Motorsport Lab'
    },
    checklist: {
      ...createDefaultChecklist('68.420 km', 'Lucas M. // Operador Chefe'),
      fuelLevelEntry: '3/4',
      fuelLevelExit: '1/2',
      mileageEntry: '68.420 km',
      mileageExit: '68.442 km',
      obdFaultCodesEntry: 'Nenhum código de falha (DTC) ativo na entrada',
      obdFaultCodesExit: '0 avarias em ECU SIMOS 18 e TCU DQ250 após 6 passagens no dinô',
      personalBelongings: 'Óculos de sol no porta-luvas, chave presencial + manual',
      bodyworkNotes: 'Veículo impecável na entrada; rodas Austin 18" sem marcas de guia',
      exitCompletedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString()
    },
    evidences: [
      {
        id: 'ev-101',
        phase: 'ENTRY',
        category: 'Vistoria Externa & Recepção',
        title: 'Check-in Golf GTI MK7 (BRA-2E19) na Recepção',
        notes: 'Hodômetro registrado em 68.420 km, tanque 3/4 de Gasolina Podium. Sem avarias de pintura.',
        imageUrl: buildMotorsportEvidenceSvg(
          'FASE 01 // ENTRADA',
          'Vistoria de Entrada - Golf GTI MK7',
          'Placa BRA-2E19 • 68.420 km • Lataria e Rodas 100% Íntegras',
          'CHECK-IN APROVADO • SCANNER OBD: 0 ERROS',
          '#10B981'
        ),
        author: 'Lucas M.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString()
      },
      {
        id: 'ev-102',
        phase: 'PROCESS',
        category: 'Ignição & Cofre do Motor',
        title: 'Substituição de Velas NGK Racing R7437-9 (Grau 9)',
        notes: 'Aplicação de jogo de velas Iridium Grau 9 com gap calibrado em 0.60mm e torque de 28 Nm no cabeçote EA888.',
        imageUrl: buildMotorsportEvidenceSvg(
          'FASE 02 // EXECUÇÃO',
          'Instalação Velas NGK R7437-9 + Revisão Boost',
          'Motor EA888 Gen 3 • Gap aferido em 0.60mm • Torque 28 Nm',
          'IGNIÇÃO RACING INSTALADA • PRESSURIZAÇÃO ESTANQUE',
          '#F59E0B'
        ),
        author: 'Lucas M.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
      },
      {
        id: 'ev-103',
        phase: 'EXIT',
        category: 'Dinamômetro & Entrega',
        title: 'Laudo Final Dinamômetro Servitec 4x4 (332 WHP / 49.8 kgfm)',
        notes: 'Ganho de +112 WHP na roda com AFR cravado em 11.8:1 em WOT e 1.65 bar de pico.',
        imageUrl: buildMotorsportEvidenceSvg(
          'FASE 03 // FINALIZAÇÃO',
          'Aferição Final Servitec 4x4: 332 WHP',
          'Antes: 220 WHP / 35.0 kgfm → Depois: 332 WHP / 49.8 kgfm',
          '+112 WHP (+51%) • 1.65 BAR • PRONTO PARA ENTREGA',
          '#EF4444'
        ),
        author: 'Gabriel Lemke',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString()
      }
    ],
    timeline: [
      {
        id: 'tl-101',
        stage: 'CHECKIN',
        title: 'Entrada do Veículo & Vistoria Fotográfica Inicial',
        description: 'Recepção do Golf GTI MK7 (BRA-2E19) com 68.420 km. Aplicação de capas de proteção em banco e volante.',
        operator: 'Lucas M.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
        durationMinutes: 25
      },
      {
        id: 'tl-102',
        stage: 'INSPECTION',
        title: 'Diagnóstico OBD-II Completo & Passagem Base no Dinamômetro',
        description: 'Scanner sem avarias em ECU/DSG. Passagem base aferiu 220 WHP e 35.0 kgfm nas rodas.',
        operator: 'Gabriel Lemke',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 43).toISOString(),
        durationMinutes: 45
      },
      {
        id: 'tl-103',
        stage: 'MECHANICAL',
        title: 'Instalação de Velas NGK Racing Grau 9 & Teste de Estanqueidade',
        description: 'Substituição das velas originais pelas NGK R7437-9 com gap 0.60mm. Revisão do intake R600 e abraçadeiras do downpipe.',
        operator: 'Lucas M.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
        durationMinutes: 90
      },
      {
        id: 'tl-104',
        stage: 'ECU_DYNO',
        title: 'Calibração Custom ECU Stage 2 + TCU DSG DQ250',
        description: 'Acerto fino de ignição, alvo de lambda e pressão de turbo (1.65 bar). Aumento de clamping pressure na DSG. Resultado final: 332 WHP e 49.8 kgfm.',
        operator: 'Gabriel Lemke',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        durationMinutes: 150
      },
      {
        id: 'tl-105',
        stage: 'COMPLETED',
        title: 'Checklist de Saída, Teste de Rodagem & Liberação',
        description: 'Conferência final de fluidos, leitura limpa de scanner (0 DTCs), higienização técnica e conclusão da manutenção com 68.442 km.',
        operator: 'Gabriel Lemke',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        durationMinutes: 35
      }
    ],
    items: [
      {
        id: 'item-1',
        type: 'SERVICE',
        description: 'Mapeamento Custom de ECU Stage 2 em Dinamômetro 4x4 (Mapa Duplo Podium/Comum)',
        quantity: 1,
        unitPrice: 3200,
        totalPrice: 3200,
        executed: true,
        operator: 'Gabriel Lemke'
      },
      {
        id: 'item-2',
        type: 'SERVICE',
        description: 'Calibração de Câmbio DSG DQ250 (Aumento de pressão de embreagem e shift points)',
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
        executed: true,
        operator: 'Gabriel Lemke'
      },
      {
        id: 'item-3',
        type: 'PART',
        description: 'Jogo de Velas Iridium NGK Racing R7437-9 (Grau Frio 9)',
        quantity: 1,
        unitPrice: 650,
        totalPrice: 650,
        executed: true,
        operator: 'Lucas M.'
      },
      {
        id: 'item-4',
        type: 'SERVICE',
        description: 'Sessão de Aferição e Datalog no Dinamômetro Servitec 4x4 (6 passagens com log OBD-II)',
        quantity: 1,
        unitPrice: 600,
        totalPrice: 600,
        executed: true,
        operator: 'Gabriel Lemke'
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
    operationalPhase: 'TUNING',
    leadOperator: 'Lucas M. // Mecânico Chefe',
    boxRamp: 'Rampa 02 - Preparação Turbo & Motor',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    maintenanceStartedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    deliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
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
      chassis: 'WBS2U7C09L7E90063',
      currentSetup: 'Downpipes Inox, Charge Pipes Alumínio, Turbinas Híbridas Pure Stage 2'
    },
    dynoTelemetry: {
      beforeHp: 410,
      afterHp: 585,
      beforeTorque: 56.1,
      afterTorque: 76.8,
      boostPressure: 1.95,
      tuner: 'Gabriel Lemke // 63 Motorsport Lab'
    },
    checklist: {
      ...createDefaultChecklist('34.100 km', 'Lucas M. // Mecânico Chefe'),
      fuelLevelEntry: '1/2',
      fuelLevelExit: '1/2',
      mileageEntry: '34.100 km',
      mileageExit: '',
      obdFaultCodesEntry: 'Alerta de mistura rica em carga parcial (corrigido no mapa base)',
      obdFaultCodesExit: 'Em fase de aferição final no dinamômetro',
      personalBelongings: 'Transponder de trackday no console central, chave reserva',
      bodyworkNotes: 'Pequena marca de pedrinha no lip dianteiro em fibra de carbono (registrado na foto de entrada)'
    },
    evidences: [
      {
        id: 'ev-201',
        phase: 'ENTRY',
        category: 'Vistoria Externa & Recepção',
        title: 'Recepção BMW M2 Competition (MSM-0063) na Rampa 02',
        notes: 'Hodômetro 34.100 km. Registrado detalhe prévio de trackday no splitter dianteiro em carbono.',
        imageUrl: buildMotorsportEvidenceSvg(
          'FASE 01 // ENTRADA',
          'Check-in BMW M2 Competition (S55)',
          'Placa MSM-0063 • 34.100 km • Rampa 02 Alocada',
          'VISTORIA INICIAL COMPLETA • 12 ITENS AUDITADOS',
          '#10B981'
        ),
        author: 'Lucas M.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
      },
      {
        id: 'ev-202',
        phase: 'PROCESS',
        category: 'Montagem de Turbinas & Motor',
        title: 'Montagem do Par de Turbinas Híbridas Pure Stage 2 no S55',
        notes: 'Substituição das linhas de lubrificação e anéis de vedação OEM BMW. Torqueamento do coletor concluído.',
        imageUrl: buildMotorsportEvidenceSvg(
          'FASE 02 // MECÂNICA',
          'Instalação Twin-Turbo Pure Stage 2 (S55)',
          'Novas linhas de óleo/água + Velas BMW M8 Gapped 0.022"',
          'MONTAGEM MECÂNICA CONCLUÍDA • ZERO VAZAMENTOS',
          '#F59E0B'
        ),
        author: 'Lucas M.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
      }
    ],
    timeline: [
      {
        id: 'tl-201',
        stage: 'CHECKIN',
        title: 'Recepção Técnica & Checklist de Entrada BMW M2',
        description: 'Entrada do veículo na Rampa 02 com 34.100 km. Inspeção visual de carroceria, freios M-Sport e leitura inicial OBD.',
        operator: 'Lucas M.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
        durationMinutes: 30
      },
      {
        id: 'tl-202',
        stage: 'MECHANICAL',
        title: 'Desmontagem dos Turbos Originais e Instalação Pure Stage 2',
        description: 'Remoção de downpipes, montagem das turbinas híbridas Pure Stage 2 com juntas novas, troca de velas M8 (gap 0.022") e revisão dos charge pipes.',
        operator: 'Lucas M.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        durationMinutes: 320
      },
      {
        id: 'tl-203',
        stage: 'ECU_DYNO',
        title: 'Início de Calibração Customizada Multi-Mapa (E85 / Podium)',
        description: 'Veículo posicionado no dinamômetro Servitec 4x4. Primeiras passagens atingiram 585 WHP e 76.8 kgfm com 1.95 bar.',
        operator: 'Gabriel Lemke',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        durationMinutes: 95
      }
    ],
    items: [
      {
        id: 'item-201',
        type: 'PART',
        description: 'Kit de Turbinas Híbridas Pure Stage 2 High-Flow (Twin Turbo S55)',
        quantity: 1,
        unitPrice: 17500,
        totalPrice: 17500,
        executed: true,
        operator: 'Lucas M.'
      },
      {
        id: 'item-202',
        type: 'SERVICE',
        description: 'Mão de Obra Especializada para Montagem de Turbocompressores e Linhas de Óleo/Água',
        quantity: 1,
        unitPrice: 3800,
        totalPrice: 3800,
        executed: true,
        operator: 'Lucas M.'
      },
      {
        id: 'item-203',
        type: 'PART',
        description: 'Velas de Ignição de Alto Desempenho BMW M8 Gapped 0.022"',
        quantity: 1,
        unitPrice: 950,
        totalPrice: 950,
        executed: true,
        operator: 'Lucas M.'
      },
      {
        id: 'item-204',
        type: 'SERVICE',
        description: 'Desenvolvimento de Calibração Customizada Bootmod3 / MHD com sensor Flex Fuel',
        quantity: 1,
        unitPrice: 4200,
        totalPrice: 4200,
        executed: false,
        operator: 'Gabriel Lemke'
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
  },
  {
    id: 'os-000',
    osNumber: 'OS-2026-0019',
    status: 'DELIVERED',
    operationalPhase: 'READY',
    leadOperator: 'Lucas M. // Mecânico Chefe',
    boxRamp: 'Rampa 01 - Preparação Mecânica',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 34).toISOString(),
    maintenanceStartedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    maintenanceCompletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 34).toISOString(),
    deliveryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 34).toISOString(),
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
      mileage: '65.100 km',
      fuel: 'Gasolina Podium',
      color: 'Branco Puro',
      engine: '2.0 TSI (EA888 Gen 3 MQB)',
      chassis: '9BWAA45G8JP018492',
      currentSetup: 'Instalação inicial de Intake R600 + Downpipe Inox 304 + Fluido Motul RBF 660'
    },
    dynoTelemetry: {
      beforeHp: 220,
      afterHp: 245,
      beforeTorque: 35.0,
      afterTorque: 38.4,
      boostPressure: 1.25,
      tuner: 'Gabriel Lemke // 63 Motorsport Lab'
    },
    checklist: {
      ...createDefaultChecklist('65.100 km', 'Lucas M.'),
      mileageEntry: '65.100 km',
      mileageExit: '65.115 km',
      exitCompletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 34).toISOString()
    },
    evidences: [
      {
        id: 'ev-001',
        phase: 'PROCESS',
        category: 'Hardware & Escape',
        title: 'Instalação de Downpipe Inox 304 + Intake RacingLine R600',
        notes: 'Primeira passagem do veículo na oficina preparando o hardware físico para futuro Stage 2.',
        imageUrl: buildMotorsportEvidenceSvg(
          'HISTÓRICO ANTERIOR // HARDWARE',
          'Upgrade Físico: Downpipe 3" + Intake R600',
          'Golf GTI MK7 (BRA-2E19) aos 65.100 km • Preparação Base',
          'HARDWARE STAGE 2 INSTALADO COM SUCESSO',
          '#3B82F6'
        ),
        author: 'Lucas M.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString()
      }
    ],
    timeline: [
      {
        id: 'tl-001',
        stage: 'CHECKIN',
        title: 'Check-in aos 65.100 km para Upgrade de Hardware',
        description: 'Recepção do veículo totalmente original para instalação de kit de admissão e escapamento.',
        operator: 'Lucas M.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
        durationMinutes: 20
      },
      {
        id: 'tl-002',
        stage: 'MECHANICAL',
        title: 'Montagem de Downpipe 3" Inox 304, Intake R600 e Sangria Motul RBF 660',
        description: 'Instalação completa do conjunto de fluxo e substituição do fluido de freio por Motul RBF 660.',
        operator: 'Lucas M.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 34 - 1000 * 60 * 180).toISOString(),
        durationMinutes: 180
      },
      {
        id: 'tl-003',
        stage: 'COMPLETED',
        title: 'Finalização e Entrega ao Cliente (65.115 km)',
        description: 'Teste de rodagem sem ruídos ou vazamentos de escape. Veículo liberado.',
        operator: 'Lucas M.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 34).toISOString(),
        durationMinutes: 25
      }
    ],
    items: [
      {
        id: 'item-01',
        type: 'PART',
        description: 'Downpipe 3" Aço Inox 304 Solda TIG para Golf GTI MK7',
        quantity: 1,
        unitPrice: 2100,
        totalPrice: 2100,
        executed: true,
        operator: 'Lucas M.'
      },
      {
        id: 'item-02',
        type: 'SERVICE',
        description: 'Instalação de Intake, Downpipe e Sangria de Freios com Fluido Racing',
        quantity: 1,
        unitPrice: 950,
        totalPrice: 950,
        executed: true,
        operator: 'Lucas M.'
      }
    ],
    subtotalServices: 950,
    subtotalParts: 2100,
    discount: 50,
    totalAmount: 3000,
    paymentMethod: 'Cartão de Crédito 3x',
    warrantyTerms: 'Garantia vitalícia contra trincas de solda no Downpipe Inox 304.',
    notes: 'Hardware pronto para receber calibração Stage 2 na próxima visita.'
  }
];

function hydrateOrderDefaults(order: ServiceOrder): ServiceOrder {
  const operator = order.leadOperator || 'Lucas M. // Operador Chefe';
  return {
    ...order,
    operationalPhase:
      order.operationalPhase ||
      (order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'READY' : 'DIAGNOSIS'),
    leadOperator: operator,
    boxRamp: order.boxRamp || 'Rampa 01 - Operação & Diagnóstico',
    maintenanceStartedAt: order.maintenanceStartedAt || order.createdAt,
    checklist: order.checklist || createDefaultChecklist(order.vehicle?.mileage || '', operator),
    evidences: order.evidences || [],
    timeline:
      order.timeline && order.timeline.length > 0
        ? order.timeline
        : [
            {
              id: `tl-init-${order.id}`,
              stage: 'CHECKIN',
              title: 'Abertura da Ordem de Serviço & Recepção no Pátio',
              description: `Veículo ${order.vehicle?.model || ''} recebido para intervenção técnica na 63 Motorsport.`,
              operator,
              timestamp: order.createdAt
            }
          ]
  };
}

/**
 * Converte um objeto ServiceOrder (TypeScript) para o formato de linha da tabela public.service_orders no Supabase
 */
function toSupabaseRow(order: ServiceOrder) {
  return {
    id: order.id,
    os_number: order.osNumber,
    status: order.status,
    operational_phase: order.operationalPhase || 'CHECKIN',
    lead_operator: order.leadOperator || 'Equipe 63 Motorsport',
    box_ramp: order.boxRamp || 'Rampa 01',
    client_name: order.client?.name || 'Cliente',
    client_phone: order.client?.phone || '',
    vehicle_model: order.vehicle?.model || 'Veículo',
    vehicle_plate: order.vehicle?.plate || '',
    total_amount: Number(order.totalAmount || 0),
    maintenance_started_at: order.maintenanceStartedAt || order.createdAt,
    maintenance_completed_at: order.maintenanceCompletedAt || null,
    delivery_date: order.deliveryDate || null,
    client: order.client || {},
    vehicle: order.vehicle || {},
    dyno_telemetry: order.dynoTelemetry || {},
    checklist: order.checklist || {},
    evidences: order.evidences || [],
    timeline: order.timeline || [],
    items: order.items || [],
    subtotal_services: Number(order.subtotalServices || 0),
    subtotal_parts: Number(order.subtotalParts || 0),
    discount: Number(order.discount || 0),
    payment_method: order.paymentMethod || 'A Combinar',
    warranty_terms: order.warrantyTerms || '',
    notes: order.notes || '',
    quote_id: order.quoteId || null,
    created_at: order.createdAt,
    updated_at: order.updatedAt || new Date().toISOString()
  };
}

/**
 * Converte uma linha retornada do Supabase (public.service_orders) para ServiceOrder (TypeScript)
 */
function fromSupabaseRow(row: any): ServiceOrder {
  return hydrateOrderDefaults({
    id: row.id,
    osNumber: row.os_number,
    status: row.status,
    operationalPhase: row.operational_phase,
    leadOperator: row.lead_operator,
    boxRamp: row.box_ramp,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    maintenanceStartedAt: row.maintenance_started_at || row.created_at,
    maintenanceCompletedAt: row.maintenance_completed_at || undefined,
    deliveryDate: row.delivery_date || undefined,
    client: row.client || {
      name: row.client_name || 'Cliente',
      phone: row.client_phone || ''
    },
    vehicle: row.vehicle || {
      model: row.vehicle_model || 'Veículo',
      plate: row.vehicle_plate || ''
    },
    dynoTelemetry: row.dyno_telemetry || undefined,
    checklist: row.checklist || undefined,
    evidences: Array.isArray(row.evidences) ? row.evidences : [],
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    items: Array.isArray(row.items) ? row.items : [],
    subtotalServices: Number(row.subtotal_services || 0),
    subtotalParts: Number(row.subtotal_parts || 0),
    discount: Number(row.discount || 0),
    totalAmount: Number(row.total_amount || 0),
    paymentMethod: row.payment_method || 'A Combinar',
    warrantyTerms: row.warranty_terms || '',
    notes: row.notes || '',
    quoteId: row.quote_id || undefined
  });
}

function getLocalStore(): ServiceOrder[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed: ServiceOrder[] = JSON.parse(raw);
      return parsed.map(hydrateOrderDefaults);
    }
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

function filterOrdersList(
  list: ServiceOrder[],
  filter?: { status?: string; search?: string }
): ServiceOrder[] {
  let result = [...list];

  if (filter?.status && filter.status !== 'ALL') {
    result = result.filter((o) => o.status === filter.status);
  }

  if (filter?.search) {
    const term = filter.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.osNumber.toLowerCase().includes(term) ||
        o.client.name.toLowerCase().includes(term) ||
        o.vehicle.model.toLowerCase().includes(term) ||
        (o.vehicle.plate && o.vehicle.plate.toLowerCase().includes(term)) ||
        o.client.phone.includes(term)
    );
  }

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const serviceOrderApi = {
  async listOrders(filter?: { status?: string; search?: string }): Promise<ServiceOrder[]> {
    // 1. Consulta diretamente o Supabase Cloud (PostgreSQL)
    try {
      const rows = await supabaseRest.select('service_orders', 'select=*&order=created_at.desc');

      if (rows && rows.length > 0) {
        const mapped = rows.map(fromSupabaseRow);
        saveLocalStore(mapped);
        return filterOrdersList(mapped, filter);
      }

      // Se a tabela no Supabase estiver vazia no 1º acesso, popula automaticamente com os 3 prontuários iniciais!
      const seededRows = await supabaseRest.upsert(
        'service_orders',
        DEFAULT_ORDERS.map(toSupabaseRow),
        'id'
      );
      const seeded = (seededRows || DEFAULT_ORDERS).map((r: any) =>
        r.os_number ? fromSupabaseRow(r) : hydrateOrderDefaults(r)
      );
      saveLocalStore(seeded);
      return filterOrdersList(seeded, filter);
    } catch (err) {
      console.warn('Fallback offline ativado para listOrders:', err);
    }

    // 2. Fallback resiliente caso o celular esteja sem internet no galpão
    return filterOrdersList(getLocalStore(), filter);
  },

  async getOrder(id: string): Promise<ServiceOrder | null> {
    try {
      const rows = await supabaseRest.select(
        'service_orders',
        `select=*&or=(id.eq.${encodeURIComponent(id)},os_number.eq.${encodeURIComponent(id)})`
      );
      if (rows && rows.length > 0) {
        return fromSupabaseRow(rows[0]);
      }
    } catch (err) {
      console.warn('Fallback local para getOrder:', err);
    }

    const list = getLocalStore();
    return list.find((o) => o.id === id || o.osNumber === id) || null;
  },

  async createOrder(data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const nowIso = new Date().toISOString();
    const operator = data.leadOperator || 'Lucas M. // Operador Chefe';
    const list = getLocalStore();
    const nextNum = list.length + 44;
    const year = new Date().getFullYear();
    const osNumber = data.osNumber || `OS-${year}-${String(nextNum).padStart(4, '0')}`;
    const id = data.id || `os-${Date.now()}`;

    const items = data.items || [];
    const subtotalServices = items
      .filter((i) => i.type === 'SERVICE')
      .reduce((acc, i) => acc + (i.totalPrice || i.quantity * i.unitPrice), 0);
    const subtotalParts = items
      .filter((i) => i.type === 'PART')
      .reduce((acc, i) => acc + (i.totalPrice || i.quantity * i.unitPrice), 0);
    const discount = data.discount || 0;
    const totalAmount = Math.max(0, subtotalServices + subtotalParts - discount);

    const newOrder: ServiceOrder = hydrateOrderDefaults({
      id,
      osNumber,
      status: data.status || 'IN_PROGRESS',
      operationalPhase: data.operationalPhase || 'CHECKIN',
      leadOperator: operator,
      boxRamp: data.boxRamp || 'Rampa 01 - Recepção & Diagnóstico',
      createdAt: nowIso,
      updatedAt: nowIso,
      maintenanceStartedAt: data.maintenanceStartedAt || nowIso,
      maintenanceCompletedAt: data.maintenanceCompletedAt,
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
        chassis: data.vehicle?.chassis || '',
        currentSetup: data.vehicle?.currentSetup || ''
      },
      dynoTelemetry: data.dynoTelemetry,
      checklist:
        data.checklist || createDefaultChecklist(data.vehicle?.mileage || '', operator),
      evidences: data.evidences || [],
      timeline:
        data.timeline && data.timeline.length > 0
          ? data.timeline
          : [
              {
                id: `tl-${Date.now()}`,
                stage: 'CHECKIN',
                title: 'Check-in do Veículo & Início da Manutenção',
                description: `Veículo ${data.vehicle?.model || ''} (${
                  data.vehicle?.plate || 'Sem placa'
                }) deu entrada na oficina com ${data.vehicle?.mileage || 'km inicial não informado'}.`,
                operator,
                timestamp: nowIso,
                durationMinutes: 20
              }
            ],
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
    });

    // Salva no cache local imediatamente
    saveLocalStore([newOrder, ...list.filter((o) => o.id !== newOrder.id)]);

    // Persiste em tempo real no Supabase Cloud
    try {
      const savedRows = await supabaseRest.upsert('service_orders', toSupabaseRow(newOrder), 'id');
      if (savedRows && savedRows.length > 0) {
        return fromSupabaseRow(savedRows[0]);
      }
    } catch (err) {
      console.warn('Falha ao sincronizar nova OS no Supabase, mantida no cache local:', err);
    }

    return newOrder;
  },

  async updateOrder(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const list = getLocalStore();
    const existing = list.find((o) => o.id === id) || (await this.getOrder(id));
    if (!existing) throw new Error('OS não encontrada');

    const items = data.items || existing.items;
    const subtotalServices = items
      .filter((i) => i.type === 'SERVICE')
      .reduce((acc, i) => acc + (i.totalPrice || i.quantity * i.unitPrice), 0);
    const subtotalParts = items
      .filter((i) => i.type === 'PART')
      .reduce((acc, i) => acc + (i.totalPrice || i.quantity * i.unitPrice), 0);
    const discount = data.discount !== undefined ? data.discount : existing.discount;
    const totalAmount = Math.max(0, subtotalServices + subtotalParts - discount);

    const updated: ServiceOrder = hydrateOrderDefaults({
      ...existing,
      ...data,
      client: { ...existing.client, ...data.client },
      vehicle: { ...existing.vehicle, ...data.vehicle },
      checklist: data.checklist !== undefined ? data.checklist : existing.checklist,
      evidences: data.evidences !== undefined ? data.evidences : existing.evidences,
      timeline: data.timeline !== undefined ? data.timeline : existing.timeline,
      items,
      subtotalServices,
      subtotalParts,
      discount,
      totalAmount,
      updatedAt: new Date().toISOString()
    });

    saveLocalStore(list.map((o) => (o.id === id ? updated : o)));

    try {
      const savedRows = await supabaseRest.upsert('service_orders', toSupabaseRow(updated), 'id');
      if (savedRows && savedRows.length > 0) {
        return fromSupabaseRow(savedRows[0]);
      }
    } catch (err) {
      console.warn('Falha ao atualizar OS no Supabase, mantida no cache local:', err);
    }

    return updated;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<ServiceOrder> {
    const patch: Partial<ServiceOrder> = { status };
    if (status === 'COMPLETED' || status === 'DELIVERED') {
      patch.operationalPhase = 'READY';
      patch.maintenanceCompletedAt = new Date().toISOString();
    }
    return this.updateOrder(id, patch);
  },

  async deleteOrder(id: string): Promise<boolean> {
    const list = getLocalStore();
    saveLocalStore(list.filter((o) => o.id !== id));

    try {
      await supabaseRest.remove('service_orders', `id=eq.${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn('Aviso ao deletar OS no Supabase:', err);
    }

    return true;
  }
};
