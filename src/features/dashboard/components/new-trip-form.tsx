'use client'

import { useEffect, useState } from 'react'
import { Calendar, ChevronDown, Plus, Loader2 } from 'lucide-react'
import { tripService, Vehicle } from '../services/trip-service'

interface NewTripFormProps {
    onSuccess: () => void
}

export function NewTripForm({ onSuccess }: NewTripFormProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [currency, setCurrency] = useState<'USD' | 'CUP'>('USD')
    const [amount, setAmount] = useState('0.00')
    const [selectedPlateId, setSelectedPlateId] = useState('')
    const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0])
    const [isPlateSelectorOpen, setIsPlateSelectorOpen] = useState(false)

    useEffect(() => {
        async function loadVehicles() {
            const data = await tripService.getVehicles()
            setVehicles(data)
            if (data.length > 0) {
                setSelectedPlateId(data[0].id)
            }
            setIsLoadingVehicles(false)
        }
        loadVehicles()
    }, [])

    const handleSubmit = async () => {
        if (!selectedPlateId || isSubmitting) return

        setIsSubmitting(true)
        try {
            await tripService.createTrip({
                trip_date: tripDate,
                plate_id: selectedPlateId,
                amount_currency: currency,
                amount_value: parseFloat(amount),
                status: 'En curso' // Default status
            })
            onSuccess()
        } catch (error) {
            console.error('Error creating trip:', error)
            alert('Error al crear el viaje. Por favor intente de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedVehicle = vehicles.find(v => v.id === selectedPlateId)

    return (
        <div className="space-y-6">
            {/* Chapa Input */}
            <div className="space-y-2">
                <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Chapa</label>
                <div className="relative group">
                    <button
                        onClick={() => setIsPlateSelectorOpen(!isPlateSelectorOpen)}
                        className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex justify-between items-center group-focus-within:bg-white group-focus-within:border-gray-200 transition-all shadow-sm cursor-pointer"
                    >
                        <span className="text-base font-black text-[#0f172a]">
                            {isLoadingVehicles ? 'Cargando...' : selectedVehicle?.plate || 'Seleccionar'}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isPlateSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isPlateSelectorOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {vehicles.map(vehicle => (
                                <button
                                    key={vehicle.id}
                                    onClick={() => {
                                        setSelectedPlateId(vehicle.id)
                                        setIsPlateSelectorOpen(false)
                                    }}
                                    className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-none flex justify-between items-center"
                                >
                                    <span className="font-black text-[#0f172a]">{vehicle.plate}</span>
                                    {vehicle.alias && <span className="text-xs font-bold text-slate-400 uppercase">{vehicle.alias}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Origen & Destino */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 opacity-50">
                    <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Origen</label>
                    <div className="relative group">
                        <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex justify-between items-center transition-all shadow-sm cursor-not-allowed">
                            <span className="text-sm font-black text-[#0f172a] truncate">HABANA</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-2 opacity-50">
                    <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Destino</label>
                    <div className="relative group">
                        <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex justify-between items-center transition-all shadow-sm cursor-not-allowed">
                            <span className="text-sm font-black text-[#0f172a] truncate">MATANZAS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fecha Input */}
            <div className="space-y-2">
                <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Fecha</label>
                <div className="relative group">
                    <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex justify-between items-center group-focus-within:bg-white group-focus-within:border-gray-200 transition-all shadow-sm">
                        <input
                            type="date"
                            value={tripDate}
                            onChange={(e) => setTripDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 p-0 text-base font-black text-[#0f172a] w-full"
                        />
                        <Calendar className="w-5 h-5 text-[#f59e0b] pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Monto Input */}
            <div className="space-y-2">
                <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Ingreso Base</label>
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex items-baseline gap-2 group-focus-within:bg-white group-focus-within:border-gray-200 transition-all shadow-sm">
                            <span className="text-slate-400 font-black text-lg">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onFocus={(e) => e.target.value === '0.00' && setAmount('')}
                                onBlur={(e) => e.target.value === '' && setAmount('0.00')}
                                className="bg-transparent border-none focus:ring-0 p-0 text-xl font-black text-[#0f172a] w-full"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Currency Toggle */}
                    <div className="bg-[#f8fafc] p-1 rounded-full flex items-center shadow-sm">
                        <button
                            type="button"
                            onClick={() => setCurrency('USD')}
                            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${currency === 'USD' ? 'bg-white shadow-sm text-[#0f172a]' : 'text-slate-400'
                                }`}
                        >
                            USD
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrency('CUP')}
                            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${currency === 'CUP' ? 'bg-white shadow-sm text-[#0f172a]' : 'text-slate-400'
                                }`}
                        >
                            CUP
                        </button>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoadingVehicles}
                    className="w-full bg-[#f59e0b] text-white font-black py-5 px-8 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#f59e0b]/30 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:scale-100"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            <span>Crear Viaje</span>
                        </>
                    )}
                </button>
            </div>

            {/* Footer Line */}
            <div className="flex justify-center pt-2">
                <div className="w-32 h-1.5 bg-gray-100 rounded-full" />
            </div>
        </div>
    )
}

