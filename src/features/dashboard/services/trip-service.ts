import { createClient } from '@/lib/supabase/client'

export interface TripFinancials {
    id: string;
    trip_date: string;
    plate: string;
    vehicle_alias?: string;
    status: string;
    fx_usd_to_cup: number;
    amount_currency: string;
    amount_value: number;
    income_usd_equiv: number;
    expenses_usd_equiv: number;
    driver_fee_usd_equiv: number;
    broker_fee_usd_equiv: number;
    profit_usd_equiv: number;
    partner_a_share_usd: number;
    partner_b_share_usd: number;
    km_recorridos?: number; // Calculado en BD (mileage_end - mileage_start)
    origin?: string;
    destination?: string;
    mileage_start?: number;
    mileage_end?: number;
    fuel_cost_usd?: number;
    fuel_yield_actual?: number;
    fuel_liters?: number;
    fuel_price_per_liter?: number;
    fuel_currency?: 'USD' | 'CUP';
    notes?: string;
}

export interface Vehicle {
    id: string;
    plate: string;
    alias?: string;
}

export interface TripExpense {
    id: string;
    trip_id: string;
    expense_type: 'fuel' | 'broker_fee' | 'driver_fee' | 'maintenance' | 'other';
    currency: 'USD' | 'CUP';
    amount: number;
    equivalent_usd: number;
    created_by_user_id: string;
    creado_en: string;
}

export type DashboardFilter = 'hoy' | 'mes' | 'todo';

export const tripService = {
    async getDashboardData(filter: DashboardFilter = 'todo'): Promise<{ trips: TripFinancials[], totals: { income: number, expenses: number, utility: number } }> {
        const supabase = createClient()

        const { data, error } = await supabase
            .rpc('get_dashboard_data_v2', { filter_type: filter })

        if (error) {
            console.error('Error fetching dashboard data:', error)
            return { trips: [], totals: { income: 0, expenses: 0, utility: 0 } }
        }

        // Parse JSON output when get_dashboard_data_v2 returns the function wrapper
        const parsed = (data as any)
        const mappedData = Object.keys(parsed || {}).includes('trips') ? parsed : (parsed?.[0]?.get_dashboard_data_v2 || { trips: [], totals: { income: 0, expenses: 0, utility: 0 } });

        return mappedData as { trips: TripFinancials[], totals: { income: number, expenses: number, utility: number } }
    },

    async getVehicles(): Promise<Vehicle[]> {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('plate', { ascending: true })

        if (error) {
            console.error('Error fetching vehicles:', error)
            return []
        }

        return data || []
    },

    // Devuelve la fecha actual del SERVIDOR (PostgreSQL CURRENT_DATE)
    // Evita bugs de timezone del navegador al inicializar el date picker
    async getServerDate(): Promise<string> {
        const supabase = createClient()
        const { data, error } = await supabase.rpc('get_server_date')
        if (error || !data) {
            console.error('Error fetching server date:', error)
            // Fallback seguro: fecha local del sistema (solo si la BD falla)
            return new Date().toLocaleDateString('en-CA')
        }
        return data as string
    },

    // Crea un viaje — toda la lógica (FX rate, user_id, status) resuelta en BD
    // El frontend solo envía los inputs del usuario, sin calcular nada
    async createTrip(tripData: {
        trip_date: string;
        plate_id: string;
        amount_currency: 'USD' | 'CUP';
        amount_value: number;
        origin?: string;
        destination?: string;
        mileage_start?: number;
    }) {
        const supabase = createClient()

        const { data, error } = await supabase.rpc('create_trip', {
            p_plate_id: tripData.plate_id,
            p_amount_currency: tripData.amount_currency,
            p_amount_value: tripData.amount_value,
            p_trip_date: tripData.trip_date,
            p_origin: tripData.origin ?? null,
            p_destination: tripData.destination ?? null,
            p_mileage_start: tripData.mileage_start ?? null,
        })

        if (error) throw error
        return data as string // uuid del viaje creado
    },

    // Detalle completo del viaje: financials + gastos — un solo RPC
    async getTripDetail(tripId: string): Promise<{ trip: TripFinancials, expenses: TripExpense[] } | null> {
        const supabase = createClient()
        const { data, error } = await supabase
            .rpc('get_trip_detail', { p_trip_id: tripId })

        if (error) {
            console.error('Error fetching trip detail:', error)
            return null
        }

        return data as unknown as { trip: TripFinancials, expenses: TripExpense[] }
    },

    // Cambia el estado del viaje — validaciones y auditoría en BD
    async updateTripStatus(tripId: string, newStatus: string, mileageEnd?: number): Promise<TripFinancials | null> {
        const supabase = createClient()
        const { data, error } = await supabase
            .rpc('update_trip_status', {
                p_trip_id: tripId,
                p_new_status: newStatus,
                p_mileage_end: mileageEnd ?? null,
            })

        if (error) throw error
        return data as unknown as TripFinancials
    },

    // Actualiza la tasa FX — BD recalcula todos los montos equiv automáticamente
    async updateTripFx(tripId: string, fxRate: number): Promise<TripFinancials | null> {
        const supabase = createClient()
        const { data, error } = await supabase
            .rpc('update_trip_fx', {
                p_trip_id: tripId,
                p_fx_rate: fxRate,
            })

        if (error) throw error
        return data as unknown as TripFinancials
    },

    // Mantenidos por compatibilidad (usan la vista directamente)
    async getTripById(tripId: string): Promise<TripFinancials | null> {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('trip_financials')
            .select('*')
            .eq('id', tripId)
            .single()

        if (error) return null
        return data
    },

    async getTripExpenses(tripId: string): Promise<TripExpense[]> {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('trip_expenses')
            .select('*')
            .eq('trip_id', tripId)
            .order('creado_en', { ascending: false })

        if (error) return []
        return data || []
    },

    // Actualiza detalles como combustible y notas
    async updateTripDetails(params: {
        tripId: string;
        fuelLiters: number;
        fuelPrice: number;
        fuelCurrency: 'USD' | 'CUP';
        notes: string;
    }): Promise<TripFinancials | null> {
        const supabase = createClient()
        const { data, error } = await supabase.rpc('update_trip_details', {
            p_trip_id: params.tripId,
            p_fuel_liters: params.fuelLiters,
            p_fuel_price: params.fuelPrice,
            p_fuel_currency: params.fuelCurrency,
            p_notes: params.notes,
        })

        if (error) throw error
        return data as unknown as TripFinancials
    }
}
