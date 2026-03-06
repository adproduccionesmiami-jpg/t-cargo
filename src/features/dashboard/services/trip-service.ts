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
}

export interface Vehicle {
    id: string;
    plate: string;
    alias?: string;
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

    async getTripById(tripId: string): Promise<TripFinancials | null> {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('trip_financials')
            .select('*')
            .eq('id', tripId)
            .single()

        if (error) {
            console.error('Error fetching trip by ID:', error)
            return null
        }

        return data
    },

    async getTripExpenses(tripId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('trip_expenses')
            .select('*')
            .eq('trip_id', tripId)
            .order('creado_en', { ascending: false })

        if (error) {
            console.error('Error fetching trip expenses:', error)
            return []
        }

        return data
    }
}

