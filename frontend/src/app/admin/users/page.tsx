'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token

        const res = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            setUsers(await res.json())
        }
        setLoading(false)
    }

    async function promoteUser(userId: string) {
        if (!confirm("Promote this user to Admin?")) return;
        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token

        const res = await fetch(`${API_URL}/admin/users/${userId}/promote`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            alert("User promoted!")
            fetchUsers()
        } else {
            alert("Failed to promote")
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">User Management</h2>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{u.email}</div>
                                    <div className="text-sm text-gray-500">{u.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {u.is_subscribed ? 'Yes' : 'No'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {u.role !== 'admin' && (
                                        <button onClick={() => promoteUser(u.id)} className="text-indigo-600 hover:text-indigo-900">Promote</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
