'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieCheck');
        if (!consent) {
            setShow(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cookieCheck', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 text-white z-50 flex flex-col sm:flex-row justify-between items-center sm:space-x-4 shadow-lg opacity-95">
            <div className="text-sm mb-4 sm:mb-0">
                <p>
                    We use cookies to improve your experience. By using our site, you agree to our{' '}
                    <a href="/privacy" className="underline hover:text-blue-300">Privacy Policy</a>.
                </p>
            </div>
            <button
                onClick={accept}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold transition-colors whitespace-nowrap"
            >
                Accept & Close
            </button>
        </div>
    );
}
