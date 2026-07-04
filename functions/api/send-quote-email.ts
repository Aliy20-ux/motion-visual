interface Env {
  RESEND_API_KEY: string;
}

interface QuotePayload {
  name: string;
  email: string;
  phone?: string;
  project_type: string;
  budget: string;
  notes?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;

  let payload: QuotePayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, email, phone, project_type, budget, notes } = payload;

  if (!name?.trim() || !isValidEmail(email ?? '') || !project_type?.trim() || !budget?.trim()) {
    return Response.json({ error: 'Missing or invalid required fields' }, { status: 400 });
  }

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="margin-bottom: 4px;">New project enquiry</h2>
      <p style="color: #666; margin-top: 0;">Submitted via the Motion Visual quote form</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${escapeHtml(phone?.trim() || 'Not provided')}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Project type</td><td style="padding: 8px 0;">${escapeHtml(project_type)}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Package</td><td style="padding: 8px 0;">${escapeHtml(budget)}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Notes</td><td style="padding: 8px 0;">${escapeHtml(notes?.trim() || 'None').replace(/\n/g, '<br>')}</td></tr>
      </table>
    </div>
  `;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Motion Visual Enquiries <admin.team@motion-visual.com>',
      to: ['admin.team@motion-visual.com'],
      reply_to: email,
      subject: `New enquiry: ${name} (${project_type})`,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    return Response.json({ error: 'Failed to send email', detail }, { status: 502 });
  }

  return Response.json({ success: true });
};
