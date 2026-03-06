'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'

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
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
            {/* Fondo con Imagen Hero (Volvo Truck) */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/login-truck.jpg"
                    alt="Volvo Truck"
                    className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90" />
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />
            </div>

            {/* Tarjeta de Login (Glassmorphism) */}
            <div className="relative z-10 w-full max-w-[420px] px-6 animate-in fade-in zoom-in duration-700">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl ring-1 ring-white/5 space-y-10">

                    {/* Header del Formulario */}
                    <div className="text-center space-y-3">
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase mb-1">
                            Control de Acceso
                        </h1>
                        <div className="h-1 w-12 bg-amber-500 mx-auto rounded-full" />
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            Gestión Logística • Operación Interna
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-5">Correo Electrónico</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="usuario@dominio.com"
                                    required
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-full py-4 sm:py-5 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all placeholder:text-slate-600"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Contraseña</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-full py-4 sm:py-5 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all placeholder:text-slate-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider text-center animate-in shake duration-500">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-black py-4 sm:py-5 px-8 rounded-full transition-all active:scale-[0.97] shadow-xl shadow-amber-500/10 disabled:opacity-50"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-3 text-sm uppercase tracking-widest">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Entrar al Sistema</span>
                                        <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] leading-relaxed">
                            Operación Privada • Acceso Restringido
                        </p>
                    </div>
                </div>
            </div>

            {/* Sutil Branding Exterior - Solo visible en tablets/desktop para no estorbar en móvil */}
            <div className="hidden sm:block absolute bottom-8 text-center w-full z-10">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
                    Plataforma Logística 2026
                </p>
            </div>
        </div>
    )
}
