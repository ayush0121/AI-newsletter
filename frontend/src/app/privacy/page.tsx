export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose prose-indigo">
                <p>Last updated: December 30, 2025</p>

                <h3>1. Introduction</h3>
                <p>
                    Welcome to TechPulse ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy.
                    If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information,
                    please contact us at support@techpulse.dev.
                </p>

                <h3>2. Information We Collect</h3>
                <p>
                    We collect personal information that you voluntarily provide to us when you register on the website,
                    express an interest in obtaining information about us or our products and services, when you participate in activities on the website
                    or otherwise when you contact us.
                </p>
                <ul>
                    <li><strong>Personal Information Provided by You:</strong> We collect names; email addresses; and passwords.</li>
                </ul>

                <h3>3. How We Use Your Information</h3>
                <p>
                    We use personal information collected via our website for a variety of business purposes described below.
                    We process your personal information for these purposes in reliance on our legitimate business interests,
                    in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                </p>
                <ul>
                    <li>To send you our daily newsletter (if opted in).</li>
                    <li>To facilitate account creation and logon process.</li>
                    <li>To send administrative information to you.</li>
                </ul>

                <h3>4. Sharing Your Information</h3>
                <p>
                    We only share information with the following third parties:
                </p>
                <ul>
                    <li><strong>Email Service Providers:</strong> Resend (for delivering newsletters).</li>
                    <li><strong>Authentication Services:</strong> Supabase (for secure login).</li>
                </ul>

                <h3>5. Contact Us</h3>
                <p>If you have questions or comments about this policy, you may email us at support@techpulse.dev.</p>
            </div>
        </div>
    )
}
