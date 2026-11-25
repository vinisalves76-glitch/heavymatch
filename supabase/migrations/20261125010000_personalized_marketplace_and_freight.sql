ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['buyer'::text, 'seller'::text, 'admin'::text, 'broker'::text]));

ALTER TABLE public.vehicles
  ADD COLUMN power_cv numeric(8,2),
  ADD COLUMN available_quantity integer NOT NULL DEFAULT 1;
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_power_cv_check CHECK (power_cv IS NULL OR (power_cv >= 0 AND power_cv <= 10000)),
  ADD CONSTRAINT vehicles_available_quantity_check CHECK (available_quantity >= 1 AND available_quantity <= 10000);

CREATE TABLE public.freight_driver_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('Caminhão', 'Cavalo mecânico')),
  axle_config text NOT NULL CHECK (axle_config IN ('4x2', '6x2', '6x4', '8x2', '8x4', '10x4', 'Outra configuração')),
  implement_type text NOT NULL CHECK (implement_type IN (
    'Basculante', 'Graneleira', 'Prancha', 'Baú', 'Sider', 'Tanque',
    'Frigorífica', 'Porta-contêiner', 'Cegonha', 'Florestal', 'Canavieira', 'Dolly', 'Outro implemento'
  )),
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, vehicle_type, axle_config, implement_type)
);
CREATE INDEX freight_driver_equipment_user_available_idx
  ON public.freight_driver_equipment (user_id, is_available, implement_type);

CREATE TABLE public.freight_loads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  origin_city text NOT NULL CHECK (length(btrim(origin_city)) BETWEEN 1 AND 100),
  origin_state text NOT NULL CHECK (length(btrim(origin_state)) BETWEEN 2 AND 40),
  destination_city text NOT NULL CHECK (length(btrim(destination_city)) BETWEEN 1 AND 100),
  destination_state text NOT NULL CHECK (length(btrim(destination_state)) BETWEEN 2 AND 40),
  cargo_description text NOT NULL CHECK (length(btrim(cargo_description)) BETWEEN 1 AND 240),
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('Caminhão', 'Cavalo mecânico', 'Indiferente')),
  axle_config text NOT NULL DEFAULT 'Indiferente'
    CHECK (axle_config IN ('4x2', '6x2', '6x4', '8x2', '8x4', '10x4', 'Outra configuração', 'Indiferente')),
  implement_type text NOT NULL CHECK (implement_type IN (
    'Basculante', 'Graneleira', 'Prancha', 'Baú', 'Sider', 'Tanque',
    'Frigorífica', 'Porta-contêiner', 'Cegonha', 'Florestal', 'Canavieira', 'Dolly', 'Outro implemento'
  )),
  loading_date date,
  quantity_total integer NOT NULL CHECK (quantity_total BETWEEN 1 AND 10000),
  freights_remaining integer NOT NULL CHECK (freights_remaining BETWEEN 0 AND quantity_total),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'closed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX freight_loads_status_slots_idx
  ON public.freight_loads (status, freights_remaining, created_at DESC);
CREATE INDEX freight_loads_broker_created_idx
  ON public.freight_loads (broker_id, created_at DESC);

CREATE TABLE public.freight_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id uuid NOT NULL REFERENCES public.freight_loads(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_equipment_id uuid NOT NULL REFERENCES public.freight_driver_equipment(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  responded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (load_id, driver_id)
);
CREATE INDEX freight_interests_load_status_created_idx
  ON public.freight_interests (load_id, status, created_at);
CREATE INDEX freight_interests_driver_created_idx
  ON public.freight_interests (driver_id, created_at DESC);

ALTER TABLE public.freight_driver_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freight_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freight_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY freight_driver_equipment_no_direct_client_access
  ON public.freight_driver_equipment FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
CREATE POLICY freight_loads_no_direct_client_access
  ON public.freight_loads FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
CREATE POLICY freight_interests_no_direct_client_access
  ON public.freight_interests FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

REVOKE ALL ON TABLE public.freight_driver_equipment, public.freight_loads, public.freight_interests
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.freight_driver_equipment, public.freight_loads, public.freight_interests
  TO service_role;

CREATE OR REPLACE FUNCTION public.respond_to_freight_interest(
  p_actor_id uuid,
  p_interest_id uuid,
  p_action text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role text;
  v_load public.freight_loads%ROWTYPE;
  v_interest public.freight_interests%ROWTYPE;
BEGIN
  SELECT p.role INTO v_role FROM public.profiles AS p WHERE p.id = p_actor_id;
  IF v_role IS NULL OR v_role NOT IN ('broker', 'admin') THEN
    RAISE EXCEPTION 'Acesso restrito ao agenciador.' USING ERRCODE = '42501';
  END IF;

  SELECT l.* INTO v_load
  FROM public.freight_loads AS l
  JOIN public.freight_interests AS i ON i.load_id = l.id
  WHERE i.id = p_interest_id
  FOR UPDATE OF l;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Interesse não encontrado.' USING ERRCODE = 'P0002';
  END IF;
  IF v_role <> 'admin' AND v_load.broker_id <> p_actor_id THEN
    RAISE EXCEPTION 'Você não pode gerenciar esta carga.' USING ERRCODE = '42501';
  END IF;

  SELECT i.* INTO v_interest
  FROM public.freight_interests AS i
  WHERE i.id = p_interest_id
  FOR UPDATE;
  IF v_interest.status <> 'pending' THEN
    RAISE EXCEPTION 'Este interesse já foi respondido.' USING ERRCODE = 'P0001';
  END IF;

  IF p_action = 'approve' THEN
    IF v_load.status <> 'open' OR v_load.freights_remaining < 1 THEN
      RAISE EXCEPTION 'Não há fretes disponíveis para aprovar.' USING ERRCODE = 'P0001';
    END IF;
    UPDATE public.freight_interests
      SET status = 'approved', responded_at = now(), responded_by = p_actor_id
      WHERE id = p_interest_id;
    UPDATE public.freight_loads
      SET freights_remaining = freights_remaining - 1,
          status = CASE WHEN freights_remaining - 1 = 0 THEN 'filled' ELSE 'open' END,
          updated_at = now()
      WHERE id = v_load.id;
  ELSIF p_action = 'reject' THEN
    UPDATE public.freight_interests
      SET status = 'rejected', responded_at = now(), responded_by = p_actor_id
      WHERE id = p_interest_id;
  ELSE
    RAISE EXCEPTION 'Ação inválida.' USING ERRCODE = '22023';
  END IF;

  RETURN jsonb_build_object(
    'status', p_action,
    'freights_remaining', CASE WHEN p_action = 'approve' THEN v_load.freights_remaining - 1 ELSE v_load.freights_remaining END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.respond_to_freight_interest(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_freight_interest(uuid, uuid, text) TO service_role;