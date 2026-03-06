'use client'

import { useEffect, useState, useRef } from 'react'
import { Calendar, ChevronDown, Plus, Loader2, Truck } from 'lucide-react'
import { tripService, Vehicle } from '../services/trip-service'
import { getVehiclesAction } from '../actions/vehicle-actions'
import { useAuthStore } from '@/features/auth/store/auth-store'

interface NewTripFormProps {
    onSuccess: () => void
    onCancel?: () => void
}

export function NewTripForm({ onSuccess, onCancel }: NewTripFormProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [currency, setCurrency] = useState<'USD' | 'CUP'>('USD')
    const [amount, setAmount] = useState('0.00')
    const [selectedPlateId, setSelectedPlateId] = useState('')
    const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0])
    const [mileageStart, setMileageStart] = useState('')
    const [mileageEnd, setMileageEnd] = useState('')
    const [status, setStatus] = useState('En curso')
    const [origin, setOrigin] = useState('HABANA')
    const [destination, setDestination] = useState('MATANZAS')
    const [isPlateSelectorOpen, setIsPlateSelectorOpen] = useState(false)
    const selectorRef = useRef<HTMLDivElement>(null)

    // Close selector on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
                setIsPlateSelectorOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        async function loadVehicles() {
            try {
                const data = await getVehiclesAction()
                setVehicles(data)
                if (data.length > 0) {
                    setSelectedPlateId(data[0].id)
                }
            } catch (error) {
                console.error('Error in loadVehicles:', error)
            } finally {
                setIsLoadingVehicles(false)
            }
        }
        loadVehicles()
    }, [])

    const { user } = useAuthStore()

    const handleSubmit = async () => {
        if (!selectedPlateId || isSubmitting || !user) return

        setIsSubmitting(true)
        try {
            await tripService.createTrip({
                trip_date: tripDate,
                plate_id: selectedPlateId,
                amount_currency: currency,
                amount_value: parseFloat(amount),
                status: status,
                origin,
                destination,
                mileage_start: mileageStart ? parseFloat(mileageStart) : undefined,
                mileage_end: mileageEnd ? parseFloat(mileageEnd) : undefined,
                created_by_user_id: user.id
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
                <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Chapa / Rastra</label>
                <div className="relative group" ref={selectorRef}>
                    <button
                        type="button"
                        onClick={() => setIsPlateSelectorOpen(!isPlateSelectorOpen)}
                        className={`w-full bg-[#f8fafc] border rounded-[1.5rem] py-4 px-6 flex justify-between items-center transition-all shadow-sm cursor-pointer ${isPlateSelectorOpen ? 'bg-white border-gray-200 ring-4 ring-[#f59e0b]/5' : 'border-transparent'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${selectedVehicle ? 'bg-slate-100 text-[#0f172a]' : 'bg-slate-50 text-slate-400'}`}>
                                <Truck className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col items-start translate-y-[-1px]">
                                <span className="text-base font-black text-[#0f172a]">
                                    {isLoadingVehicles ? 'Cargando...' : selectedVehicle?.plate || 'Seleccionar'}
                                </span>
                            </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isPlateSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isPlateSelectorOpen && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="max-height-[240px] overflow-y-auto scrollbar-hide py-2">
                                {vehicles.length === 0 ? (
                                    <div className="px-6 py-4 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase">No hay vehículos</p>
                                    </div>
                                ) : (
                                    vehicles.map(vehicle => {
                                        const isSelected = vehicle.id === selectedPlateId;
                                        return (
                                            <button
                                                key={vehicle.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPlateId(vehicle.id)
                                                    setIsPlateSelectorOpen(false)
                                                }}
                                                className={`w-full px-6 py-4 text-left transition-all flex justify-between items-center group/item ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                                                    }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`font-black text-sm transition-colors ${isSelected ? 'text-[#f59e0b]' : 'text-[#0f172a]'
                                                        }`}>
                                                        {vehicle.plate}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Origen & Destino */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Origen</label>
                    <div className="relative group">
                        <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex justify-between items-center group-focus-within:bg-white group-focus-within:border-gray-200 transition-all shadow-sm">
                            <input
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-black text-[#0f172a] w-full"
                                placeholder="ORIGEN"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Destino</label>
                    <div className="relative group">
                        <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex justify-between items-center group-focus-within:bg-white group-focus-within:border-gray-200 transition-all shadow-sm">
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-black text-[#0f172a] w-full"
                                placeholder="DESTINO"
                            />
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

            {/* Estado Input */}
            <div className="space-y-2">
                <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Estado del Viaje</label>
                <div className="bg-[#f8fafc] p-1.5 rounded-[1.5rem] flex items-center shadow-sm border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all relative z-10">
                    {['En curso', 'Completado', 'Cancelado'].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setStatus(s);
                            }}
                            className={`flex-1 py-3 rounded-[1.2rem] text-[10px] font-black tracking-widest uppercase transition-all relative z-20 ${status === s
                                    ? 'bg-[#0f172a] shadow-md text-white scale-105 select-none'
                                    : 'text-slate-400 hover:bg-slate-200/50'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
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
                            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${currency === 'USD' ? 'bg-[#0f172a] shadow-sm text-white' : 'text-slate-400'
                                }`}
                        >
                            USD
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrency('CUP')}
                            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${currency === 'CUP' ? 'bg-[#0f172a] shadow-sm text-white' : 'text-slate-400'
                                }`}
                        >
                            CUP
                        </button>
                    </div>
                </div>
            </div>

            {/* Kilometraje Inputs */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Millaje Encendido</label>
                    <div className="relative group">
                        <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex items-center group-focus-within:bg-white group-focus-within:border-gray-200 transition-all shadow-sm">
                            <input
                                type="number"
                                value={mileageStart}
                                onChange={(e) => setMileageStart(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 p-0 text-base font-black text-[#0f172a] w-full"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Millaje Apagado</label>
                    <div className="relative group">
                        <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex items-center group-focus-within:bg-white group-focus-within:border-gray-200 transition-all shadow-sm">
                            <input
                                type="number"
                                value={mileageEnd}
                                onChange={(e) => setMileageEnd(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 p-0 text-base font-black text-[#0f172a] w-full"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-4 flex flex-col gap-3">
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

                {onCancel && (
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="w-full bg-slate-100 text-slate-500 font-black py-4 px-8 rounded-[2rem] transition-all hover:bg-slate-200 active:scale-[0.98] flex items-center justify-center gap-2 text-base disabled:opacity-50"
                    >
                        <span>Cancelar</span>
                    </button>
                )}
            </div>

            {/* Footer Line */}
            <div className="flex justify-center pt-2">
                <div className="w-32 h-1.5 bg-gray-100 rounded-full" />
            </div>
        </div>
    )
}

