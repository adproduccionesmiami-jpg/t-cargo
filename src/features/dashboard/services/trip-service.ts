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

    async createTrip(tripData: {
        trip_date: string;
        plate_id: string;
        amount_currency: 'USD' | 'CUP';
        amount_value: number;
        status: string;
        origin?: string;
        destination?: string;
        mileage_start?: number;
        mileage_end?: number;
        created_by_user_id: string;
    }) {
        const supabase = createClient()

        // Get current FX rate (this is a bit simplified, usually you'd have a settings table)
        // For now, let's assume a default or fetch from the last trip
        const { data: lastTrip } = await supabase
            .from('trips')
            .select('fx_usd_to_cup')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        const fx_rate = lastTrip?.fx_usd_to_cup || 350 // Default fallback

        const { data, error } = await supabase
            .from('trips')
            .insert({
                ...tripData,
                fx_usd_to_cup: fx_rate
            })
            .select()

        if (error) throw error
        return data?.[0]
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

