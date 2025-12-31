'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Star {
    x: number;
    y: number;
    z: number;
    opacity: number;
}

export default function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let stars: Star[] = [];
        let animationFrameId: number;
        let width = 0;
        let height = 0;

        // Configuration
        const STAR_COUNT = 400; // Number of stars
        const SPEED = 0.5; // Base speed

        // Initialize stars
        const initStars = () => {
            stars = [];
            for (let i = 0; i < STAR_COUNT; i++) {
                stars.push({
                    x: Math.random() * width - width / 2,
                    y: Math.random() * height - height / 2,
                    z: Math.random() * width, // depth
                    opacity: Math.random(),
                });
            }
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initStars();
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        const draw = () => {
            // Determine colors based on theme
            const isDark = resolvedTheme === 'dark'; // Default to dark behavior if undefined
            const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50'; // Handled by CSS class usually, but canvas needs explicit clear
            const starColor = isDark ? '255, 255, 255' : '79, 70, 229'; // White in dark, Indigo in light

            // Clear canvas (transparent to let CSS bg show through if needed, or fill)
            ctx.clearRect(0, 0, width, height);

            // Center of screen
            const cx = width / 2;
            const cy = height / 2;

            stars.forEach((star) => {
                // Move star closer
                star.z -= SPEED * 2; // Increase speed mainly

                // Reset if too close
                if (star.z <= 0) {
                    star.z = width;
                    star.x = Math.random() * width - width / 2;
                    star.y = Math.random() * height - height / 2;
                }

                // Project 3D position to 2D
                const k = 128.0 / star.z;
                const px = star.x * k + cx;
                const py = star.y * k + cy;

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    const size = (1 - star.z / width) * 2.5; // Size based on closeness
                    const opacity = (1 - star.z / width); // Fade in as it gets closer

                    ctx.beginPath();
                    ctx.fillStyle = `rgba(${starColor}, ${opacity})`;
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [resolvedTheme]);

    // CSS handling for background color behind the canvas
    const bgClass = resolvedTheme === 'dark'
        ? 'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black'
        : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white';

    return (
        <div className={`fixed inset-0 z-[-1] transition-colors duration-500 pointer-events-none ${bgClass}`}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block w-full h-full"
            />
        </div>
    );
}
