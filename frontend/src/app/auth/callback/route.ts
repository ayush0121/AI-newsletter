import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // Default to onboarding for new signups
    // Ideally, we check in DB if onboarding is complete.
    // For now, let's just default to /, and Frontend will check state.
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Check if user is onboarded?
            // We can't easily check backend API here without adding complexity.
            // Better Strategy: Redirect to /dashboard which checks "is_onboarded" and redirects to /onboarding if needed.
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
