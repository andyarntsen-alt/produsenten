import React, { useState } from 'react';
import type { Brand } from '../../App';
import { useToast } from '../ToastContext';

interface ExportTabProps {
    brand: Brand;
}

const ExportTab: React.FC<ExportTabProps> = ({ brand }) => {
    const { showToast } = useToast();
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
            .then(() => showToast('Alle tweets kopiert til utklippstavlen!', 'success'))
            .catch(err => console.error('Clipboard copy failed', err));
    };

    // Export as JSON
    const exportJSON = () => {
        const data = {
            brand: brand.name,
            exportedAt: new Date().toISOString(),
            posts: tweetsForExport.map(t => ({
                text: t.text,
                hook: t.hook,
                formatType: t.formatType,
                status: t.status,
                date: t.date,
                mediaIdea: t.mediaIdea,
                linkedInPost: t.linkedInPost,
            }))
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${brand.name}-posts.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('JSON eksportert!', 'success');
    };

    // Export as Markdown
    const exportMarkdown = () => {
        const md = `# ${brand.name} - Innholdsplan\n\nEksportert: ${new Date().toLocaleDateString('nb-NO')}\n\n---\n\n` +
            tweetsForExport.map((t, i) => {
                let content = `## Post ${i + 1}\n\n`;
                if (t.date) content += `**Dato:** ${t.date}\n\n`;
                if (t.formatType) content += `**Type:** ${t.formatType}\n\n`;
                content += `${t.text}\n\n`;
                if (t.linkedInPost) content += `### LinkedIn-versjon\n\n${t.linkedInPost}\n\n`;
                if (t.mediaIdea) content += `*Bilde-idé: ${t.mediaIdea}*\n\n`;
                content += `---\n\n`;
                return content;
            }).join('');

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${brand.name}-posts.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Markdown eksportert!', 'success');
    };

    // Export as plain text
    const exportPlainText = () => {
        const text = tweetsForExport.map((t, i) => {
            let content = `--- POST ${i + 1} ---\n`;
            if (t.date) content += `Dato: ${t.date}\n`;
            content += `\n${t.text}\n`;
            return content;
        }).join('\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${brand.name}-posts.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Tekstfil eksportert!', 'success');
    };

    // Export as HTML table
    const exportHTML = () => {
        const html = `<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <title>${brand.name} - Innholdsplan</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; }
        h1 { color: #1a1a1a; }
        table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #f5f5f5; }
        tr:nth-child(even) { background: #fafafa; }
        .status-approved { color: green; font-weight: bold; }
        .status-draft { color: gray; }
    </style>
</head>
<body>
    <h1>${brand.name} - Innholdsplan</h1>
    <p>Eksportert: ${new Date().toLocaleDateString('nb-NO')}</p>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Dato</th>
                <th>Innhold</th>
                <th>Type</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${tweetsForExport.map((t, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${t.date || '-'}</td>
                <td>${t.text.replace(/\n/g, '<br>')}</td>
                <td>${t.formatType || '-'}</td>
                <td class="status-${t.status}">${t.status}</td>
            </tr>`).join('')}
        </tbody>
    </table>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${brand.name}-posts.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('HTML eksportert!', 'success');
    };

    const sendEmail = async () => {
        if (!email) {
            showToast('Angi en e-postadresse.', 'warning');
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
            showToast('E-post sendt til ' + email, 'success');
            setEmail('');
        } catch (err) {
            console.error('Email send failed:', err);
            showToast('Kunne ikke sende e-post. Sjekk e-postadresse.', 'error');
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
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={exportCSV} className="bg-gray-50 hover:bg-gray-100 text-brand-text font-sans font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2">
                            <span>📊</span> CSV
                        </button>
                        <button onClick={exportJSON} className="bg-gray-50 hover:bg-gray-100 text-brand-text font-sans font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2">
                            <span>📦</span> JSON
                        </button>
                        <button onClick={exportMarkdown} className="bg-gray-50 hover:bg-gray-100 text-brand-text font-sans font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2">
                            <span>📝</span> Markdown
                        </button>
                        <button onClick={exportPlainText} className="bg-gray-50 hover:bg-gray-100 text-brand-text font-sans font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2">
                            <span>📄</span> Tekst
                        </button>
                        <button onClick={exportHTML} className="bg-gray-50 hover:bg-gray-100 text-brand-text font-sans font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2">
                            <span>🌐</span> HTML
                        </button>
                        <button onClick={copyAll} className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold font-sans font-medium py-3 px-4 rounded-lg border border-brand-gold/30 transition-colors flex items-center justify-center gap-2">
                            <span>📋</span> Kopier
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 text-center">
                        {tweetsForExport.length} {approvedTweets.length > 0 ? 'godkjente' : ''} poster vil eksporteres
                    </p>
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
