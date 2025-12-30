'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Since we call backend API, we need token.
// The Backend API expects "Authorization: Bearer <supa_token>"
// We can get the session token from supabase client.

export default function SettingsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState('')

    const supabase = createClient()

    // Fetch current state
    // We can fetch from backend /me endpoint (which returns User + EmailSettings)
    // Or simpler: just default false and let user toggle, but better to show real state.

    // Note: Backend /me endpoint is: GET /api/v1/users/me

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
            return
        }

        if (user) {
            const fetchSettings = async () => {
                const session = await supabase.auth.getSession()
                const token = session.data.session?.access_token

                if (!token) return

                try {
                    // We need full URL because client side
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

                    // First get user profile from backend (includes settings in future, or separate call)
                    // Currently GET /me returns just UserSchema. Using PATCH /me/subscription to update.
                    // We didn't make a GET /me/subscription. 
                    // Let's assume default false for now or maybe I should have added GET.
                    // For MVP, allow user to just set it.
                    // Wait, without GET, the UI might show "Unsubscribed" when they are actually subscribed.
                    // It's critical to know.
                    // I'll fetch /users/me and hopefully it includes `email_settings`.
                    // Check UserSchema in backend: `email_settings` is Optional[EmailSettings].

                    const res = await fetch(`${API_URL}/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })

                    if (res.ok) {
                        const data = await res.json()
                        if (data.email_settings) {
                            setIsSubscribed(data.email_settings.is_subscribed)
                        }
                    }
                } catch (e) {
                    console.error(e)
                }
            }
            fetchSettings()
        }
    }, [user, loading, router, supabase])

    const handleToggle = async () => {
        setSaving(true)
        setMsg('')
        try {
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

            const res = await fetch(`${API_URL}/users/me/subscription`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_subscribed: !isSubscribed })
            })

            if (res.ok) {
                const data = await res.json()
                setIsSubscribed(data.is_subscribed)
                setMsg('Preferences updated!')
            } else {
                setMsg('Failed to update.')
            }

        } catch (e) {
            setMsg('Error saving settings.')
            console.error(e)
        }
        setSaving(false)
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 shadow-sm bg-white rounded-lg border border-gray-200 mt-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-lg font-medium text-gray-900">Email Notifications</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Receive a daily digest of the top tech news.
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <span className="flex-grow flex flex-col">
                        <span className="text-sm font-medium text-gray-900">Daily Digest</span>
                        <span className="text-sm text-gray-500">Sent every morning at 8:00 AM UTC</span>
                    </span>

                    <button
                        type="button"
                        onClick={handleToggle}
                        disabled={saving}
                        className={`${isSubscribed ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                    >
                        <span
                            aria-hidden="true"
                            className={`${isSubscribed ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                    </button>
                </div>

                {msg && <p className="text-sm text-indigo-600 font-medium">{msg}</p>}
            </div>
        </div>
    )
}
