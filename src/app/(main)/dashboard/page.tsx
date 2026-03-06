'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, List } from 'lucide-react'
import { KPIGrid } from '@/features/dashboard/components/kpi-grid'
import { TripList } from '@/features/dashboard/components/trip-list'
import { tripService, TripFinancials, DashboardFilter } from '@/features/dashboard/services/trip-service'
import { Drawer } from '@/shared/components/drawer'
import { NewTripForm } from '@/features/dashboard/components/new-trip-form'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<{ trips: TripFinancials[], totals: { income: number, expenses: number, utility: number } }>({
    trips: [],
    totals: { income: 0, expenses: 0, utility: 0 }
  })
  const [recentTrips, setRecentTrips] = useState<TripFinancials[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [filter, setFilter] = useState<DashboardFilter>(() => {
    const f = searchParams.get('filter')
    return (f === 'hoy' || f === 'mes' || f === 'todo') ? f : 'todo'
  })

  const loadData = async (currentFilter: DashboardFilter) => {
    setIsLoading(true)
    const [result, recent] = await Promise.all([
      tripService.getDashboardData(currentFilter),
      tripService.getDashboardData('todo')
    ])
    setData(result)
    setRecentTrips(recent.trips.slice(0, 5))
    setIsLoading(false)
  }

  useEffect(() => {
    loadData(filter)
  }, [filter])

  const { trips, totals } = data

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-start px-6 py-2 mb-0">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">
          Inicio
        </h1>
      </header>

      {/* Filter Selector */}
      <div className="flex justify-center -mt-2 px-2">
        <div className="bg-slate-100/50 p-1.5 rounded-full flex items-center shadow-inner border border-slate-100 w-full max-w-sm">
          <button
            onClick={() => setFilter('hoy')}
            className={`flex-1 px-2 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'hoy' ? 'bg-white shadow-md text-slate-900 scale-105' : 'text-slate-400'
              }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setFilter('mes')}
            className={`flex-1 px-2 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'mes' ? 'bg-white shadow-md text-slate-900 scale-105' : 'text-slate-400'
              }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setFilter('todo')}
            className={`flex-1 px-2 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'todo' ? 'bg-white shadow-md text-slate-900 scale-105' : 'text-slate-400'
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
            <KPIGrid
              totalIncome={totals.income}
              totalExpenses={totals.expenses}
              totalUtility={totals.utility}
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Viajes Recientes</h2>
              <button
                onClick={() => setFilter('todo')}
                className="text-[10px] font-black text-[#f2b90d] uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                Ver Todo
              </button>
            </div>
            <TripList trips={filter === 'hoy' && trips.length === 0 ? recentTrips : trips} />
          </section>
        </>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 pb-12">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="btn-crextio w-full"
        >
          <Plus className="w-5 h-5 fill-current" />
          <span>Nuevo Viaje</span>
        </button>
        <button
          onClick={() => setFilter('todo')}
          className="btn-secondary-crextio w-full"
        >
          <List className="w-5 h-5 text-amber-500" />
          <span>Historial de Viajes</span>
        </button>
      </div>

      {/* Drawer Nuevo Viaje */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Nuevo Viaje"
      >
        <NewTripForm
          onSuccess={() => {
            setIsDrawerOpen(false)
            loadData(filter)
          }}
          onCancel={() => setIsDrawerOpen(false)}
        />
      </Drawer>
    </div>
  )
}

