'use client'

import Link from 'next/link'
import { Package } from 'lucide-react'
import { DeliveryFinancials } from '../services/delivery-service'

interface DeliveryCardProps {
    delivery: DeliveryFinancials;
}

interface DeliveryListProps {
    deliveries: DeliveryFinancials[];
    isSearchActive?: boolean;
}

export function DeliveryCard({ delivery }: DeliveryCardProps) {
    return (
        <Link
            href={`/deliveries/${delivery.id}`}
            className="bg-white rounded-[2rem] p-5 flex justify-between items-center shadow-sm border border-black/5 active:scale-[1.01] hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
                        {delivery.plate}
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-emerald-500 uppercase text-[10px] tracking-wider">{delivery.status}</span>
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                        {new Date(delivery.delivery_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {delivery.amount_value.toLocaleString()} {delivery.amount_currency}
                    </p>
                    {delivery.status === 'Completado' && delivery.km_recorridos != null && (
                        <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-[0.15em]">
                            {Number(delivery.km_recorridos).toLocaleString('es-ES', { maximumFractionDigits: 1 })} KM RECORRIDOS
                        </p>
                    )}
                </div>
            </div>

            <div className="text-right">
                <div className="text-base font-black text-gray-900 tracking-tighter">
                    +${(Number(delivery.income_usd_equiv) || 0).toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    USD EQUIV
                </div>
            </div>
        </Link>
    )
}

export function DeliveryList({ deliveries, isSearchActive }: DeliveryListProps) {
    if (deliveries.length === 0) {
        return (
            <div className="text-center py-12 bg-white/50 rounded-[2.5rem] border-dashed border-2 border-gray-100">
                <p className="text-gray-400 text-sm font-bold">
                    {isSearchActive ? 'No se encontraron entregas que coincidan con la búsqueda.' : 'No hay entregas registradas aún.'}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {deliveries.map((delivery) => (
                <DeliveryCard key={`delivery-${delivery.id}`} delivery={delivery} />
            ))}
        </div>
    )
}
