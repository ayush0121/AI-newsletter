import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 prose dark:prose-invert">
            <h1>Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

            <h2>1. Introduction</h2>
            <p>
                Welcome to SynapseDigest. We respect your privacy and are committed to protecting your personal data.
                This privacy policy will inform you as to how we look after your personal data when you visit our website
                and tell you about your privacy rights and how the law protects you.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
            <ul>
                <li><strong>Identity Data:</strong> includes username or similar identifier.</li>
                <li><strong>Contact Data:</strong> includes email address for newsletter subscriptions.</li>
                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul>
                <li>To provide you with our daily newsletter.</li>
                <li>To manage your account and subscription preferences.</li>
                <li>To improve our website, products/services, marketing and customer relationships.</li>
                <li>To recommend content that might be of interest to you ("For You" feed).</li>
            </ul>

            <h2>4. Cookies</h2>
            <p>
                We use cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site.
                You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.
            </p>

            <h2>5. Data Security</h2>
            <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
            </p>

            <h2>6. Your Legal Rights</h2>
            <p>
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, or to object to processing.
            </p>

            <h2>7. Contact Us</h2>
            <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at: support@synapsedigest.com.
            </p>
        </div>
    );
}
