'use client'

import { useEffect, useState } from 'react'
import { Truck, Fuel, Utensils, Receipt, Settings, MoreHorizontal } from 'lucide-react'
import { TripFinancials } from '../services/trip-service'

interface TripCardProps {
    trip: TripFinancials;
}

const categoryIcons: Record<string, any> = {
    'Combustible': Fuel,
    'Viáticos': Utensils,
    'Peajes': Receipt,
    'Mantenimiento': Settings,
    'Otros': MoreHorizontal
}

export function TripCard({ trip }: TripCardProps) {
    const Icon = categoryIcons[trip.plate_number] || Truck

    return (
        <div className="bg-white rounded-[2rem] p-5 flex justify-between items-center shadow-sm border border-black/5 active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-base font-black text-gray-900 tracking-tight">
                        {trip.plate_number === 'PROGRAMADO' ? 'Combustible' : trip.plate_number}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                        {new Date(trip.trip_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {trip.status}
                    </p>
                </div>
            </div>

            <div className="text-right">
                <div className="text-base font-black text-gray-900 tracking-tighter">
                    -${(Number(trip.total_expenses_usd_equiv) || 0).toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                </div>
            </div>
        </div>
    )
}

interface TripListProps {
    trips: TripFinancials[];
}

export function TripList({ trips }: TripListProps) {
    if (trips.length === 0) {
        return (
            <div className="text-center py-12 bg-white/50 rounded-[2.5rem] border-dashed border-2 border-gray-100">
                <p className="text-gray-400 text-sm font-bold">No hay gastos registrados aún.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {trips.map((trip, index) => (
                <TripCard key={`trip-${trip.trip_id || index}`} trip={trip} />
            ))}
        </div>
    )
}
