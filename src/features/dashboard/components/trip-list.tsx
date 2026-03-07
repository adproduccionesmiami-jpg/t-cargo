'use client'

import Link from 'next/link'
import { Truck, Fuel, Utensils, Receipt, Settings, MoreHorizontal } from 'lucide-react'
import { TripFinancials } from '../services/trip-service'

interface TripCardProps {
    trip: TripFinancials;
}

interface TripListProps {
    trips: TripFinancials[];
    isSearchActive?: boolean;
}

export function TripCard({ trip }: TripCardProps) {
    return (
        <Link
            href={`/trips/${trip.id}`}
            className="bg-white rounded-[2rem] p-5 flex justify-between items-center shadow-sm border border-black/5 active:scale-[1.01] hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <Truck className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
                        {trip.plate}
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className={`uppercase text-[10px] tracking-wider ${trip.status === 'Completado' ? 'text-green-500' :
                                trip.status === 'Cancelado' ? 'text-red-500' :
                                    trip.status === 'En curso' ? 'text-blue-500' :
                                        'text-slate-500'
                            }`}>{trip.status}</span>
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                        {new Date(trip.trip_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {trip.amount_value.toLocaleString()} {trip.amount_currency}
                    </p>
                    {trip.status === 'Completado' && trip.km_recorridos != null && (
                        <p className="text-[9px] font-bold text-[#f59e0b] mt-1 uppercase tracking-[0.15em]">
                            {trip.km_recorridos} KM RECORRIDOS
                        </p>
                    )}
                </div>
            </div>

            <div className="text-right">
                <div className="text-base font-black text-gray-900 tracking-tighter">
                    +${(Number(trip.income_usd_equiv) || 0).toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    USD EQUIV
                </div>
            </div>
        </Link>
    )
}

export function TripList({ trips, isSearchActive }: TripListProps) {
    if (trips.length === 0) {
        return (
            <div className="text-center py-12 bg-white/50 rounded-[2.5rem] border-dashed border-2 border-gray-100">
                <p className="text-gray-400 text-sm font-bold">
                    {isSearchActive ? 'No se encontraron viajes que coincidan con la búsqueda.' : 'No hay viajes registrados aún.'}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {trips.map((trip) => (
                <TripCard key={`trip-${trip.id}`} trip={trip} />
            ))}
        </div>
    )
}
