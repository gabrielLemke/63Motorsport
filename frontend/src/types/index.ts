export type ServiceType =
  | 'REMAP_STAGE1'
  | 'REMAP_STAGE2'
  | 'REMAP_STAGE3'
  | 'FORGED_ENGINE'
  | 'DYNO_TUNING'
  | 'TRACK_PREP'
  | 'MAINTENANCE'
  | 'OTHER';

export interface QuoteInput {
  name: string;
  phone: string;
  email?: string;
  vehicle: string;
  service: ServiceType;
  message?: string;
}

export interface QuoteResponse {
  statusCode: number;
  message: string;
  data: {
    quoteId: string | null;
    whatsappUrl: string;
    serviceLabel: string;
  };
}

export interface DynoProject {
  id: string;
  slug: string;
  title: string;
  vehicle: string;
  engine: string;
  stage: string;
  originalHp: number;
  originalTorque: number;
  tunedHp: number;
  tunedTorque: number;
  peakRpm: number;
  boostPressure: number;
  fuel: string;
  mods: string[];
  isFeatured: boolean;
}
