
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request){
  const sig = req.headers.get('stripe-signature') as string;
  const buf = Buffer.from(await req.arrayBuffer());
  let event: Stripe.Event;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const sb = supabaseServer();

  if(event.type === 'checkout.session.completed'){
    const session = event.data.object as Stripe.Checkout.Session;
    // TODO: map session to business via metadata/email
    // Example: mark latest subscription active for placeholder email if provided
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } } as any;
