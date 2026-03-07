'use client'

import { useEffect, useState, useRef } from 'react'
import { ChevronDown, Plus, Loader2, Package } from 'lucide-react'
import { deliveryService, Vehicle } from '../services/delivery-service'
import { getVehiclesAction } from '../actions/vehicle-actions'

interface NewDeliveryFormProps {
    onSuccess: (deliveryId?: string) => void
    onCancel?: () => void
}

export function NewDeliveryForm({ onSuccess, onCancel }: NewDeliveryFormProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // CUP is default for Paqueteria
    const [currency, setCurrency] = useState<'USD' | 'CUP'>('CUP')
    const [amount, setAmount] = useState('0.00')
    const [selectedPlateId, setSelectedPlateId] = useState('')
    const [deliveryDate, setDeliveryDate] = useState('')
    const [mileageStart, setMileageStart] = useState('')
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
        async function loadServerDate() {
            const date = await deliveryService.getServerDate()
            setDeliveryDate(date)
        }
        loadVehicles()
        loadServerDate()
    }, [])

    const handleSubmit = async () => {
        if (!selectedPlateId || isSubmitting) return

        setIsSubmitting(true)
        try {
            const deliveryId = await deliveryService.createDelivery({
                delivery_date: deliveryDate,
                plate_id: selectedPlateId,
                amount_currency: currency,
                amount_value: parseFloat(amount),
                origin,
                destination,
                mileage_start: mileageStart ? parseFloat(mileageStart) : undefined,
            })
            onSuccess(deliveryId)
        } catch (error: any) {
            console.error('Error creating delivery:', error)
            const errorMsg = error?.message || error?.details || JSON.stringify(error)
            alert(`Error al crear la entrega: ${errorMsg}`)
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
                        className={`w-full bg-[#f8fafc] border rounded-[1.5rem] py-4 px-6 flex justify-between items-center transition-all shadow-sm cursor-pointer ${isPlateSelectorOpen ? 'bg-white border-emerald-200 ring-4 ring-emerald-500/5' : 'border-transparent'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${selectedVehicle ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Package className="w-4 h-4" />
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
                                                className={`w-full px-6 py-4 text-left transition-all flex justify-between items-center group/item ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/50'
                                                    }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`font-black text-sm transition-colors ${isSelected ? 'text-emerald-600' : 'text-[#0f172a]'
                                                        }`}>
                                                        {vehicle.plate}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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

            {/* Fecha Input */}
            <div className="space-y-2">
                <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Fecha de Operación</label>
                <div className="relative group">
                    <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex justify-between items-center group-focus-within:bg-white group-focus-within:border-emerald-200 transition-all shadow-sm">
                        <input
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 p-0 text-base font-black text-[#0f172a] w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Origen & Destino */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Origen</label>
                    <div className="relative group">
                        <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex justify-between items-center group-focus-within:bg-white group-focus-within:border-emerald-200 transition-all shadow-sm">
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
                        <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex justify-between items-center group-focus-within:bg-white group-focus-within:border-emerald-200 transition-all shadow-sm">
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

            {/* Monto Input */}
            <div className="space-y-2">
                <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Monto de Renta</label>
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <div className="w-full bg-[#f8fafc] border border-transparent rounded-[1.5rem] py-4 px-6 flex items-baseline gap-2 group-focus-within:bg-white group-focus-within:border-emerald-200 transition-all shadow-sm">
                            <span className="text-emerald-400 font-black text-lg">$</span>
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
                    <div className="bg-[#f8fafc] p-1 rounded-full flex items-center shadow-sm border border-slate-100">
                        <button
                            type="button"
                            onClick={() => setCurrency('CUP')}
                            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${currency === 'CUP' ? 'bg-[#0f172a] shadow-md text-white' : 'text-slate-400'
                                }`}
                        >
                            CUP
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrency('USD')}
                            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${currency === 'USD' ? 'bg-[#0f172a] shadow-md text-white' : 'text-slate-400'
                                }`}
                        >
                            USD
                        </button>
                    </div>
                </div>
            </div>

            {/* Kilometraje Inputs */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                    <label className="text-xs font-black text-[#0f172a] uppercase tracking-widest pl-1">Millaje Encendido</label>
                    <div className="relative group">
                        <div className="w-full bg-white border border-transparent rounded-xl py-4 px-6 flex items-center group-focus-within:border-emerald-200 transition-all shadow-sm">
                            <input
                                type="number"
                                value={mileageStart}
                                onChange={(e) => setMileageStart(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 p-0 text-base font-black text-[#0f172a] w-full"
                                placeholder="Millas actuales..."
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium ml-2">Necesario para poder evaluar auditoría mecánica en el cierre.</p>
                </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-4 flex flex-col gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoadingVehicles}
                    className="w-full bg-emerald-500 text-white font-black py-5 px-8 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:scale-100"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            <Package className="w-5 h-5 fill-current" />
                            <span>Programar Entrega</span>
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

            <div className="flex justify-center pt-2">
                <div className="w-32 h-1.5 bg-gray-100 rounded-full" />
            </div>
        </div>
    )
}
