'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INTERESTS = [
    { id: 'AI', label: 'Artificial Intelligence', icon: '🤖' },
    { id: 'CS', label: 'Computer Science', icon: '💻' },
    { id: 'SE', label: 'Software Engineering', icon: '⚙️' },
    { id: 'Research', label: 'Academic Research', icon: '📚' },
]

export default function OnboardingPage() {
    const [selected, setSelected] = useState<string[]>([])
    const [digest, setDigest] = useState(true)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const toggleInterest = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id))
        } else {
            setSelected([...selected, id])
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

            const res = await fetch(`${API_URL}/users/me/onboarding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    interests: selected,
                    subscribe_digest: digest,
                    marketing_opt_in: digest // simplify for now
                })
            })

            if (res.ok) {
                router.push('/dashboard?welcome=true')
            }
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Customize your feed
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Select the topics you care about most.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* Interests Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {INTERESTS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => toggleInterest(item.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${selected.includes(item.id)
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                                    }`}
                            >
                                <span className="text-2xl mb-2">{item.icon}</span>
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Email Preferences */}
                    <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">Daily Email Digest</span>
                            <span className="text-xs text-gray-500">Get top stories every morning (8am UTC).</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={digest}
                            onChange={(e) => setDigest(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Setting up...' : 'Finish Setup'}
                    </button>
                </div>
            </div>
        </div>
    )
}
