'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        async function checkAdmin() {
            if (loading) return
            if (!user) {
                router.push('/login')
                return
            }

            // Verify role from backend (source of truth)
            // Or Supabase metadata if we trusted it, but we store role in public.users
            const supabase = createClient()
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token

            if (!token) return

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
                // Fetch /users/me to get role
                const res = await fetch(`${API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.role === 'admin') {
                        setIsAdmin(true)
                    } else {
                        router.push('/dashboard') // Not authorized
                    }
                } else {
                    router.push('/login')
                }
            } catch (e) {
                console.error(e)
                router.push('/')
            } finally {
                setChecking(false)
            }
        }

        checkAdmin()
    }, [user, loading, router])

    if (loading || checking) {
        return <div className="min-h-screen flex items-center justify-center">Verifying privileges...</div>
    }

    if (!isAdmin) return null // Should have redirected

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white min-h-screen flex-shrink-0">
                <div className="p-4 border-b border-gray-800">
                    <h1 className="text-xl font-bold">Admin Console</h1>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href="/admin" className="block py-2 px-4 rounded hover:bg-gray-800 transition">Dashboard</Link>
                    <Link href="/admin/users" className="block py-2 px-4 rounded hover:bg-gray-800 transition">Users</Link>
                    <Link href="/admin/content" className="block py-2 px-4 rounded hover:bg-gray-800 transition">Content</Link>
                    <div className="border-t border-gray-800 my-4"></div>
                    <Link href="/" className="block py-2 px-4 rounded hover:bg-gray-800 transition text-gray-400">Back to Site</Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    )
}
