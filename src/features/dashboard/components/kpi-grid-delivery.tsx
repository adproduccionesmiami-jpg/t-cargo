import { TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

interface KPICardProps {
    title: string
    value: number
    subtitle?: string
    trend?: string
    trendUp?: boolean
    variant?: 'emerald' | 'white'
}

function KPICard({ title, value, subtitle, trend, trendUp, variant = 'white' }: KPICardProps) {
    const isDark = variant === 'emerald'

    return (
        <div className={isDark ? 'card-emerald' : 'card-crextio'}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-emerald-100' : 'text-gray-400'}`}>
                        {title}
                    </p>
                    <h3 className={`text-2xl font-black mt-2 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {title === 'UTILIDAD NETA' ? 'Balance' : ''}
                    </h3>
                </div>
                {isDark ? (
                    <div className="bg-emerald-400 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20">
                        <Wallet className="w-6 h-6 text-emerald-950" />
                    </div>
                ) : (
                    <div className={`p-2 rounded-full ${trendUp ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        {trendUp ? (
                            <ArrowUpCircle className="w-6 h-6 text-emerald-500" />
                        ) : (
                            <ArrowDownCircle className="w-6 h-6 text-red-500" />
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-baseline gap-2">
                <span className={`text-[2.75rem] leading-none font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${Number(value || 0).toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                </span>
                {isDark && (
                    <span className="text-sm font-black text-emerald-200 mb-1">USD</span>
                )}
            </div>

            {(trend || subtitle) && (
                <div className="mt-6 flex items-center gap-3">
                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${trendUp ? 'bg-emerald-100/50 text-emerald-600' : 'bg-red-100/50 text-red-600'
                            }`}>
                            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trend}
                        </div>
                    )}
                    {subtitle && (
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-200/60' : 'text-gray-400'}`}>
                            {subtitle}
                        </span>
                    )}
                </div>
            )}

            {isDark && (
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-24 -mt-24 pointer-events-none blur-3xl" />
            )}
        </div>
    )
}

interface KPIGridProps {
    totalIncome: number
    totalExpenses: number
    totalUtility: number
}

export function DeliveryKPIGrid({ totalIncome, totalExpenses, totalUtility }: KPIGridProps) {
    return (
        <div className="space-y-4 relative overflow-hidden">
            <KPICard
                title="UTILIDAD NETA"
                value={totalUtility}
                variant="emerald"
            />
            <div className="grid grid-cols-2 gap-4">
                <KPICard
                    title="INGRESOS"
                    value={totalIncome}
                    trendUp={true}
                />
                <KPICard
                    title="GASTOS EXTRA"
                    value={totalExpenses}
                    trendUp={false}
                />
            </div>
        </div>
    )
}
