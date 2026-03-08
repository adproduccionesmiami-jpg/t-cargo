'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, List, Search, X, Calendar as CalendarIcon, Filter, Download, LogOut, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DeliveryKPIGrid } from '@/features/dashboard/components/kpi-grid-delivery'
import { DeliveryList } from '@/features/dashboard/components/delivery-list'
import { deliveryService, DeliveryFinancials, DashboardFilter } from '@/features/dashboard/services/delivery-service'
import { Drawer } from '@/shared/components/drawer'
import { NewDeliveryForm } from '@/features/dashboard/components/new-delivery-form'

export default function DeliveriesDashboardPage() {
    return (
        <Suspense fallback={
            <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="flex justify-between items-center px-6 py-2 mb-0">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">
                        Paquetería
                    </h1>
                </header>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                    <div className="h-60 bg-gray-50 rounded-3xl animate-pulse" />
                </div>
            </div>
        }>
            <DeliveriesDashboardContent />
        </Suspense>
    )
}

function DeliveriesDashboardContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [data, setData] = useState<{ deliveries: DeliveryFinancials[], totals: { income: number, expenses: number, utility: number } }>({
        deliveries: [],
        totals: { income: 0, expenses: 0, utility: 0 }
    })
    const [recentDeliveries, setRecentDeliveries] = useState<DeliveryFinancials[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [filter, setFilter] = useState<DashboardFilter>(() => {
        const f = searchParams.get('filter')
        return (f === 'hoy' || f === 'mes' || f === 'todo') ? f : 'todo'
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearch, setShowSearch] = useState(searchParams.get('search') === 'active')

    const loadData = async (currentFilter: DashboardFilter) => {
        setIsLoading(true)
        const [result, recent] = await Promise.all([
            deliveryService.getDashboardData(currentFilter),
            deliveryService.getDashboardData('todo')
        ])
        setData(result)
        setRecentDeliveries(recent.deliveries.slice(0, 5))
        setIsLoading(false)
    }

    useEffect(() => {
        loadData(filter)
    }, [filter])

    useEffect(() => {
        const isSearchActive = searchParams.get('search') === 'active'
        setShowSearch(isSearchActive)
    }, [searchParams])

    const { deliveries, totals } = data

    const filteredDeliveries = deliveries.filter(delivery => {
        const query = searchQuery.toLowerCase()
        const matchesPlate = delivery.plate.toLowerCase().includes(query)
        const matchesDate = delivery.delivery_date.toLowerCase().includes(query)

        return matchesPlate || matchesDate
    })

    // Lógica de visualización
    const deliveriesToDisplay = searchQuery
        ? filteredDeliveries
        : (filter === 'hoy' && deliveries.length === 0 ? recentDeliveries : deliveries)

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-center px-6 py-2 mb-0">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">
                    Paquetería
                </h1>
                <button
                    onClick={handleLogout}
                    className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95"
                    title="Cerrar Sesión"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            {/* Search Bar - Condicional */}
            {(showSearch || searchQuery) && (
                <div className="px-2 animate-in slide-in-from-top-4 duration-300">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por chapa o fecha (YYYY-MM-DD)..."
                            className="w-full bg-white border-2 border-slate-100 rounded-[1.8rem] pl-14 pr-12 py-5 text-sm font-bold text-gray-900 focus:border-emerald-500 outline-none transition-all shadow-sm shadow-slate-200/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Filter Selector - Temporalidad */}
            <div className="flex flex-col gap-4 px-2">
                <div className="flex items-center justify-between mb-1 px-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Temporalidad</span>
                    </div>
                    <button
                        onClick={() => deliveryService.exportToCsv(deliveries)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-95 group"
                    >
                        <Download className="w-3 h-3 text-slate-500 group-hover:text-[#0f172a]" />
                        <span className="text-[9px] font-black text-slate-500 group-hover:text-[#0f172a] uppercase tracking-wider">Exportar CSV</span>
                    </button>
                </div>
                <div className="bg-slate-100/50 p-1.5 rounded-full flex items-center shadow-inner border border-slate-100 w-full max-w-sm mx-auto">
                    <button
                        onClick={() => setFilter('hoy')}
                        className={`flex-1 px-2 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'hoy' ? 'bg-white shadow-md text-emerald-900 scale-105' : 'text-slate-400'
                            }`}
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => setFilter('mes')}
                        className={`flex-1 px-2 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'mes' ? 'bg-white shadow-md text-emerald-900 scale-105' : 'text-slate-400'
                            }`}
                    >
                        Este Mes
                    </button>
                    <button
                        onClick={() => setFilter('todo')}
                        className={`flex-1 px-2 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'todo' ? 'bg-white shadow-md text-emerald-900 scale-105' : 'text-slate-400'
                            }`}
                    >
                        Histórico
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                    <div className="h-60 bg-gray-50 rounded-3xl animate-pulse" />
                </div>
            ) : (
                <>
                    <section>
                        <DeliveryKPIGrid
                            totalIncome={totals.income}
                            totalExpenses={totals.expenses}
                            totalUtility={totals.utility}
                        />
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Entregas Recientes</h2>
                            <button
                                onClick={() => setFilter('todo')}
                                className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:opacity-70 transition-opacity"
                            >
                                Ver Todo
                            </button>
                        </div>
                        <DeliveryList
                            deliveries={deliveriesToDisplay}
                            isSearchActive={!!searchQuery}
                        />
                    </section>
                </>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 pb-12">
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="bg-emerald-500 text-white font-black py-4 px-8 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/30 w-full flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5 fill-current" />
                    <span>Nueva Entrega</span>
                </button>
                <button
                    onClick={() => setFilter('todo')}
                    className="btn-secondary-crextio w-full"
                >
                    <List className="w-5 h-5 text-emerald-500" />
                    <span>Historial</span>
                </button>
            </div>

            {/* Drawer Nueva Entrega */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Crear Nueva Entrega"
            >
                <NewDeliveryForm
                    onSuccess={(deliveryId) => {
                        setIsDrawerOpen(false)
                        if (deliveryId) {
                            router.push(`/deliveries/${deliveryId}`)
                        } else {
                            loadData(filter)
                        }
                    }}
                    onCancel={() => setIsDrawerOpen(false)}
                />
            </Drawer>
        </div>
    )
}
