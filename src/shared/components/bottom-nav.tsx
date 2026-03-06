'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Home, Truck, Search } from 'lucide-react'
import { Suspense } from 'react'

const navItems = [
    { label: 'INICIO', icon: Home, href: '/dashboard' },
    { label: 'VIAJES', icon: Truck, href: '/dashboard?filter=todo' },
    { label: 'BUSCAR', icon: Search, href: '/dashboard?search=active' },
]

export function BottomNav() {
    return (
        <Suspense fallback={null}>
            <BottomNavContent />
        </Suspense>
    )
}

function BottomNavContent() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentFilter = searchParams.get('filter')

    const isItemActive = (href: string) => {
        if (href === '/dashboard' && !href.includes('?')) {
            return pathname === '/dashboard' && !currentFilter && !searchParams.get('search')
        }
        if (href === '/dashboard?filter=todo') {
            return pathname === '/dashboard' && currentFilter === 'todo'
        }
        if (href === '/dashboard?search=active') {
            return pathname === '/dashboard' && searchParams.get('search') === 'active'
        }
        return pathname === href
    }
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            <div className="max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                {navItems.map((item) => {
                    const isActive = isItemActive(item.href)
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
