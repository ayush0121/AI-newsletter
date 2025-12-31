'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch(`${API_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error('Failed');
            setStatus('success');
            setEmail('');
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <footer className="bg-black text-white py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">

                    {/* Column 1: Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative w-8 h-8">
                                <Image
                                    src="/logo-v2.png"
                                    alt="SynapseDigest Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold text-white">
                                SynapseDigest
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Get the latest AI news, understand why it matters, and learn how to apply it in your work. Join engineers from companies like Google, Meta, and OpenAI.
                        </p>
                        <p className="text-gray-500 text-xs mt-8">
                            &copy; {new Date().getFullYear()} SynapseDigest.
                        </p>
                    </div>

                    {/* Column 2: Navigation */}
                    <div>
                        <h4 className="font-bold mb-4 text-white">Home</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="/archive" className="hover:text-white transition-colors">Posts</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Publications / Categories */}
                    <div>
                        <h4 className="font-bold mb-4 text-white">Publications</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/news/ai" className="hover:text-white transition-colors">Synapse AI</Link></li>
                            <li><Link href="/news/se" className="hover:text-white transition-colors">Synapse Engineering</Link></li>
                            <li><Link href="/news/research" className="hover:text-white transition-colors">Synapse Research</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Subscribe & Socials */}
                    <div>
                        <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                            <div className="flex rounded-md shadow-sm">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter Your Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || status === 'success'}
                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white 
                                        ${status === 'success' ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} 
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                >
                                    {status === 'loading' ? '...' : status === 'success' ? 'Done' : 'Subscribe'}
                                </button>
                            </div>
                            {status === 'error' && <p className="text-xs text-red-400">Something went wrong. Try again.</p>}
                        </form>

                        <div className="mt-6">
                            <button
                                onClick={() => window.open(`${API_URL}/newsletter/download-pdf`, '_blank')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 hover:border-gray-500 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-all bg-gray-900/50 hover:bg-gray-800"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Daily PDF
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mt-8">
                            <SocialIcon href="#" label="X">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </SocialIcon>
                            <SocialIcon href="#" label="LinkedIn">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </SocialIcon>
                            <SocialIcon href="#" label="Instagram">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </SocialIcon>
                        </div>

                        <div className="mt-8 flex gap-4 text-xs text-gray-500">
                            <Link href="/privacy" className="hover:text-gray-300">Privacy policy</Link>
                            <Link href="/terms" className="hover:text-gray-300">Terms of use</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ href, children, label }: { href: string, children: React.ReactNode, label: string }) {
    return (
        <a href={href} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors" aria-label={label}>
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                {children}
            </svg>
        </a>
    )
}
