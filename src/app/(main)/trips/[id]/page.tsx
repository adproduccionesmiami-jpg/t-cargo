'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    ChevronLeft,
    Calendar,
    Truck,
    Scale,
    TrendingUp,
    TrendingDown,
    Plus,
    RefreshCcw,
    Receipt
} from 'lucide-react'
import { tripService, TripFinancials } from '@/features/dashboard/services/trip-service'
import { KPIGrid } from '@/features/dashboard/components/kpi-grid'

interface PageProps {
    params: Promise<{ id: string }>
}

export default function TripDetailPage({ params }: PageProps) {
    const router = useRouter()
    const { id } = use(params)
    const [trip, setTrip] = useState<TripFinancials | null>(null)
    const [expenses, setExpenses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadTrip() {
            setIsLoading(true)
            const [tripData, expensesData] = await Promise.all([
                tripService.getTripById(id),
                tripService.getTripExpenses(id)
            ])

            if (!tripData) {
                router.push('/dashboard')
                return
            }

            setTrip(tripData)
            setExpenses(expensesData)
            setIsLoading(false)
        }
        loadTrip()
    }, [id, router])

    if (isLoading || !trip) {
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
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex justify-between items-center -mx-2">
                <button
                    onClick={() => router.back()}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-90 transition-transform"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-400" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">{trip.plate}</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        Hoja de Ruta de Viaje
                    </p>
                </div>
                <div className="bg-[#fef7e0] px-4 py-1.5 rounded-full">
                    <span className="text-[10px] font-black text-[#f2b90d] uppercase tracking-widest">{trip.status}</span>
                </div>
            </header>

            {/* Main Financial Card */}
            <section>
                <div className="card-dark">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-[0.2em] mb-2">UTILIDAD NETA (USD EQUIV)</p>
                            <h2 className="text-4xl font-black text-white tracking-tighter">
                                ${Number(trip.profit_usd_equiv || 0).toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                            </h2>
                        </div>
                        <div className="bg-[#f59e0b] p-3 rounded-2xl shadow-lg shadow-[#f59e0b]/20">
                            <TrendingUp className="w-7 h-7 text-black" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">PARTNER A (50%)</p>
                            <p className="text-xl font-black text-white">${Number(trip.partner_a_share_usd || 0).toLocaleString('es-ES')}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">PARTNER B (50%)</p>
                            <p className="text-xl font-black text-white">${Number(trip.partner_b_share_usd || 0).toLocaleString('es-ES')}</p>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-24 -mt-24 pointer-events-none blur-3xl" />
                </div>
            </section>

            {/* Commissions & Details */}
            <section className="grid grid-cols-2 gap-4">
                <div className="card-crextio !p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">COMISIÓN CHOFER</span>
                    </div>
                    <p className="text-lg font-black text-gray-900">${Number(trip.driver_fee_usd_equiv || 0).toLocaleString('es-ES')}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">5% DEL INGRESO</p>
                </div>

                <div className="card-crextio !p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-500">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">COMISIÓN BROKER</span>
                    </div>
                    <p className="text-lg font-black text-gray-900">${Number(trip.broker_fee_usd_equiv || 0).toLocaleString('es-ES')}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">5% DEL INGRESO</p>
                </div>
            </section>

            {/* FX & Route */}
            <section className="space-y-4">
                <div className="card-crextio !py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <Scale className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TASA FX (USD→CUP)</p>
                                <p className="text-sm font-black text-gray-900">1 USD = {trip.fx_usd_to_cup} CUP</p>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-full transition-colors text-[#f59e0b]">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="card-crextio !py-5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">FECHA DE OPERACIÓN</p>
                            <p className="text-sm font-black text-gray-900">
                                {new Date(trip.trip_date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pl-4 border-l-2 border-dashed border-slate-100 ml-5 py-2">
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ORIGEN</p>
                            <p className="text-sm font-black text-gray-900">{trip.origin || 'SIN DEFINIR'}</p>
                        </div>
                        <div className="w-6 h-px bg-slate-100" />
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DESTINO</p>
                            <p className="text-sm font-black text-gray-900">{trip.destination || 'SIN DEFINIR'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Expenses List */}
            <section className="space-y-4 pb-12">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Desglose de Gastos</h2>
                    <button className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-[#f59e0b]">
                        <Plus className="w-6 h-6" />
                    </button>
                </div>

                {expenses.length === 0 ? (
                    <div className="card-crextio !bg-slate-50/50 !border-dashed !border-2 flex flex-col items-center py-10">
                        <Receipt className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay gastos registrados</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {expenses.map((expense: any) => (
                            <div key={expense.id} className="card-crextio !p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Receipt className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase">{expense.expense_type}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{expense.amount} {expense.currency}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-red-500">-${Number(expense.equivalent_usd).toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">USD EQUIV</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
