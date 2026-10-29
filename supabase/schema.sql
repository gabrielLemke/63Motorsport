-- ============================================================================
-- 63 MOTORSPORT // SUPABASE CLOUD SCHEMA (OPERAÇÃO, PÁTIO, CLIENTES, OS & LEADS)
-- Cole todo este script no menu "SQL Editor" do Supabase e clique em "Run"
-- ============================================================================

-- 1. TABELA DE ORÇAMENTOS / LEADS DO SITE (public.quotes)
CREATE TABLE IF NOT EXISTS public.quotes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  vehicle TEXT NOT NULL,
  service TEXT NOT NULL,
  service_label TEXT NOT NULL,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PENDING',
  estimated_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA DE ORDENS DE SERVIÇO, OPERAÇÃO, CHECKLIST, FOTOS & HISTÓRICO (public.service_orders)
CREATE TABLE IF NOT EXISTS public.service_orders (
  id TEXT PRIMARY KEY,
  os_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  operational_phase TEXT DEFAULT 'CHECKIN',
  lead_operator TEXT DEFAULT 'Equipe 63 Motorsport',
  box_ramp TEXT DEFAULT 'Rampa 01 - Recepção & Diagnóstico',
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_plate TEXT DEFAULT '',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  maintenance_started_at TIMESTAMPTZ DEFAULT NOW(),
  maintenance_completed_at TIMESTAMPTZ,
  delivery_date TIMESTAMPTZ,
  client JSONB NOT NULL DEFAULT '{}'::jsonb,
  vehicle JSONB NOT NULL DEFAULT '{}'::jsonb,
  dyno_telemetry JSONB DEFAULT '{}'::jsonb,
  checklist JSONB DEFAULT '{}'::jsonb,
  evidences JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_services NUMERIC NOT NULL DEFAULT 0,
  subtotal_parts NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'A Combinar',
  warranty_terms TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  quote_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA DE TELEMETRIA DE ACESSOS DO SITE (public.site_telemetry)
CREATE TABLE IF NOT EXISTS public.site_telemetry (
  id TEXT PRIMARY KEY DEFAULT 'main',
  total_accesses INTEGER NOT NULL DEFAULT 2340,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para busca ultra-rápida por Placa, Cliente, Nº da OS e Status
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON public.service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_plate ON public.service_orders(vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_service_orders_created_at ON public.service_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);

-- ============================================================================
-- PERMISSÕES E POLÍTICAS DE ACESSO (ROW LEVEL SECURITY - RLS)
-- Permite que o App PWA / Site (via Publishable Key) leia e grave em tempo real
-- ============================================================================

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_telemetry ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas caso o script seja executado mais de uma vez
DROP POLICY IF EXISTS "Acesso Total Quotes 63Motorsport" ON public.quotes;
DROP POLICY IF EXISTS "Acesso Total ServiceOrders 63Motorsport" ON public.service_orders;
DROP POLICY IF EXISTS "Acesso Total Telemetry 63Motorsport" ON public.site_telemetry;

CREATE POLICY "Acesso Total Quotes 63Motorsport"
  ON public.quotes
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso Total ServiceOrders 63Motorsport"
  ON public.service_orders
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso Total Telemetry 63Motorsport"
  ON public.site_telemetry
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON TABLE public.quotes TO anon, authenticated;
GRANT ALL ON TABLE public.service_orders TO anon, authenticated;
GRANT ALL ON TABLE public.site_telemetry TO anon, authenticated;

-- ============================================================================
-- DADOS INICIAIS DE TELEMETRIA E ORÇAMENTOS
-- ============================================================================

INSERT INTO public.site_telemetry (id, total_accesses)
VALUES ('main', 2340)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quotes (id, name, phone, email, vehicle, service, service_label, message, status, estimated_value, created_at)
VALUES
  (
    'lead-001',
    'Rodrigo Alcantara',
    '47998821455',
    'rodrigo.alcantara@gmail.com',
    'Golf GTI MK7 2.0 TSI (EA888.3)',
    'REMAP_STAGE2',
    'Remap Stage 2 Custom',
    'Já possuo intake e downpipe instalados, quero calibrar mapa de motor e pops no dinamômetro.',
    'SCHEDULED',
    4500,
    NOW() - INTERVAL '14 hours'
  ),
  (
    'lead-002',
    'Eduardo Silveira',
    '47991238877',
    'silveira.m2@outlook.com',
    'BMW M2 Competition (S55 Twin-Turbo)',
    'REMAP_STAGE3',
    'Remap Stage 3 + Turbinas Híbridas',
    'Comprei turbinas Pure Stage 2. Preciso de acerto fino no dinamômetro em Podium e E85.',
    'CONTACTED',
    18000,
    NOW() - INTERVAL '28 hours'
  ),
  (
    'lead-003',
    'Marcos Vinicius B.',
    '47984443322',
    'marcos.audi@terra.com.br',
    'Audi RS3 Sedan 2.5 TFSI (DAZA)',
    'DYNO_TUNING',
    'Passagem & Aferição em Dinamômetro',
    'Gostaria de agendar 3 puxadas no dinamômetro 4x4 Servitec com relatório impresso de WHP e torque.',
    'PENDING',
    850,
    NOW() - INTERVAL '4 hours'
  )
ON CONFLICT (id) DO NOTHING;
