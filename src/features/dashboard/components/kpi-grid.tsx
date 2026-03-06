import { TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

interface KPICardProps {
    title: string
    value: number
    subtitle?: string
    trend?: string
    trendUp?: boolean
    variant?: 'dark' | 'white'
}

function KPICard({ title, value, subtitle, trend, trendUp, variant = 'white' }: KPICardProps) {
    const isDark = variant === 'dark'

    return (
        <div className={isDark ? 'card-dark' : 'card-crextio'}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-[#f59e0b]' : 'text-gray-400'}`}>
                        {title}
                    </p>
                    <h3 className={`text-2xl font-black mt-2 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {title === 'BALANCE TOTAL' ? 'Utilidad' : ''}
                    </h3>
                </div>
                {isDark ? (
                    <div className="bg-[#f59e0b] p-2.5 rounded-2xl shadow-lg shadow-[#f59e0b]/20">
                        <Wallet className="w-6 h-6 text-black" />
                    </div>
                ) : (
                    <div className={`p-2 rounded-full ${trendUp ? 'bg-green-50' : 'bg-red-50'}`}>
                        {trendUp ? (
                            <ArrowUpCircle className="w-6 h-6 text-green-500" />
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
                    <span className="text-sm font-black text-[#f59e0b] mb-1">USD</span>
                )}
            </div>

            {(trend || subtitle) && (
                <div className="mt-6 flex items-center gap-3">
                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${trendUp ? 'bg-green-100/50 text-green-600' : 'bg-red-100/50 text-red-600'
                            }`}>
                            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trend}
                        </div>
                    )}
                    {subtitle && (
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {subtitle}
                        </span>
                    )}
                </div>
            )}

            {isDark && (
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-24 -mt-24 pointer-events-none blur-3xl" />
            )}
        </div>
    )
}

interface KPIGridProps {
    totalIncome: number
    totalExpenses: number
    totalUtility: number
}

export function KPIGrid({ totalIncome, totalExpenses, totalUtility }: KPIGridProps) {
    return (
        <div className="space-y-4">
            <KPICard
                title="BALANCE TOTAL"
                value={totalUtility}
                variant="dark"
            />
            <div className="grid grid-cols-2 gap-4">
                <KPICard
                    title="INGRESOS"
                    value={totalIncome}
                    trendUp={true}
                />
                <KPICard
                    title="GASTOS"
                    value={totalExpenses}
                    trendUp={false}
                />
            </div>
        </div>
    )
}
