import React from 'react';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 prose dark:prose-invert">
            <h1>Terms of Use</h1>
            <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

            <h2>1. Agreement to Terms</h2>
            <p>
                These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and SynapseDigest ("we," "us" or "our"), concerning your access to and use of the SynapseDigest website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
            </p>
            <p>
                You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Use. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
            </p>

            <h2>2. Intellectual Property Rights</h2>
            <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>

            <h2>3. User Representations</h2>
            <p>
                By using the Site, you represent and warrant that:
            </p>
            <ul>
                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                <li>You have the legal capacity and you agree to comply with these Terms of Use.</li>
                <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li>
                <li>You will not use the Site for any illegal or unauthorized purpose.</li>
            </ul>

            <h2>4. Prohibited Activities</h2>
            <p>
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>

            <h2>5. Disclaimer</h2>
            <p>
                The Site is provided on an as-is and as-available basis. You agree that your use of the Site and our services will be at your sole risk. To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the Site and your use thereof.
            </p>
            <p>
                The content provided on SynapseDigest (including AI-generated summaries) is for informational purposes only. We do not guarantee the accuracy, completeness, or usefulness of any information on the Site.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the Site, even if we have been advised of the possibility of such damages.
            </p>

            <h2>7. Governing Law</h2>
            <p>
                These Terms shall be governed by and defined following the laws of India. SynapseDigest and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
            </p>

            <h2>8. Contact Us</h2>
            <p>
                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: terms@synapsedigest.com.
            </p>
        </div>
    );
}
