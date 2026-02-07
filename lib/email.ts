import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

interface Finding {
    source: string;
    summary: string;
    link: string;
}

function getHtmlTemplate(watcherName: string, findings: Finding[]) {
    const findingsHtml = findings.map(f => `
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px;">
            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-top: 0;">
                ${f.summary}
            </p>
            
            <div style="margin-top: 15px;">
                <a href="${f.link}" style="color: #0070f3; text-decoration: none; font-weight: bold; font-size: 14px;">
                    Read more on ${new URL(f.link).hostname.replace('www.', '')} &rarr;
                </a>
            </div>
        </div>
    `).join('');

    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fafafa;">
        <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0;">Let Me Know</h2>
            <p style="color: #666; font-size: 14px; margin: 5px 0 0;">AI Watcher Update: <strong>${watcherName}</strong></p>
        </div>
        
        ${findingsHtml}
        
        <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>Found ${findings.length} new update${findings.length === 1 ? '' : 's'}.</p>
        </div>
    </div>
    `;
}

export async function sendNotification(to: string, watcherName: string, findings: Finding[]) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not set. Skipping email.');
        return { messageId: 'simulated-no-creds' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Let Me Know AI" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to,
            subject: `🔔 New Updates: ${watcherName} (${findings.length})`,
            headers: {
                'X-Priority': '1', // High priority
                'X-MSMail-Priority': 'High',
                'Importance': 'High'
            },
            html: getHtmlTemplate(watcherName, findings),
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        return null;
    }
}
