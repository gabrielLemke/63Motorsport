export type OrderStatus = 'DRAFT' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  type: 'SERVICE' | 'PART';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceOrder {
  id: string;
  osNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
  client: {
    name: string;
    document?: string;
    phone: string;
    email?: string;
    city?: string;
    address?: string;
  };
  vehicle: {
    model: string;
    brand?: string;
    plate?: string;
    year?: string;
    mileage?: string;
    fuel?: string;
    color?: string;
    engine?: string;
    currentSetup?: string;
  };
  dynoTelemetry?: {
    beforeHp?: number;
    afterHp?: number;
    beforeTorque?: number;
    afterTorque?: number;
    boostPressure?: number;
    tuner?: string;
  };
  items: OrderItem[];
  subtotalServices: number;
  subtotalParts: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  warrantyTerms: string;
  notes?: string;
  quoteId?: string;
}
