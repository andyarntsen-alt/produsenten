import React, { useState } from 'react';
import type { Brand } from '../../App';

interface ExportTabProps {
    brand: Brand;
}

const ExportTab: React.FC<ExportTabProps> = ({ brand }) => {
    const [email, setEmail] = useState('');
    const hasResendKey = !!import.meta.env.VITE_RESEND_API_KEY;

    // Prepare content for CSV/Copy (only approved tweets, or all if none approved)
    const approvedTweets = brand.posts.filter(t => t.status === 'approved');
    const tweetsForExport = approvedTweets.length > 0 ? approvedTweets : brand.posts;
    const batchText = tweetsForExport.map(t => t.text).join('\n\n');

    const exportCSV = () => {
        const header = "Platform,Date,Hook,Body,FormatType,MediaIdea,Status";
        const rows = tweetsForExport.map(t => {
            const platform = "Twitter";
            const date = t.date ? t.date : '';
            const hook = `"${(t.hook || '').replace(/"/g, '""')}"`;
            const body = `"${t.text.replace(/"/g, '""')}"`;
            const format = t.formatType || '';
            const mediaIdea = `"${(t.mediaIdea || '').replace(/"/g, '""')}"`;
            const status = t.status;
            return `${platform},${date},${hook},${body},${format},${mediaIdea},${status}`;
        });
        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${brand.name}-tweets.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const copyAll = () => {
        navigator.clipboard.writeText(batchText)
            .then(() => alert('Alle tweets kopiert til utklippstavlen!'))
            .catch(err => console.error('Clipboard copy failed', err));
    };

    const sendEmail = async () => {
        if (!email) {
            alert('Angi en e-postadresse.');
            return;
        }
        try {
            const content = tweetsForExport.map((t, i) => `${i + 1}. ${t.text}`).join('\n\n');
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: `${brand.name} <onboarding@resend.dev>`,
                    to: [email],
                    subject: `${brand.name} - Twitter innholdsplan`,
                    text: `Her er dine genererte tweets:\n\n${content}`
                })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Email sending failed');
            }
            alert('E-post sendt til ' + email);
            setEmail('');
        } catch (err) {
            console.error('Email send failed:', err);
            alert('Kunne ikke sende e-post. Sjekk VITE_RESEND_API_KEY og e-postadresse.');
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-serif italic text-brand-text mb-2">Eksport</h3>
                <p className="text-brand-text/60 font-sans font-light">Last ned innholdet ditt eller send det direkte på e-post.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Download/Copy Section */}
                <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <h4 className="text-lg font-medium text-brand-text mb-6">Last ned & Kopier</h4>
                    <div className="flex flex-col gap-3">
                        <button onClick={exportCSV} className="w-full bg-gray-50 hover:bg-gray-100 text-brand-text font-sans font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2">
                            <span>📄</span> Last ned CSV
                        </button>
                        <button onClick={copyAll} className="w-full bg-gray-50 hover:bg-gray-100 text-brand-text font-sans font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2">
                            <span>📋</span> Kopier til utklippstavle
                        </button>
                    </div>
                </div>

                {/* Email Section */}
                {hasResendKey && (
                    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <h4 className="text-lg font-medium text-brand-text mb-6">Send til E-post</h4>
                        <div className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Din e-postadresse"
                                className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 text-brand-text text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all"
                            />
                            <button onClick={sendEmail} className="w-full bg-brand-text text-white hover:bg-brand-gold font-sans uppercase tracking-wider text-xs py-4 rounded-full transition-colors shadow-lg">
                                Send Innhold
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportTab;
