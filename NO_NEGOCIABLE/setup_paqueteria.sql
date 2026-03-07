-- 1. Table: deliveries
CREATE TABLE IF NOT EXISTS public.deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    delivery_date date NOT NULL,
    plate_id uuid NOT NULL REFERENCES public.vehicles(id),
    status text NOT NULL DEFAULT 'Programado',
    amount_currency text NOT NULL DEFAULT 'CUP',
    amount_value numeric NOT NULL DEFAULT 0,
    fx_usd_to_cup numeric DEFAULT 500,
    origin text,
    destination text,
    mileage_start numeric,
    mileage_end numeric,
    fuel_liters numeric,
    notes text,
    created_by_user_id uuid NOT NULL REFERENCES public.app_users(id),
    creado_en timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_en timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- RLS
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.deliveries FOR
SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.deliveries FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.deliveries FOR
UPDATE USING (auth.role() = 'authenticated');
-- 2. Table: delivery_expenses
CREATE TABLE IF NOT EXISTS public.delivery_expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    delivery_id uuid NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
    expense_type text NOT NULL,
    currency text NOT NULL,
    amount numeric NOT NULL,
    equivalent_usd numeric NOT NULL,
    created_by_user_id uuid NOT NULL REFERENCES public.app_users(id),
    creado_en timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- RLS
ALTER TABLE public.delivery_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.delivery_expenses FOR
SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.delivery_expenses FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.delivery_expenses FOR
UPDATE USING (auth.role() = 'authenticated');
-- 3. View: delivery_financials
CREATE OR REPLACE VIEW public.delivery_financials AS WITH delivery_base AS (
        SELECT d.id,
            d.delivery_date,
            d.plate_id,
            d.status,
            d.amount_currency,
            d.amount_value,
            d.fx_usd_to_cup,
            d.created_by_user_id,
            d.creado_en,
            d.actualizado_en,
            d.mileage_start,
            d.mileage_end,
            d.origin,
            d.destination,
            d.fuel_liters,
            d.notes,
            v.plate,
            CASE
                WHEN d.amount_currency = 'USD' THEN d.amount_value
                ELSE d.amount_value / NULLIF(d.fx_usd_to_cup, 0::numeric)
            END AS income_usd_equiv,
            GREATEST(
                0::numeric,
                COALESCE(d.mileage_end, d.mileage_start) - d.mileage_start
            ) * 1.609344 AS km_recorridos,
            CASE
                WHEN COALESCE(d.fuel_liters, 0::numeric) > 0::numeric THEN (
                    GREATEST(
                        0::numeric,
                        COALESCE(d.mileage_end, d.mileage_start) - d.mileage_start
                    ) * 1.609344
                ) / d.fuel_liters
                ELSE 0::numeric
            END AS fuel_yield_actual
        FROM deliveries d
            LEFT JOIN vehicles v ON d.plate_id = v.id
    ),
    expense_aggregation AS (
        SELECT de.delivery_id,
            sum(de.equivalent_usd) AS other_expenses_usd
        FROM delivery_expenses de
        GROUP BY de.delivery_id
    )
SELECT db.id,
    db.delivery_date,
    db.plate_id,
    db.status,
    db.amount_currency,
    db.amount_value,
    db.fx_usd_to_cup,
    db.created_by_user_id,
    db.creado_en,
    db.actualizado_en,
    db.mileage_start,
    db.mileage_end,
    db.origin,
    db.destination,
    db.fuel_liters,
    db.notes,
    db.plate,
    db.income_usd_equiv,
    db.km_recorridos,
    db.fuel_yield_actual,
    COALESCE(ea.other_expenses_usd, 0::numeric) AS expenses_usd_equiv,
    db.income_usd_equiv - COALESCE(ea.other_expenses_usd, 0::numeric) AS profit_usd_equiv,
    (
        db.income_usd_equiv - COALESCE(ea.other_expenses_usd, 0::numeric)
    ) / 2::numeric AS partner_a_share_usd,
    (
        db.income_usd_equiv - COALESCE(ea.other_expenses_usd, 0::numeric)
    ) / 2::numeric AS partner_b_share_usd
FROM delivery_base db
    LEFT JOIN expense_aggregation ea ON db.id = ea.delivery_id;
-- 4. Dashboard Summary Function
CREATE OR REPLACE FUNCTION public.get_delivery_dashboard_data(filter_type text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE deliveries_data jsonb;
summary_data jsonb;
local_today date;
BEGIN local_today := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Havana')::date;
IF filter_type = 'hoy' THEN
SELECT jsonb_agg(
        df
        ORDER BY delivery_date DESC,
            creado_en DESC
    ),
    jsonb_build_object(
        'income',
        COALESCE(SUM(income_usd_equiv), 0),
        'expenses',
        COALESCE(SUM(expenses_usd_equiv), 0),
        'utility',
        COALESCE(SUM(profit_usd_equiv), 0)
    ) INTO deliveries_data,
    summary_data
FROM delivery_financials df
WHERE delivery_date = local_today;
ELSIF filter_type = 'mes' THEN
SELECT jsonb_agg(
        df
        ORDER BY delivery_date DESC,
            creado_en DESC
    ),
    jsonb_build_object(
        'income',
        COALESCE(SUM(income_usd_equiv), 0),
        'expenses',
        COALESCE(SUM(expenses_usd_equiv), 0),
        'utility',
        COALESCE(SUM(profit_usd_equiv), 0)
    ) INTO deliveries_data,
    summary_data
FROM delivery_financials df
WHERE delivery_date >= date_trunc('month', local_today)::date
    AND delivery_date <= (
        date_trunc('month', local_today) + interval '1 month' - interval '1 day'
    )::date;
ELSE
SELECT jsonb_agg(
        df
        ORDER BY delivery_date DESC,
            creado_en DESC
    ),
    jsonb_build_object(
        'income',
        COALESCE(SUM(income_usd_equiv), 0),
        'expenses',
        COALESCE(SUM(expenses_usd_equiv), 0),
        'utility',
        COALESCE(SUM(profit_usd_equiv), 0)
    ) INTO deliveries_data,
    summary_data
FROM delivery_financials df;
END IF;
RETURN jsonb_build_object(
    'deliveries',
    COALESCE(deliveries_data, '[]'::jsonb),
    'totals',
    COALESCE(
        summary_data,
        '{"income": 0, "expenses": 0, "utility": 0}'::jsonb
    )
);
END;
$function$;
-- 5. Helper Function: Create Delivery
CREATE OR REPLACE FUNCTION public.create_delivery(
        p_plate_id uuid,
        p_amount_currency text,
        p_amount_value numeric,
        p_delivery_date date,
        p_origin text DEFAULT NULL,
        p_destination text DEFAULT NULL,
        p_mileage_start numeric DEFAULT NULL
    ) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE new_delivery_id uuid;
caller_id uuid;
BEGIN -- get user calling the function
caller_id := (
    SELECT id
    FROM public.app_users
    WHERE auth_user_id = auth.uid()
    LIMIT 1
);
IF caller_id IS NULL THEN RAISE EXCEPTION 'Usuario no autorizado o no encontrado en app_users';
END IF;
INSERT INTO public.deliveries (
        delivery_date,
        plate_id,
        amount_currency,
        amount_value,
        origin,
        destination,
        mileage_start,
        created_by_user_id,
        status,
        fx_usd_to_cup
    )
VALUES (
        p_delivery_date,
        p_plate_id,
        p_amount_currency,
        p_amount_value,
        p_origin,
        p_destination,
        p_mileage_start,
        caller_id,
        'Programado',
        500
    )
RETURNING id INTO new_delivery_id;
RETURN new_delivery_id;
END;
$function$;
-- 6. Helper Functions for Updates
CREATE OR REPLACE FUNCTION public.update_delivery_status(
        p_delivery_id uuid,
        p_new_status text,
        p_mileage_end numeric DEFAULT NULL
    ) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $function$ BEGIN
UPDATE public.deliveries
SET status = p_new_status,
    mileage_end = COALESCE(p_mileage_end, mileage_end),
    actualizado_en = now()
WHERE id = p_delivery_id;
RETURN (
    SELECT row_to_json(df)::jsonb
    FROM delivery_financials df
    WHERE id = p_delivery_id
);
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_delivery_fx(p_delivery_id uuid, p_fx_rate numeric) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $function$ BEGIN
UPDATE public.deliveries
SET fx_usd_to_cup = p_fx_rate,
    actualizado_en = now()
WHERE id = p_delivery_id;
RETURN (
    SELECT row_to_json(df)::jsonb
    FROM delivery_financials df
    WHERE id = p_delivery_id
);
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_delivery_details(
        p_delivery_id uuid,
        p_fuel_liters numeric,
        p_notes text
    ) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $function$ BEGIN
UPDATE public.deliveries
SET fuel_liters = p_fuel_liters,
    notes = p_notes,
    actualizado_en = now()
WHERE id = p_delivery_id;
RETURN (
    SELECT row_to_json(df)::jsonb
    FROM delivery_financials df
    WHERE id = p_delivery_id
);
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_delivery_detail(p_delivery_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE delivery_record jsonb;
expenses_array jsonb;
BEGIN
SELECT row_to_json(df)::jsonb INTO delivery_record
FROM delivery_financials df
WHERE id = p_delivery_id;
SELECT COALESCE(
        jsonb_agg(
            de
            ORDER BY creado_en DESC
        ),
        '[]'::jsonb
    ) INTO expenses_array
FROM delivery_expenses de
WHERE delivery_id = p_delivery_id;
RETURN jsonb_build_object(
    'delivery',
    delivery_record,
    'expenses',
    expenses_array
);
END;
$function$;