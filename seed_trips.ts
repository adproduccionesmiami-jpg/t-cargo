
import { createAdminClient } from './src/lib/supabase/admin'

async function run() {
    const supabase = createAdminClient()

    // 1. Get IDs
    const { data: vehicles } = await supabase.from('vehicles').select('*')
    const { data: users } = await supabase.from('app_users').select('*')

    if (!vehicles || vehicles.length === 0) {
        console.error('No vehicles found')
        return
    }

    if (!users || users.length === 0) {
        console.error('No users found')
        return
    }

    const plate_id = vehicles[0].id
    const user_id = users[0].id
    const today = new Date().toISOString().split('T')[0]

    const examples = [
        {
            trip_date: today,
            plate_id,
            origin: 'PUERTO MARIEL',
            destination: 'MIRAMAR, LA HABANA',
            amount_currency: 'CUP',
            amount_value: 250000,
            status: 'Completado',
            fx_usd_to_cup: 500,
            created_by_user_id: user_id
        },
        {
            trip_date: today,
            plate_id,
            origin: 'PUERTO MARIEL',
            destination: 'CARDENAS, MATANZAS',
            amount_currency: 'USD',
            amount_value: 1000,
            status: 'Completado',
            fx_usd_to_cup: 500,
            created_by_user_id: user_id
        },
        {
            trip_date: today,
            plate_id,
            origin: 'PUERTO MARIEL',
            destination: 'SANTA CLARA, VILLA CLARA',
            amount_currency: 'CUP',
            amount_value: 1500000,
            status: 'Completado',
            fx_usd_to_cup: 500,
            created_by_user_id: user_id
        },
        {
            trip_date: today,
            plate_id,
            origin: 'PUERTO MARIEL',
            destination: 'HOLGUÍN',
            amount_currency: 'CUP',
            amount_value: 3000000,
            status: 'Completado',
            fx_usd_to_cup: 500,
            created_by_user_id: user_id
        }
    ]

    console.log('Inserting trips...')
    const { data, error } = await supabase.from('trips').insert(examples).select()

    if (error) {
        console.error('Error inserting trips:', error)
    } else {
        console.log('Successfully inserted 4 trips')
        console.log(data)
    }
}

run()
