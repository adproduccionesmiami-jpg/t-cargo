'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { Vehicle } from '../services/trip-service'

export async function getVehiclesAction(): Promise<Vehicle[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('vehicles')
        .select('id, plate, alias')
        .order('plate', { ascending: true })

    if (error) {
        console.error('Error fetching vehicles with admin client:', error)
        return []
    }

    return data || []
}
