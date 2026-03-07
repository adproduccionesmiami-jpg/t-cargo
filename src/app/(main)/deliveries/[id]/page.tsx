'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    ChevronLeft,
    Calendar,
    Scale,
    TrendingUp,
    RefreshCcw,
    Loader2,
    Check,
    X,
    MessageSquare,
    Droplets,
    Save
} from 'lucide-react'
import { deliveryService, DeliveryFinancials, DeliveryExpense } from '@/features/dashboard/services/delivery-service'

interface PageProps {
    params: Promise<{ id: string }>
}

export default function DeliveryDetailPage({ params }: PageProps) {
    const router = useRouter()
    const { id } = use(params)
    const [delivery, setDelivery] = useState<DeliveryFinancials | null>(null)
    const [expenses, setExpenses] = useState<DeliveryExpense[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [isUpdatingFx, setIsUpdatingFx] = useState(false)
    const [isSavingDetails, setIsSavingDetails] = useState(false)

    // Estados de Formulario
    const [mileageEnd, setMileageEnd] = useState('')
    const [showMileageInput, setShowMileageInput] = useState(false)
    const [pendingStatus, setPendingStatus] = useState<string | null>(null)

    const [fuelLiters, setFuelLiters] = useState('0')
    const [notes, setNotes] = useState('')

    // Estado para edición manual de FX
    const [isEditingFx, setIsEditingFx] = useState(false)
    const [tempFx, setTempFx] = useState('')

    const loadData = async () => {
        const data = await deliveryService.getDeliveryDetail(id)
        if (!data) {
            router.push('/deliveries')
            return
        }
        setDelivery(data.delivery)
        setExpenses(data.expenses)
        setTempFx(data.delivery.fx_usd_to_cup.toString())

        // Inicializar campos de detalle
        setFuelLiters(data.delivery.fuel_liters?.toString() || '0')
        setNotes(data.delivery.notes || '')

        if (data.delivery.mileage_end) setMileageEnd(data.delivery.mileage_end.toString())
        setIsLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [id, router])

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === 'Completado' && !showMileageInput && delivery?.status !== 'Completado') {
            setPendingStatus(newStatus)
            setShowMileageInput(true)
            return
        }

        setIsUpdatingStatus(true)
        try {
            const updatedDelivery = await deliveryService.updateDeliveryStatus(
                id,
                newStatus,
                newStatus === 'Completado' ? parseFloat(mileageEnd) : undefined
            )
            if (updatedDelivery) {
                setDelivery(updatedDelivery)
                setShowMileageInput(false)
                setPendingStatus(null)
                await loadData()
            }
        } catch (error: any) {
            alert(error.message || 'Error al actualizar el estado')
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const handleFxSave = async () => {
        const fxVal = parseFloat(tempFx)
        if (isNaN(fxVal) || fxVal <= 0) {
            alert('Ingrese una tasa válida')
            return
        }

        setIsUpdatingFx(true)
        try {
            const updatedDelivery = await deliveryService.updateDeliveryFx(id, fxVal)
            if (updatedDelivery) {
                setIsEditingFx(false)
                await loadData()
            }
        } catch (error: any) {
            alert(error.message || 'Error al actualizar FX')
        } finally {
            setIsUpdatingFx(false)
        }
    }

    const handleSaveDetails = async () => {
        setIsSavingDetails(true)
        try {
            const updatedDelivery = await deliveryService.updateDeliveryDetails({
                deliveryId: id,
                fuelLiters: parseFloat(fuelLiters),
                notes: notes
            })
            if (updatedDelivery) {
                await loadData()
            }
        } catch (error: any) {
            alert(error.message || 'Error al guardar detalles')
        } finally {
            setIsSavingDetails(false)
        }
    }

    if (isLoading || !delivery) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-10 w-10 bg-white rounded-full animate-pulse" />
                <div className="h-40 bg-white rounded-[2.5rem] animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-white rounded-[2rem] animate-pulse" />
                    <div className="h-32 bg-white rounded-[2rem] animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 max-w-md mx-auto">
            {/* Header Rediseñado */}
            <header className="flex justify-between items-center -mx-2">
                <button
                    onClick={() => router.back()}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-90 transition-transform"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-400" />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{delivery.plate}</h1>
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-0.5">
                        DETALLE DE ENTREGA
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-2xl transition-colors shadow-sm border ${delivery.status === 'Completado' ? 'bg-green-50 border-green-100 text-green-600' :
                    delivery.status === 'Cancelado' ? 'bg-red-50 border-red-100 text-red-600' :
                        'bg-emerald-50 border-emerald-100 text-emerald-600'
                    }`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{delivery.status}</span>
                </div>
            </header>

            {/* 1. Información de Entrega y Ruta */}
            <section className="space-y-4">
                <div className="card-crextio !py-6 grid grid-cols-2 gap-6">
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">FECHA</p>
                                <p className="text-sm font-black text-gray-900">{new Date(delivery.delivery_date + 'T00:00:00').toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="pl-3 border-l-2 border-dashed border-slate-100 space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">ORIGEN</p>
                                <p className="text-sm font-black text-gray-900 uppercase truncate">{delivery.origin || 'SIN ORIGEN'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">DESTINO</p>
                                <p className="text-sm font-black text-gray-900 uppercase truncate">{delivery.destination || 'SIN DESTINO'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#f8fafc] rounded-3xl p-5 flex flex-col justify-center items-center text-center border border-slate-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">RECORRIDO</p>
                        <p className="text-4xl font-black text-[#0f172a] tracking-tighter">
                            {delivery.mileage_end ? Number(delivery.km_recorridos || 0).toLocaleString('es-ES', { maximumFractionDigits: 1 }) : '0'}
                        </p>
                        <p className="text-[10px] font-black text-emerald-500 mt-1 tracking-widest">KM TOTALES</p>
                    </div>
                </div>

                {/* Millaje Detallado */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase">INICIO</span>
                        <span className="text-base font-black text-gray-900">{delivery.mileage_start || '0'}</span>
                    </div>
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase">FIN</span>
                        <span className="text-base font-black text-gray-900">{delivery.mileage_end || '---'}</span>
                    </div>
                </div>
            </section>

            {/* 2. Combustible y Notas (Manual) */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Detalles de Operación</h2>
                    <button
                        onClick={handleSaveDetails}
                        disabled={isSavingDetails}
                        className="h-10 px-4 bg-[#0f172a] rounded-xl shadow-lg flex items-center gap-2 text-white active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSavingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">GUARDAR</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Card de Combustible */}
                    <div className="card-crextio !p-0 overflow-hidden border-2 border-emerald-100 shadow-xl shadow-emerald-500/5">
                        <div className="bg-emerald-500 px-6 py-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-white" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Módulo de Combustible</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-lg">
                                <span className="text-[10px] font-black text-white">{Number(delivery.fuel_yield_actual || 0).toFixed(2)}</span>
                                <span className="text-[8px] font-bold text-white/80 uppercase">KM/L</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Litros Cargados</label>
                                    <input
                                        type="number"
                                        value={fuelLiters}
                                        onChange={(e) => setFuelLiters(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-gray-400 pl-1 mt-1">Solo para auditoría mecánica de rendimiento. Costo asumido por cliente.</p>
                                </div>
                            </div>

                            {/* Auditoría de Rendimiento Volvo D13 */}
                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Referencia de Rendimiento (Volvo D13)</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className={`p-2 rounded-xl text-center border transition-all ${delivery.fuel_yield_actual! >= 2.3 && delivery.fuel_yield_actual! <= 2.8 ? 'bg-emerald-100 border-emerald-300 scale-105 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                        <p className="font-black text-gray-400 uppercase text-[7px] mb-1">Carga Pesada</p>
                                        <p className="text-[10px] font-black text-gray-700">2.3-2.8</p>
                                    </div>
                                    <div className={`p-2 rounded-xl text-center border transition-all ${delivery.fuel_yield_actual! >= 2.9 && delivery.fuel_yield_actual! <= 3.4 ? 'bg-green-100 border-green-300 scale-105 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                        <p className="font-black text-gray-400 uppercase text-[7px] mb-1">Carga Media</p>
                                        <p className="text-[10px] font-black text-gray-700">2.9-3.4</p>
                                    </div>
                                    <div className={`p-2 rounded-xl text-center border transition-all ${delivery.fuel_yield_actual! >= 3.5 && delivery.fuel_yield_actual! <= 4.2 ? 'bg-blue-100 border-blue-300 scale-105 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                        <p className="font-black text-gray-400 uppercase text-[7px] mb-1">Bobtail (Vacío)</p>
                                        <p className="text-[10px] font-black text-gray-700">3.5-4.2</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card de Notas */}
                    <div className="card-crextio !p-6 space-y-3">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notas e Incidencias</span>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:bg-white focus:border-slate-200 transition-all resize-none"
                            placeholder="Escriba aquí..."
                        />
                    </div>
                </div>
            </section>

            {/* 3. Tasa FX Operativa */}
            <section>
                <div className={`card-crextio !py-5 transition-all border-2 ${isEditingFx ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isEditingFx ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Scale className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TASA CAMBIO (FLUCTUACIÓN)</p>
                                {isEditingFx ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-black text-gray-900">1 USD =</span>
                                        <input
                                            autoFocus
                                            type="number"
                                            value={tempFx}
                                            onChange={(e) => setTempFx(e.target.value)}
                                            className="w-24 bg-white border-b-2 border-emerald-500 text-base font-black text-gray-900 px-1 py-0 outline-none"
                                        />
                                        <span className="text-sm font-black text-gray-900">CUP</span>
                                    </div>
                                ) : (
                                    <p className="text-base font-black text-gray-900">1 USD = {delivery.fx_usd_to_cup} CUP</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {isEditingFx ? (
                                <>
                                    <button
                                        onClick={() => { setIsEditingFx(false); setTempFx(delivery.fx_usd_to_cup.toString()); }}
                                        className="p-2.5 hover:bg-red-50 text-red-400 rounded-full"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleFxSave}
                                        disabled={isUpdatingFx}
                                        className="p-2.5 hover:bg-green-50 text-green-500 rounded-full"
                                    >
                                        {isUpdatingFx ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditingFx(true)}
                                    className="p-2.5 hover:bg-emerald-50 rounded-full text-emerald-500 transition-colors"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Resultado Final (La Verdad de los Socios) */}
            <section>
                <div className="card-emerald relative overflow-hidden ring-8 ring-slate-900/5 shadow-2xl">
                    <div className="flex justify-between items-start mb-10 relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-emerald-100 uppercase tracking-[0.3em] mb-2">UTILIDAD NETA TOTAL</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter">
                                ${Number(delivery.profit_usd_equiv || 0).toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                            </h2>
                        </div>
                        <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/5">
                            <TrendingUp className="w-8 h-8 text-emerald-100" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 pt-8 border-t border-white/10 relative z-10">
                        <div className="group">
                            <p className="text-[11px] font-black text-emerald-100/70 uppercase tracking-[0.2em] mb-1.5 group-hover:text-emerald-50 transition-colors">Socio A (50%)</p>
                            <p className="text-2xl font-black text-white tracking-tight">${Number(delivery.partner_a_share_usd || 0).toLocaleString('es-ES')}</p>
                        </div>
                        <div className="group">
                            <p className="text-[11px] font-black text-emerald-100/70 uppercase tracking-[0.2em] mb-1.5 group-hover:text-emerald-50 transition-colors">Socio B (50%)</p>
                            <p className="text-2xl font-black text-white tracking-tight">${Number(delivery.partner_b_share_usd || 0).toLocaleString('es-ES')}</p>
                        </div>
                    </div>

                    {/* Efectos visuales de fondo premium */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-800/20 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none" />
                </div>
            </section>

            {/* 5. Selector de Estado (Confirmación Final) */}
            <section className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Actualizar Estado Operativo</label>
                <div className="bg-[#f1f5f9] p-2 rounded-[1.8rem] flex items-center shadow-inner relative overflow-hidden ring-1 ring-slate-200">
                    {['En curso', 'Completado', 'Cancelado'].map((s) => (
                        <button
                            key={s}
                            disabled={isUpdatingStatus}
                            onClick={() => handleStatusChange(s)}
                            className={`flex-1 py-4 rounded-[1.4rem] text-[11px] font-black tracking-widest uppercase transition-all relative z-10 ${delivery.status === s
                                ? 'bg-[#0f172a] shadow-xl text-white scale-[1.03]'
                                : 'text-slate-400 hover:bg-slate-200/40'
                                }`}
                        >
                            {isUpdatingStatus && pendingStatus === s ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto text-white" />
                            ) : s}
                        </button>
                    ))}
                </div>

                {/* Input condicional de Millaje Final */}
                {showMileageInput && (
                    <div className="animate-in slide-in-from-top-4 duration-500 space-y-3 mt-6">
                        <div className="card-crextio !p-6 bg-emerald-50 border-emerald-200 ring-4 ring-emerald-500/5 shadow-2xl">
                            <label className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] block mb-3">MILLAJE DE CIERRE (KM APAGADO)</label>
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    autoFocus
                                    value={mileageEnd}
                                    onChange={(e) => setMileageEnd(e.target.value)}
                                    placeholder="KM actual..."
                                    className="flex-1 bg-white border-2 border-emerald-100 rounded-2xl px-5 py-4 text-base font-black text-gray-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all shadow-inner"
                                />
                                <button
                                    onClick={() => handleStatusChange('Completado')}
                                    disabled={!mileageEnd || isUpdatingStatus}
                                    className="bg-emerald-500 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    CONFIRMAR
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
