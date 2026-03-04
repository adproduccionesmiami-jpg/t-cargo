'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) throw authError

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-sm space-y-8 px-4">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-3xl mb-4 shadow-lg shadow-primary/20">
                    <LogIn className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bienvenido a T-Cargo</h1>
                <p className="text-gray-500">Control logístico y financiero premium</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            className="w-full bg-white border-black/5 rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            required
                            className="w-full bg-white border-black/5 rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium border border-red-100 italic">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-crextio group"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            Iniciar Sesión
                            <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    )}
                </button>
            </form>

            <div className="text-center text-xs text-gray-400 font-medium">
                T-Cargo © 2026 • Operación Interna Confirmada
            </div>
        </div>
    )
}
