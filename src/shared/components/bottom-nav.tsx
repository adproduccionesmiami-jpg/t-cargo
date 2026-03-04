'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Truck, Receipt, User } from 'lucide-react'

const navItems = [
    { label: 'INICIO', icon: Home, href: '/dashboard' },
    { label: 'VIAJES', icon: Truck, href: '/trips' },
    { label: 'GASTOS', icon: Receipt, href: '/expenses' },
    { label: 'PERFIL', icon: User, href: '/profile' },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            <div className="max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[#f59e0b]' : 'text-gray-400'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
