import { useState, useEffect, type FormEvent } from 'react';
import {
  X,
  Plus,
  Trash2,
  Wrench,
  CheckCircle2,
  Zap,
  Car,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { ServiceOrder, OrderItem, OrderStatus, createDefaultChecklist } from '../../../types/serviceOrder';
import { AdminQuote, UserRole } from '../../../types/admin';
import { serviceOrderApi } from '../../../services/serviceOrderApi';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Partial<ServiceOrder>) => Promise<void>;
  initialOrder?: ServiceOrder | null;
  initialQuote?: AdminQuote | null;
  prefillClientAndVehicle?: ServiceOrder | null;
  userRole?: UserRole;
}

const QUICK_SERVICE_CATALOG: Array<{
  type: 'SERVICE' | 'PART';
  label: string;
  description: string;
  price: number;
}> = [
  {
    type: 'SERVICE',
    label: '+ Remap Stage 1',
    description: 'Calibração Eletrônica de ECU Stage 1 Custom em Dinamômetro',
    price: 2400
  },
  {
    type: 'SERVICE',
    label: '+ Remap Stage 2',
    description: 'Calibração de ECU Stage 2 Custom + Acerto em Dinamômetro Servitec 4x4',
    price: 3500
  },
  {
    type: 'SERVICE',
    label: '+ Mapa Câmbio TCU',
    description: 'Reprogramação de Câmbio (TCU DSG / ZF8 / PDK) - Trocas Rápidas & Launch Control',
    price: 1900
  },
  {
    type: 'SERVICE',
    label: '+ Passagem Dinô 4x4',
    description: 'Aferição Técnica de Potência (WHP) e Torque em Dinamômetro 4x4 com Laudo',
    price: 850
  },
  {
    type: 'SERVICE',
    label: '+ Instalação Hardware',
    description: 'Mão de Obra de Instalação de Downpipe, Intake e Revisão de Pressurização',
    price: 950
  },
  {
    type: 'SERVICE',
    label: '+ Revisão Track Day',
    description: 'Revisão Geral de Performance, Scanner OBD-II e Sangria de Freios Racing',
    price: 780
  },
  {
    type: 'PART',
    label: '+ Downpipe Inox 304',
    description: 'Downpipe 3" em Aço Inox 304 com Isolamento Térmico Solda TIG',
    price: 2100
  },
  {
    type: 'PART',
    label: '+ Jogo Velas Grau 9',
    description: 'Jogo de Velas Iridium Racing Grau 9 (Gap Calibrado)',
    price: 980
  },
  {
    type: 'PART',
    label: '+ Óleo Motul + Filtro',
    description: 'Kit Óleo 100% Sintético Motul 8100 5W40 + Filtro OEM',
    price: 890
  },
  {
    type: 'PART',
    label: '+ Fluido Motul RBF 660',
    description: 'Fluido de Freio de Alta Temperatura Motul RBF 660 Factory Line',
    price: 380
  }
];

const POPULAR_VEHICLES = [
  { model: 'VW Golf GTI MK7 2.0 TSI', brand: 'Volkswagen', fuel: 'Gasolina Podium' },
  { model: 'VW Jetta GLI 350 TSI', brand: 'Volkswagen', fuel: 'Gasolina Podium' },
  { model: 'BMW M2 Competition (S55)', brand: 'BMW', fuel: 'Etanol E85 / Podium' },
  { model: 'BMW 320i G20 2.0 TwinPower', brand: 'BMW', fuel: 'Gasolina Podium' },
  { model: 'Audi RS3 2.5 TFSI (DAZA)', brand: 'Audi', fuel: 'Etanol E85 / Podium' },
  { model: 'Audi A3 Sedan 2.0 TFSI', brand: 'Audi', fuel: 'Gasolina Podium' },
  { model: 'Porsche 911 Carrera S (992)', brand: 'Porsche', fuel: 'Gasolina Podium' }
];

export function OrderFormModal({
  isOpen,
  onClose,
  onSave,
  initialOrder,
  initialQuote,
  prefillClientAndVehicle,
  userRole = 'DIRECTOR'
}: OrderFormModalProps) {
  const sourceOrder = initialOrder || prefillClientAndVehicle;
  const isOperator = userRole === 'OPERATOR';

  // Modo simplificado por padrão na abertura de nova OS para agilizar o preenchimento!
  const [showAdvancedFields, setShowAdvancedFields] = useState<boolean>(Boolean(initialOrder));
  const [existingOrders, setExistingOrders] = useState<ServiceOrder[]>([]);

  const [clientName, setClientName] = useState(
    sourceOrder?.client.name || initialQuote?.name || ''
  );
  const [clientDoc, setClientDoc] = useState(sourceOrder?.client.document || '');
  const [clientPhone, setClientPhone] = useState(
    sourceOrder?.client.phone || initialQuote?.phone || ''
  );
  const [clientEmail, setClientEmail] = useState(
    sourceOrder?.client.email || initialQuote?.email || ''
  );
  const [clientCity, setClientCity] = useState(sourceOrder?.client.city || 'Joinville / SC');
  const [clientAddress, setClientAddress] = useState(sourceOrder?.client.address || '');

  const [vehicleModel, setVehicleModel] = useState(
    sourceOrder?.vehicle.model || initialQuote?.vehicle || ''
  );
  const [vehicleBrand, setVehicleBrand] = useState(sourceOrder?.vehicle.brand || '');
  const [vehiclePlate, setVehiclePlate] = useState(sourceOrder?.vehicle.plate || '');
  const [vehicleYear, setVehicleYear] = useState(sourceOrder?.vehicle.year || '');
  const [vehicleMileage, setVehicleMileage] = useState(sourceOrder?.vehicle.mileage || '');
  const [vehicleFuel, setVehicleFuel] = useState(
    sourceOrder?.vehicle.fuel || 'Gasolina Podium'
  );
  const [vehicleSetup, setVehicleSetup] = useState(
    sourceOrder?.vehicle.currentSetup || initialQuote?.message || ''
  );

  // Campos operacionais de pátio
  const [leadOperator, setLeadOperator] = useState(
    initialOrder?.leadOperator || 'Lucas M. // Operador Chefe'
  );
  const [boxRamp, setBoxRamp] = useState(
    initialOrder?.boxRamp || 'Rampa 01 - Recepção & Diagnóstico'
  );
  const [fuelLevelEntry, setFuelLevelEntry] = useState<'RESERVA' | '1/4' | '1/2' | '3/4' | 'CHEIO'>(
    initialOrder?.checklist?.fuelLevelEntry || '1/2'
  );
  const [bodyworkNotes, setBodyworkNotes] = useState(
    initialOrder?.checklist?.bodyworkNotes || 'Sem avarias aparentes na recepção'
  );

  const [dynoBeforeHp, setDynoBeforeHp] = useState<number | ''>(
    initialOrder?.dynoTelemetry?.beforeHp || ''
  );
  const [dynoAfterHp, setDynoAfterHp] = useState<number | ''>(
    initialOrder?.dynoTelemetry?.afterHp || ''
  );
  const [dynoBeforeTorque, setDynoBeforeTorque] = useState<number | ''>(
    initialOrder?.dynoTelemetry?.beforeTorque || ''
  );
  const [dynoAfterTorque, setDynoAfterTorque] = useState<number | ''>(
    initialOrder?.dynoTelemetry?.afterTorque || ''
  );
  const [dynoBoost, setDynoBoost] = useState<number | ''>(
    initialOrder?.dynoTelemetry?.boostPressure || ''
  );
  const [dynoTuner, setDynoTuner] = useState(
    initialOrder?.dynoTelemetry?.tuner || 'Gabriel Lemke // 63 Motorsport Lab'
  );

  const [status, setStatus] = useState<OrderStatus>(initialOrder?.status || 'IN_PROGRESS');
  const [paymentMethod, setPaymentMethod] = useState(
    initialOrder?.paymentMethod || 'Pix à vista (5% de desconto)'
  );
  const [discount, setDiscount] = useState<number>(initialOrder?.discount || 0);
  const [notes, setNotes] = useState(initialOrder?.notes || '');
  const [warrantyTerms, setWarrantyTerms] = useState(
    initialOrder?.warrantyTerms ||
      'Garantia de 90 dias ou 5.000 km sobre os serviços de calibração eletrônica e montagem mecânica 63 Motorsport. A garantia exige o uso de combustível de procedência (Podium / Octapro / Etanol puro) e óleo 100% sintético de alta performance.'
  );

  // Itens da OS
  const [items, setItems] = useState<OrderItem[]>(() => {
    if (initialOrder?.items && initialOrder.items.length > 0) {
      return initialOrder.items;
    }
    if (initialQuote) {
      return [
        {
          id: `item-${Date.now()}`,
          type: 'SERVICE',
          description: `Serviço de ${initialQuote.serviceLabel}`,
          quantity: 1,
          unitPrice: initialQuote.estimatedValue || 3500,
          totalPrice: initialQuote.estimatedValue || 3500,
          executed: false
        }
      ];
    }
    return [
      {
        id: `item-${Date.now()}`,
        type: 'SERVICE',
        description: 'Diagnóstico Técnico, Checklist Inicial e Preparação em Oficina',
        quantity: 1,
        unitPrice: isOperator ? 0 : 3200,
        totalPrice: isOperator ? 0 : 3200,
        executed: false
      }
    ];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega clientes/veículos anteriores para preenchimento em 1 clique
  useEffect(() => {
    if (!isOpen) return;
    serviceOrderApi
      .listOrders()
      .then((list) => {
        const uniqueByPlate = new Map<string, ServiceOrder>();
        for (const o of list) {
          const key = (o.vehicle.plate || o.client.name).toUpperCase();
          if (!uniqueByPlate.has(key)) {
            uniqueByPlate.set(key, o);
          }
        }
        setExistingOrders(Array.from(uniqueByPlate.values()));
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrefillFromHistory = (order: ServiceOrder) => {
    setClientName(order.client.name);
    setClientPhone(order.client.phone);
    setClientDoc(order.client.document || '');
    setClientEmail(order.client.email || '');
    setClientCity(order.client.city || 'Joinville / SC');
    setClientAddress(order.client.address || '');
    setVehicleModel(order.vehicle.model);
    setVehicleBrand(order.vehicle.brand || '');
    setVehiclePlate(order.vehicle.plate || '');
    setVehicleYear(order.vehicle.year || '');
    setVehicleMileage(order.checklist?.mileageExit || order.vehicle.mileage || '');
    setVehicleFuel(order.vehicle.fuel || 'Gasolina Podium');
    setVehicleSetup(order.vehicle.currentSetup || '');
  };

  const handleAddQuickCatalogItem = (preset: (typeof QUICK_SERVICE_CATALOG)[number]) => {
    const price = isOperator ? 0 : preset.price;
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: preset.type,
      description: preset.description,
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
      executed: false
    };
    setItems((prev) => {
      // Se o único item na lista for o placeholder padrão e ainda não foi editado, substitui
      if (
        prev.length === 1 &&
        prev[0].description === 'Diagnóstico Técnico, Checklist Inicial e Preparação em Oficina'
      ) {
        return [newItem];
      }
      return [...prev, newItem];
    });
  };

  const handleAddItem = (type: 'SERVICE' | 'PART') => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      executed: false
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = field === 'quantity' ? Number(value) : item.quantity;
          const u = field === 'unitPrice' ? Number(value) : item.unitPrice;
          updated.totalPrice = Math.max(0, q * u);
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotalServices = items
    .filter((i) => i.type === 'SERVICE')
    .reduce((acc, i) => acc + (i.totalPrice || 0), 0);
  const subtotalParts = items
    .filter((i) => i.type === 'PART')
    .reduce((acc, i) => acc + (i.totalPrice || 0), 0);
  const totalAmount = Math.max(0, subtotalServices + subtotalParts - (discount || 0));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseChecklist =
        initialOrder?.checklist || createDefaultChecklist(vehicleMileage, leadOperator);

      const cleanItems = items.map((item) => ({
        ...item,
        description:
          item.description.trim() ||
          (item.type === 'SERVICE' ? 'Serviço Técnico em Oficina' : 'Peça / Insumo Aplicado')
      }));

      const orderPayload: Partial<ServiceOrder> = {
        status,
        leadOperator,
        boxRamp,
        client: {
          name: clientName,
          document: clientDoc,
          phone: clientPhone,
          email: clientEmail,
          city: clientCity,
          address: clientAddress
        },
        vehicle: {
          model: vehicleModel,
          brand: vehicleBrand,
          plate: vehiclePlate,
          year: vehicleYear,
          mileage: vehicleMileage,
          fuel: vehicleFuel,
          currentSetup: vehicleSetup
        },
        checklist: {
          ...baseChecklist,
          mileageEntry: vehicleMileage || baseChecklist.mileageEntry,
          fuelLevelEntry,
          bodyworkNotes
        },
        dynoTelemetry: {
          beforeHp: dynoBeforeHp === '' ? undefined : Number(dynoBeforeHp),
          afterHp: dynoAfterHp === '' ? undefined : Number(dynoAfterHp),
          beforeTorque: dynoBeforeTorque === '' ? undefined : Number(dynoBeforeTorque),
          afterTorque: dynoAfterTorque === '' ? undefined : Number(dynoAfterTorque),
          boostPressure: dynoBoost === '' ? undefined : Number(dynoBoost),
          tuner: dynoTuner
        },
        items: cleanItems,
        subtotalServices,
        subtotalParts,
        discount: Number(discount) || 0,
        totalAmount,
        paymentMethod,
        warrantyTerms,
        notes,
        quoteId: initialQuote?.id || initialOrder?.quoteId
      };

      await onSave(orderPayload);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar OS:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6">
      <div className="bg-[#12141A] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[93vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#161922] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/15 text-red-500 border border-red-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-['Montserrat']">
                {initialOrder
                  ? `Editar ${initialOrder.osNumber}`
                  : prefillClientAndVehicle
                  ? `Nova Passagem: ${prefillClientAndVehicle.vehicle.model}`
                  : 'Check-in Rápido de Veículo / Nova OS'}
              </h2>
              <p className="text-xs text-slate-400">
                {initialQuote
                  ? `Importando dados do orçamento de ${initialQuote.name}`
                  : 'Preencha apenas os dados principais ou clique em um cliente/serviço abaixo para preencher em 1 toque'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* BARRA DE PREENCHIMENTO EM 1 CLIQUE (CLIENTES RECORRENTES) */}
          {!initialOrder && existingOrders.length > 0 && (
            <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  Cliente ou Carro já veio na 63? Clique para puxar todos os dados em 1 segundo:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {existingOrders.map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => handlePrefillFromHistory(ord)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D1017] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-xs text-slate-200 transition-all"
                  >
                    <span className="font-mono font-bold text-amber-400">
                      {ord.vehicle.plate || 'S/PLACA'}
                    </span>
                    <span className="font-bold text-white">{ord.vehicle.model}</span>
                    <span className="text-slate-400">({ord.client.name})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO 1: IDENTIFICAÇÃO RÁPIDA (CARRO + CLIENTE + RAMPA) */}
          <div className="bg-[#161820] border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <Car className="w-4 h-4" />
                1. Identificação Essencial (Veículo, Cliente & Alocação no Pátio)
              </h3>

              {/* Atalhos de Modelos Frequentes */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[10px] font-mono text-slate-500 uppercase mr-1 shrink-0">
                  Modelos rápidos:
                </span>
                {POPULAR_VEHICLES.slice(0, 4).map((v) => (
                  <button
                    key={v.model}
                    type="button"
                    onClick={() => {
                      setVehicleModel(v.model);
                      setVehicleBrand(v.brand);
                      setVehicleFuel(v.fuel);
                    }}
                    className="px-2 py-0.5 rounded bg-[#0D0E12] hover:bg-red-600/20 border border-white/10 text-[10px] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
                  >
                    {v.model.split(' ').slice(0, 3).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Placa */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-amber-400 uppercase mb-1">
                  Placa do Carro *
                </label>
                <input
                  type="text"
                  required
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  placeholder="BRA-2E19"
                  className="w-full bg-[#0D0E12] border border-amber-500/30 rounded-lg px-3 py-2 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-400 font-mono uppercase tracking-wider"
                />
              </div>

              {/* Modelo */}
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Modelo & Motorização *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Ex: Golf GTI MK7 2.0 TSI"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                />
              </div>

              {/* Km de Entrada */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Km Entrada
                </label>
                <input
                  type="text"
                  value={vehicleMileage}
                  onChange={(e) => setVehicleMileage(e.target.value)}
                  placeholder="68.400 km"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              {/* Nível de Tanque */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Tanque Entrada
                </label>
                <select
                  value={fuelLevelEntry}
                  onChange={(e) => setFuelLevelEntry(e.target.value as any)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white font-mono"
                >
                  <option value="RESERVA">Reserva</option>
                  <option value="1/4">1/4 Tanque</option>
                  <option value="1/2">1/2 Tanque</option>
                  <option value="3/4">3/4 Tanque</option>
                  <option value="CHEIO">Cheio (100%)</option>
                </select>
              </div>

              {/* Nome do Cliente */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Nome do Proprietário / Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Rodrigo Alcantara"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* WhatsApp */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  WhatsApp / Telefone *
                </label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(47) 99882-1455"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              {/* Box / Rampa */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Box / Rampa Alocada
                </label>
                <select
                  value={boxRamp}
                  onChange={(e) => setBoxRamp(e.target.value)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-emerald-400 font-semibold"
                >
                  <option value="Rampa 01 - Recepção & Diagnóstico">Rampa 01 - Recepção & Diagnóstico</option>
                  <option value="Rampa 02 - Preparação Turbo & Motor">Rampa 02 - Preparação Turbo & Motor</option>
                  <option value="Box 03 - Dinamômetro Servitec 4x4">Box 03 - Dinamômetro Servitec 4x4</option>
                  <option value="Rampa 04 - Freios & Suspensão">Rampa 04 - Freios & Suspensão</option>
                </select>
              </div>

              {/* Operador Responsável */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Mecânico Líder
                </label>
                <select
                  value={leadOperator}
                  onChange={(e) => setLeadOperator(e.target.value)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white"
                >
                  <option value="Lucas M. // Mecânico Chefe">Lucas M. (Chefe)</option>
                  <option value="Gabriel Lemke // Tunner & Diretoria">Gabriel Lemke (Dyno)</option>
                  <option value="Rafael T. // Especialista Motor">Rafael T. (Motor)</option>
                  <option value="Equipe 63 Motorsport">Equipe 63</option>
                </select>
              </div>

              {/* Setup / Queixa ou Pedido Inicial */}
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Setup Atual do Carro / Queixa ou Pedido Inicial
                </label>
                <input
                  type="text"
                  value={vehicleSetup}
                  onChange={(e) => setVehicleSetup(e.target.value)}
                  placeholder="Ex: Já possui Intake e Downpipe, veio para acerto Stage 2 e revisão de velas"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Estado Visual na Recepção */}
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Estado da Lataria / Rodas na Entrada
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={bodyworkNotes}
                    onChange={(e) => setBodyworkNotes(e.target.value)}
                    placeholder="Ex: Sem avarias aparentes na recepção"
                    className="flex-1 bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setBodyworkNotes('100% íntegro, sem riscos ou avarias externas')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase shrink-0"
                  >
                    100% OK
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: SERVIÇOS E PEÇAS COM CATÁLOGO DE 1 TOQUE */}
          <div className="bg-[#161820] border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  2. O que será feito no carro (Clique nos atalhos para adicionar sem digitar)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddItem('SERVICE')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase text-white bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Linha Serviço
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('PART')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase text-slate-200 bg-[#242834] hover:bg-[#2e3342] border border-white/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Linha Peça
                </button>
              </div>
            </div>

            {/* Botões de 1 Clique do Catálogo 63 Motorsport */}
            <div className="p-3 rounded-xl bg-[#0D0F14] border border-white/5 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-red-400" />
                Adição Rápida em 1 Toque (Catálogo 63 Motorsport):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SERVICE_CATALOG.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAddQuickCatalogItem(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                      preset.type === 'SERVICE'
                        ? 'bg-red-600/10 hover:bg-red-600/25 text-red-300 border-red-500/25'
                        : 'bg-blue-600/10 hover:bg-blue-600/25 text-blue-300 border-blue-500/25'
                    }`}
                  >
                    {preset.label}
                    {!isOperator && (
                      <span className="ml-1.5 opacity-75 font-mono text-[10px]">
                        R$ {preset.price}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-[#0F1116] border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                >
                  <span className="font-mono text-xs text-slate-500 shrink-0 w-6">
                    #{index + 1}
                  </span>

                  <select
                    value={item.type}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'type', e.target.value as 'SERVICE' | 'PART')
                    }
                    className="bg-[#1A1D26] text-[11px] font-bold rounded-lg px-2 py-1.5 text-slate-300 border border-white/10 shrink-0"
                  >
                    <option value="SERVICE">Serviço</option>
                    <option value="PART">Peça / Insumo</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="Descreva o serviço ou peça..."
                    className="flex-1 bg-[#1A1D26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                        className="w-full bg-[#1A1D26] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-center text-white font-mono"
                        placeholder="Qtd"
                      />
                    </div>

                    {!isOperator && (
                      <>
                        <div className="w-28">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                            className="w-full bg-[#1A1D26] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-right text-white font-mono"
                            placeholder="Unitário (R$)"
                          />
                        </div>

                        <div className="w-24 text-right font-mono text-xs font-bold text-emerald-400">
                          R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTÃO EXPANSÍVEL PARA CAMPOS COMPLEMENTARES (TELEMETRIA DINÔ, CPF, PAGAMENTO, GARANTIA) */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedFields((prev) => !prev)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#171A24] hover:bg-[#1E2230] border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between transition-colors"
            >
              <span>
                {showAdvancedFields
                  ? 'Ocultar Campos Complementares (Telemetria Dinamômetro, CPF/Endereço, Pagamento e Garantia)'
                  : '+ Preencher Telemetria de Dinamômetro (WHP/Torque), CPF, Forma de Pagamento ou Observações'}
              </span>
              {showAdvancedFields ? (
                <ChevronUp className="w-4 h-4 text-red-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-red-400" />
              )}
            </button>

            {showAdvancedFields && (
              <div className="mt-4 space-y-4">
                {/* Telemetria de Dinamômetro Servitec */}
                <div className="bg-[#161820] border border-white/5 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
                    3. Telemetria de Dinamômetro Servitec 4x4 (Antes vs. Depois)
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        HP Original (WHP)
                      </label>
                      <input
                        type="number"
                        value={dynoBeforeHp}
                        onChange={(e) =>
                          setDynoBeforeHp(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Ex: 220"
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        HP Calibrado (WHP)
                      </label>
                      <input
                        type="number"
                        value={dynoAfterHp}
                        onChange={(e) =>
                          setDynoAfterHp(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Ex: 330"
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-red-400 font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Torque Orig. (kgfm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={dynoBeforeTorque}
                        onChange={(e) =>
                          setDynoBeforeTorque(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Ex: 35.0"
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Torque Final (kgfm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={dynoAfterTorque}
                        onChange={(e) =>
                          setDynoAfterTorque(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Ex: 49.8"
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Pressão Turbo (bar)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={dynoBoost}
                        onChange={(e) =>
                          setDynoBoost(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Ex: 1.65"
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Preparador
                      </label>
                      <input
                        type="text"
                        value={dynoTuner}
                        onChange={(e) => setDynoTuner(e.target.value)}
                        placeholder="Gabriel Lemke"
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados Complementares do Cliente e Veículo + Comercial */}
                <div className="bg-[#161820] border border-white/5 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
                    4. Dados Complementares, Pagamento & Termos de Garantia
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        CPF ou CNPJ
                      </label>
                      <input
                        type="text"
                        value={clientDoc}
                        onChange={(e) => setClientDoc(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Cidade / UF
                      </label>
                      <input
                        type="text"
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        placeholder="Joinville / SC"
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Ano do Veículo
                      </label>
                      <input
                        type="text"
                        value={vehicleYear}
                        onChange={(e) => setVehicleYear(e.target.value)}
                        placeholder="2020/2021"
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Combustível
                      </label>
                      <select
                        value={vehicleFuel}
                        onChange={(e) => setVehicleFuel(e.target.value)}
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        <option value="Gasolina Podium">Gasolina Podium / Octapro</option>
                        <option value="Etanol E85">Etanol E85 / Puro</option>
                        <option value="Gasolina Comum">Gasolina Comum</option>
                        <option value="Metanol">Metanol</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Status da OS
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as OrderStatus)}
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-bold"
                      >
                        <option value="IN_PROGRESS">Em Execução na Oficina</option>
                        <option value="WAITING_PARTS">Aguardando Peças</option>
                        <option value="COMPLETED">Concluído & Aferido</option>
                        <option value="DELIVERED">Entregue ao Cliente</option>
                        <option value="DRAFT">Rascunho</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                    </div>

                    {!isOperator && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Forma de Pagamento
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                          >
                            <option value="Pix à vista (5% de desconto)">Pix à vista (5% de desconto)</option>
                            <option value="Cartão de Crédito até 6x">Cartão de Crédito até 6x</option>
                            <option value="Cartão de Crédito até 12x">Cartão de Crédito até 12x</option>
                            <option value="50% Entrada + 50% na Entrega">50% Entrada + 50% na Entrega</option>
                            <option value="Transferência / TED">Transferência / TED</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Desconto (R$)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>
                      </>
                    )}

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Observações Técnicas / Recomendações no Laudo
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex: Veículo entregue revisado e aferido no dinamômetro Servitec 4x4..."
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Termo de Garantia
                      </label>
                      <textarea
                        rows={2}
                        value={warrantyTerms}
                        onChange={(e) => setWarrantyTerms(e.target.value)}
                        className="w-full bg-[#0D0E12] border border-white/10 rounded-lg p-2.5 text-xs text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumo no Rodapé do Form */}
          <div className="bg-[#1C1F28] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {!isOperator ? (
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Serviços</span>
                  <span className="font-mono font-bold text-slate-200">
                    R$ {subtotalServices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Peças</span>
                  <span className="font-mono font-bold text-slate-200">
                    R$ {subtotalParts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {discount > 0 && (
                  <div>
                    <span className="text-emerald-400 block text-[10px] uppercase">Desconto</span>
                    <span className="font-mono font-bold text-emerald-400">
                      - R$ {Number(discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="border-l border-white/10 pl-4 sm:pl-8">
                  <span className="text-red-400 block text-[10px] uppercase font-bold">Total da OS</span>
                  <span className="font-mono text-lg font-black text-white">
                    R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Ao confirmar, o sistema abrirá direto o <strong className="text-white">Checklist de Entrada & Fotos</strong> deste veículo.
              </div>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Salvando...' : 'Salvar e Abrir Operação'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
