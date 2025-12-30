'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
    total_users: number
    articles_today: number
    active_subscribers: number
    errors_today: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null)

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient()
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

            const res = await fetch(`${API_URL}/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setStats(await res.json())
            }
        }
        fetchStats()
    }, [])

    if (!stats) return <div>Loading stats...</div>

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">System Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Users" value={stats.total_users} color="bg-blue-500" />
                <StatCard title="Articles Today" value={stats.articles_today} color="bg-green-500" />
                <StatCard title="Active Subscribers" value={stats.active_subscribers} color="bg-purple-500" />
                <StatCard title="Errors (24h)" value={stats.errors_today} color="bg-red-500" />
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Run Ingestion Manually</button>
                    <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Force Email Send</button>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
                        {/* Icon placeholder */}
                        <div className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd>
                                <div className="text-lg font-medium text-gray-900">{value}</div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}
