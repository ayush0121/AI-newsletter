'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminEmailPage() {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    const supabase = createClient()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

    async function triggerJob() {
        setLoading(true)
        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token

        const res = await fetch(`${API_URL}/admin/email/trigger`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })

        if (res.ok) {
            setMsg("Job triggered successfully! Check logs.")
        } else {
            setMsg("Failed to trigger job.")
        }
        setLoading(false)
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Email Control Center</h2>

            <div className="bg-white shadow rounded-lg p-6 max-w-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Override</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Force run the email dispatch job immediately. This will check for any pending emails (Welcome, Daily Digest, etc.) and send them.
                </p>

                <button
                    onClick={triggerJob}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                >
                    {loading ? 'Triggering...' : 'Trigger Email Job Now'}
                </button>

                {msg && (
                    <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                        {msg}
                    </div>
                )}
            </div>
        </div>
    )
}
