'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';

export default function AdminLogsPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            router.push('/');
            return;
        }

        const fetchLogs = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/logs?lines=200`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs);
                }
            } catch (err) {
                console.error("Failed to fetch logs", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
        // Poll every 5 seconds
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, [user, token, router]);

    if (loading) return <div className="p-8">Loading logs...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">System Logs (Live Tail)</h1>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-[600px] overflow-y-auto shadow-xl">
                {logs.length === 0 ? (
                    <p>No logs available or log file not found.</p>
                ) : (
                    logs.map((line, i) => (
                        <div key={i} className="whitespace-pre-wrap hover:bg-gray-800">
                            {line}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
