'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { KPIGrid } from '@/features/dashboard/components/kpi-grid'
import { TripList } from '@/features/dashboard/components/trip-list'
import { tripService, TripFinancials, DashboardFilter } from '@/features/dashboard/services/trip-service'
import { Drawer } from '@/shared/components/drawer'
import { NewTripForm } from '@/features/dashboard/components/new-trip-form'

export default function DashboardPage() {
  const [trips, setTrips] = useState<TripFinancials[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [filter, setFilter] = useState<DashboardFilter>('todo')

  const loadData = async (currentFilter: DashboardFilter) => {
    setIsLoading(true)
    const data = await tripService.getDashboardData(currentFilter)
    setTrips(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData(filter)
  }, [filter])

  const totals = trips?.reduce((acc, trip) => ({
    income: acc.income + Number(trip.total_income_usd_equiv || 0),
    expenses: acc.expenses + Number(trip.total_expenses_usd_equiv || 0),
    utility: acc.utility + Number(trip.net_utility_usd || 0)
  }), { income: 0, expenses: 0, utility: 0 }) || { income: 0, expenses: 0, utility: 0 }

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center -mx-2">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6 text-gray-400" />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">Detalle de Viaje</h1>
        <div className="bg-[#fef7e0] px-4 py-1.5 rounded-full">
          <span className="text-[10px] font-black text-[#f2b90d] uppercase tracking-widest">En Curso</span>
        </div>
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
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Gastos Recientes</h2>
              <button
                onClick={() => setFilter('todo')}
                className="text-[10px] font-black text-[#f2b90d] uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                Ver Todo
              </button>
            </div>
            <TripList trips={trips} />
          </section>
        </>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 pb-12">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="btn-crextio w-full"
        >
          <Plus className="w-5 h-5 fill-current" />
          <span>Agregar Gasto</span>
        </button>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="btn-secondary-crextio w-full"
        >
          <Plus className="w-5 h-5 rotate-45" />
          <span>Actualizar FX</span>
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

