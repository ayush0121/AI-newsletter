'use client'

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch(`${API_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || 'Something went wrong');

            setStatus('success');
            setMessage('Thanks for subscribing!');
            setEmail('');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to subscribe. Please try again.');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-md mx-auto mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Get the Daily Digest
            </h3>
            <p className="text-gray-500 text-sm mb-4 text-center">
                Join other engineers staying ahead of the curve. No spam, ever.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${status === 'success'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
                </button>
            </form>

            {message && (
                <p className={`mt-3 text-sm text-center ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
