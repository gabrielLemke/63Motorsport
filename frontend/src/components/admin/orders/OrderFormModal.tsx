import { useState, type FormEvent } from 'react';
import {
  X,
  Plus,
  Trash2,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { ServiceOrder, OrderItem, OrderStatus, createDefaultChecklist } from '../../../types/serviceOrder';
import { AdminQuote, UserRole } from '../../../types/admin';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Partial<ServiceOrder>) => Promise<void>;
  initialOrder?: ServiceOrder | null;
  initialQuote?: AdminQuote | null;
  prefillClientAndVehicle?: ServiceOrder | null;
  userRole?: UserRole;
}

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

  if (!isOpen) return null;

  const handleAddItem = (type: 'SERVICE' | 'PART') => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      description: type === 'SERVICE' ? 'Novo Serviço de Preparação' : 'Nova Peça / Insumo Racing',
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
        items,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#12141A] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#161922] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-['Montserrat']">
                {initialOrder
                  ? `Editar ${initialOrder.osNumber}`
                  : prefillClientAndVehicle
                  ? `Nova Manutenção para ${prefillClientAndVehicle.vehicle.model}`
                  : 'Receber Veículo / Nova Ordem de Serviço'}
              </h2>
              <p className="text-xs text-slate-400">
                {initialQuote
                  ? `Gerando OS a partir do orçamento de ${initialQuote.name}`
                  : 'Cadastro de cliente, carro, recepção no pátio, serviços e histórico técnico'}
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

        {/* Modal Body: Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Seção 1: Dados do Cliente */}
          <div className="bg-[#161820] border border-white/5 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
              1. Dados do Proprietário / Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Nome Completo *
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

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Telefone / WhatsApp *
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

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  value={clientDoc}
                  onChange={(e) => setClientDoc(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
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
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Rua, Número - Bairro"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Dados do Veículo & Check-in Operacional */}
          <div className="bg-[#161820] border border-white/5 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
              2. Dados do Veículo, Check-in de Entrada & Rampa
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Modelo do Veículo *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Ex: Golf GTI MK7 2.0 TSI"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Marca / Montadora
                </label>
                <input
                  type="text"
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                  placeholder="Volkswagen, BMW..."
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Placa
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  placeholder="BRA-2E19"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Ano / Modelo
                </label>
                <input
                  type="text"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  placeholder="2019/2019"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Km de Entrada
                </label>
                <input
                  type="text"
                  value={vehicleMileage}
                  onChange={(e) => setVehicleMileage(e.target.value)}
                  placeholder="68.000 km"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Nível Tanque (Entrada)
                </label>
                <select
                  value={fuelLevelEntry}
                  onChange={(e) => setFuelLevelEntry(e.target.value as any)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="RESERVA">Reserva</option>
                  <option value="1/4">1/4 de Tanque</option>
                  <option value="1/2">1/2 Tanque</option>
                  <option value="3/4">3/4 de Tanque</option>
                  <option value="CHEIO">Tanque Cheio</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Combustível no Tanque
                </label>
                <select
                  value={vehicleFuel}
                  onChange={(e) => setVehicleFuel(e.target.value)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Gasolina Podium">Gasolina Podium / Octapro</option>
                  <option value="Etanol E85">Etanol E85 / Puro</option>
                  <option value="Gasolina Comum">Gasolina Comum</option>
                  <option value="Metanol">Metanol</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Box / Rampa de Operação
                </label>
                <select
                  value={boxRamp}
                  onChange={(e) => setBoxRamp(e.target.value)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Rampa 01 - Recepção & Diagnóstico">Rampa 01 - Recepção & Diagnóstico</option>
                  <option value="Rampa 02 - Preparação Turbo & Motor">Rampa 02 - Preparação Turbo & Motor</option>
                  <option value="Box 03 - Dinamômetro Servitec 4x4">Box 03 - Dinamômetro Servitec 4x4</option>
                  <option value="Rampa 04 - Freios & Suspensão">Rampa 04 - Freios & Suspensão</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Operador / Mecânico Responsável
                </label>
                <input
                  type="text"
                  value={leadOperator}
                  onChange={(e) => setLeadOperator(e.target.value)}
                  placeholder="Ex: Lucas M. // Mecânico Chefe"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Setup Atual / Peças Instaladas
                </label>
                <input
                  type="text"
                  value={vehicleSetup}
                  onChange={(e) => setVehicleSetup(e.target.value)}
                  placeholder="Ex: Intake R600, Downpipe 3 polegadas, Intercooler"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Observação Inicial de Vistoria (Lataria / Rodas)
                </label>
                <input
                  type="text"
                  value={bodyworkNotes}
                  onChange={(e) => setBodyworkNotes(e.target.value)}
                  placeholder="Ex: Pintura íntegra, sem riscos aparentes na recepção"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Itens da OS (Mão de Obra e Peças) */}
          <div className="bg-[#161820] border border-white/5 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
                  3. Serviços a Executar / Peças Aplicadas no Carro
                </h3>
                <p className="text-[11px] text-slate-400">
                  Adicione as etapas de preparação mecânica, calibração eletrônica e peças racing
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddItem('SERVICE')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase text-white bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Serviço
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('PART')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase text-slate-200 bg-[#242834] hover:bg-[#2e3342] border border-white/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Peça
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#0F1116] border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3"
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
                    placeholder="Descrição do serviço ou peça"
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

                        <div className="w-28 text-right font-mono text-xs font-bold text-emerald-400">
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

          {/* Seção 4: Telemetria de Dinamômetro Servitec */}
          <div className="bg-[#161820] border border-white/5 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
              4. Telemetria de Dinamômetro Servitec 4x4 (Opcional)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  HP Original (WHP)
                </label>
                <input
                  type="number"
                  value={dynoBeforeHp}
                  onChange={(e) => setDynoBeforeHp(e.target.value === '' ? '' : Number(e.target.value))}
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
                  onChange={(e) => setDynoAfterHp(e.target.value === '' ? '' : Number(e.target.value))}
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
                  onChange={(e) => setDynoBeforeTorque(e.target.value === '' ? '' : Number(e.target.value))}
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
                  onChange={(e) => setDynoAfterTorque(e.target.value === '' ? '' : Number(e.target.value))}
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
                  onChange={(e) => setDynoBoost(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ex: 1.65"
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Preparador Responsável
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

          {/* Seção 5: Condições Comerciais, Status e Garantia */}
          <div className="bg-[#161820] border border-white/5 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
              5. Status Operacional & Observações Técnicas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Status da OS
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
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
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Forma de Pagamento
                    </label>
                    <input
                      type="text"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="Pix, Cartão 10x, 50% Entrada"
                      className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Desconto Concedido (R$)
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

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Observações Técnicas para o Cliente / Prontuário
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Veículo entregue higienizado e aferido no dinamômetro Servitec 4x4..."
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Termo de Garantia Oficial
                </label>
                <textarea
                  rows={2}
                  value={warrantyTerms}
                  onChange={(e) => setWarrantyTerms(e.target.value)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
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
                Após salvar, a tela de <strong className="text-white">Checklist de Entrada & Fotos de Evidência</strong> será aberta automaticamente.
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
