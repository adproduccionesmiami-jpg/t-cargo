import { createClient } from '@/lib/supabase/client'

export interface DeliveryFinancials {
    id: string;
    delivery_date: string;
    plate: string;
    status: string;
    fx_usd_to_cup: number;
    amount_currency: string;
    amount_value: number;
    income_usd_equiv: number;
    expenses_usd_equiv: number;
    profit_usd_equiv: number;
    partner_a_share_usd: number;
    partner_b_share_usd: number;
    km_recorridos?: number;
    origin?: string;
    destination?: string;
    mileage_start?: number;
    mileage_end?: number;
    fuel_yield_actual?: number;
    fuel_liters?: number;
    notes?: string;
}

export interface Vehicle {
    id: string;
    plate: string;
    alias?: string;
}

export interface DeliveryExpense {
    id: string;
    delivery_id: string;
    expense_type: string;
    currency: 'USD' | 'CUP';
    amount: number;
    equivalent_usd: number;
    created_by_user_id: string;
    creado_en: string;
}

export type DashboardFilter = 'hoy' | 'mes' | 'todo';

export const deliveryService = {
    async getDashboardData(filter: DashboardFilter = 'todo'): Promise<{ deliveries: DeliveryFinancials[], totals: { income: number, expenses: number, utility: number } }> {
        const supabase = createClient()

        const { data, error } = await supabase
            .rpc('get_delivery_dashboard_data', { filter_type: filter })

        if (error) {
            console.error('Error fetching delivery dashboard data:', error)
            return { deliveries: [], totals: { income: 0, expenses: 0, utility: 0 } }
        }

        const parsed = (data as any)
        const mappedData = Object.keys(parsed || {}).includes('deliveries') ? parsed : (parsed?.[0]?.get_delivery_dashboard_data || { deliveries: [], totals: { income: 0, expenses: 0, utility: 0 } });

        return mappedData as { deliveries: DeliveryFinancials[], totals: { income: number, expenses: number, utility: number } }
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

    async getServerDate(): Promise<string> {
        const supabase = createClient()
        const { data, error } = await supabase.rpc('get_server_date')
        if (error || !data) {
            console.error('Error fetching server date:', error)
            return new Date().toLocaleDateString('en-CA')
        }
        return data as string
    },

    async createDelivery(deliveryData: {
        delivery_date: string;
        plate_id: string;
        amount_currency: 'USD' | 'CUP';
        amount_value: number;
        origin?: string;
        destination?: string;
        mileage_start?: number;
    }) {
        const supabase = createClient()

        const { data, error } = await supabase.rpc('create_delivery', {
            p_plate_id: deliveryData.plate_id,
            p_amount_currency: deliveryData.amount_currency,
            p_amount_value: deliveryData.amount_value,
            p_delivery_date: deliveryData.delivery_date,
            p_origin: deliveryData.origin ?? null,
            p_destination: deliveryData.destination ?? null,
            p_mileage_start: deliveryData.mileage_start ?? null,
        })

        if (error) throw error
        return data as string // uuid
    },

    async getDeliveryDetail(deliveryId: string): Promise<{ delivery: DeliveryFinancials, expenses: DeliveryExpense[] } | null> {
        const supabase = createClient()
        const { data, error } = await supabase
            .rpc('get_delivery_detail', { p_delivery_id: deliveryId })

        if (error) {
            console.error('Error fetching delivery detail:', error)
            return null
        }

        return data as unknown as { delivery: DeliveryFinancials, expenses: DeliveryExpense[] }
    },

    async updateDeliveryStatus(deliveryId: string, newStatus: string, mileageEnd?: number): Promise<DeliveryFinancials | null> {
        const supabase = createClient()
        const { data, error } = await supabase
            .rpc('update_delivery_status', {
                p_delivery_id: deliveryId,
                p_new_status: newStatus,
                p_mileage_end: mileageEnd ?? null,
            })

        if (error) throw error
        return data as unknown as DeliveryFinancials
    },

    async updateDeliveryFx(deliveryId: string, fxRate: number): Promise<DeliveryFinancials | null> {
        const supabase = createClient()
        const { data, error } = await supabase
            .rpc('update_delivery_fx', {
                p_delivery_id: deliveryId,
                p_fx_rate: fxRate,
            })

        if (error) throw error
        return data as unknown as DeliveryFinancials
    },

    async updateDeliveryDetails(params: {
        deliveryId: string;
        fuelLiters: number;
        notes: string;
    }): Promise<DeliveryFinancials | null> {
        const supabase = createClient()
        const { data, error } = await supabase.rpc('update_delivery_details', {
            p_delivery_id: params.deliveryId,
            p_fuel_liters: params.fuelLiters,
            p_notes: params.notes,
        })

        if (error) throw error
        return data as unknown as DeliveryFinancials
    },

    exportToCsv(deliveries: DeliveryFinancials[]) {
        if (deliveries.length === 0) return;

        const headers = [
            'Fecha',
            'Chapa',
            'Origen',
            'Destino',
            'Status',
            'Monto Original',
            'Moneda',
            'Tasa FX',
            'Ingreso (USD)',
            'Gasto Total (USD)',
            'Utilidad Neta (USD)',
            'Socio A (USD)',
            'Socio B (USD)',
            'KM Totales',
            'Rendimiento (KM/L)'
        ];

        const rows = deliveries.map(d => [
            d.delivery_date,
            d.plate,
            d.origin || '',
            d.destination || '',
            d.status,
            d.amount_value,
            d.amount_currency,
            d.fx_usd_to_cup,
            d.income_usd_equiv.toFixed(2),
            d.expenses_usd_equiv.toFixed(2),
            d.profit_usd_equiv.toFixed(2),
            d.partner_a_share_usd.toFixed(2),
            d.partner_b_share_usd.toFixed(2),
            d.km_recorridos || 0,
            (d.fuel_yield_actual || 0).toFixed(2)
        ]);

        const csvContent = [
            headers.join(';'),
            ...rows.map(r => r.join(';'))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = `reporte-paqueteria-${new Date().toISOString().split('T')[0]}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
