'use client'

import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import NewsletterForm from './NewsletterForm';
import NotificationBell from './NotificationBell';

import ThemeToggle from './ThemeToggle';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';



export default function Header() {
    const { user, token, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<{ reputation: number } | null>(null);

    // Fetch user profile stats
    useEffect(() => {
        if (user && token) {
            console.log("Fetching user profile...");
            fetch(`${API_URL}/api/v1/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error(`Status: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    console.log("Profile loaded:", data);
                    setUserProfile(data);
                })
                .catch(err => console.error("Failed to fetch profile", err));
        }
    }, [user, token]);

    const newsCategories = [
        { name: 'All News', path: '/archive' },
        { name: 'AI', path: '/news/ai' },
        { name: 'CS', path: '/news/cs' },
        { name: 'Software Eng', path: '/news/se' },
        { name: 'Research', path: '/news/research' },
    ];

    return (
        <>
            <header className="border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-20 transition-all duration-300">
                        <div className="flex-shrink-0 flex items-center gap-4">
                            {/* Hamburger Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 focus:outline-none ${isMenuOpen ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                <span className="sr-only">Open main menu</span>
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                            </button>

                            <Link href="/" className="flex items-center gap-2.5 group">
                                <div className="relative w-9 h-9 transition-transform group-hover:scale-105 duration-200">
                                    <Image
                                        src="/logo-v2.png"
                                        alt="SynapseDigest Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 animate-gradient hidden sm:block">
                                    SynapseDigest
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation - News Categories Only */}
                        <nav className="hidden md:flex space-x-1 items-center bg-gray-50/50 dark:bg-gray-800/50 p-1 rounded-full border border-gray-100 dark:border-gray-700">
                            {newsCategories.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3 sm:gap-4">
                            {user && <NotificationBell />}
                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Subscribe Button */}
                            <button
                                onClick={() => setIsSubscribeOpen(true)}
                                className="hidden sm:flex items-center gap-2 bg-gray-900 dark:bg-indigo-600 text-white hover:bg-gray-800 dark:hover:bg-indigo-500 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span>Subscribe</span>
                            </button>

                            {/* User Section */}
                            {user ? (
                                <div className="relative pl-3 border-l border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-3 focus:outline-none group"
                                    >
                                        <div className="hidden sm:flex flex-col items-end">
                                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Signed in as</span>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[120px] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.email?.split('@')[0]}</span>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border-2 border-white dark:border-gray-800 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200 ring-2 ring-transparent group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900/30">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                    </button>

                                    {/* User Dropdown */}
                                    {isUserMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 border border-gray-100 dark:border-gray-700 py-1 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-100">
                                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 sm:hidden">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</p>
                                                </div>

                                                <div className="p-1">
                                                    <button
                                                        onClick={() => {
                                                            signOut();
                                                            setIsUserMenuOpen(false);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Sign out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 pl-2 sm:pl-4 sm:border-l sm:border-gray-200 dark:border-gray-700">
                                    <Link
                                        href="/login"
                                        className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="hidden sm:block bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-lg"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dropdown Menu - ONLY Bookmarks & Auth */}
                {isMenuOpen && (
                    <div className="absolute top-full left-4 z-50 pt-2 w-64">
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 ring-1 ring-black/5 overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-2 duration-200 origin-top-left">
                            <div className="p-2 space-y-1">
                                <Link
                                    href="/bookmarks"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-gray-700/50 transition-all duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    My Bookmarks
                                </Link>

                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        setIsSubscribeOpen(true);
                                    }}
                                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-gray-700/50 transition-all duration-200 sm:hidden"
                                >
                                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    Subscribe
                                </button>
                            </div>

                            <div className="bg-gray-50/80 dark:bg-gray-900/50 p-2 border-t border-gray-100 dark:border-gray-700">
                                {user ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                signOut();
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href="/login"
                                            className="flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Subscribe Modal (with Dark Mode support) */}
            {isSubscribeOpen && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">

                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 transition-opacity backdrop-blur-sm"
                            onClick={() => setIsSubscribeOpen(false)}
                        ></div>

                        {/* Modal Panel */}
                        <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-2xl transition-all w-full max-w-lg sm:p-6 border border-gray-200 dark:border-gray-700">

                            {/* Close Button */}
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                    type="button"
                                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                    onClick={() => setIsSubscribeOpen(false)}
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="mt-2">
                                <NewsletterForm />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
