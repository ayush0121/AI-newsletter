'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: User | null
    token: string | null
    loading: boolean
    signOut: () => Promise<void>
    refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    signOut: async () => { },
    refreshSession: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    const refreshSession = async () => {
        const { data } = await supabase.auth.getSession()
        setUser(data.session?.user ?? null)
        setToken(data.session?.access_token ?? null)
        setLoading(false)
    }

    useEffect(() => {
        refreshSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setToken(session?.access_token ?? null)
            setLoading(false)
            if (_event === 'SIGNED_OUT') {
                setUser(null)
                setToken(null)
                router.refresh()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router, supabase])

    const signOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, signOut, refreshSession }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
