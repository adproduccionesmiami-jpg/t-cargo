import { createClient } from '@/lib/supabase/client'

export interface TripFinancials {
    trip_id: string;
    trip_date: string;
    plate_number: string;
    status: string;
    fx_rate: number;
    total_income_cup: number;
    total_income_usd_equiv: number;
    total_expenses_usd_equiv: number;
    driver_fee_usd: number;
    broker_fee_usd: number;
    net_utility_usd: number;
    partner_share_usd: number;
}

export interface Vehicle {
    id: string;
    plate: string;
    alias?: string;
}

export type DashboardFilter = 'hoy' | 'mes' | 'todo';

export const tripService = {
    async getDashboardData(filter: DashboardFilter = 'todo'): Promise<TripFinancials[]> {
        const supabase = createClient()
        let query = supabase
            .from('trip_financials')
            .select('*')
            .order('trip_date', { ascending: false })

        const now = new Date()
        const today = now.toISOString().split('T')[0]

        if (filter === 'hoy') {
            query = query.eq('trip_date', today)
        } else if (filter === 'mes') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
            query = query.gte('trip_date', startOfMonth).lte('trip_date', today)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching dashboard data:', error)
            return []
        }

        return data || []
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
        mileage_start?: number;
        mileage_end?: number;
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
    }
}

