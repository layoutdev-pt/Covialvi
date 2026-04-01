import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Resend Webhook] RESEND_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await request.text();

  let event: { type: string; data: Record<string, unknown> };

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch (err) {
    console.error('[Resend Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { type, data } = event;
  console.log(`[Resend Webhook] Event: ${type}`, data);

  switch (type) {
    case 'email.delivered':
      console.log(`[Resend Webhook] Email delivered: ${data.email_id} to ${data.to}`);
      break;

    case 'email.bounced':
      console.warn(`[Resend Webhook] Email bounced: ${data.email_id} to ${data.to}`);
      break;

    case 'email.complained':
      console.warn(`[Resend Webhook] Spam complaint: ${data.email_id} from ${data.to}`);
      break;

    case 'email.opened':
      console.log(`[Resend Webhook] Email opened: ${data.email_id}`);
      break;

    case 'email.clicked':
      console.log(`[Resend Webhook] Link clicked: ${data.email_id}`);
      break;

    default:
      console.log(`[Resend Webhook] Unhandled event type: ${type}`);
  }

  return NextResponse.json({ received: true });
}
