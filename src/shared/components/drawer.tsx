'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
}

export function Drawer({ isOpen, onClose, children, title }: DrawerProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        setMounted(true)
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!mounted) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[70] transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'
                    }`}
            >
                <div className="max-w-md mx-auto bg-white rounded-t-[3rem] shadow-2xl relative">
                    {/* Handle */}
                    <div className="flex justify-center pt-4 pb-2">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                    </div>

                    <div className="px-8 pb-10 pt-4">
                        {title && (
                            <div className="mb-6">
                                <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">{title}</h2>
                                <p className="text-gray-400 text-sm font-bold mt-1">Completa los detalles de la nueva entrada</p>
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}
