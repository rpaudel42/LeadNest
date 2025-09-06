
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

const PRICE_LOOKUP: Record<string, number> = {
  bronze: 29900,
  silver: 49900,
  gold: 99900,
  platinum: 149900,
};

export async function POST(req: Request){
  const { plan } = await req.json();
  if(!plan || !(plan in PRICE_LOOKUP)) return NextResponse.json({ error: 'invalid plan' }, { status: 400 });
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price_data: { currency: 'usd', product_data: { name: `Social Media Agent — ${plan}` }, recurring: { interval: 'month' }, unit_amount: PRICE_LOOKUP[plan] }, quantity: 1 }],
    success_url: process.env.NEXT_PUBLIC_APP_URL + '/onboarding/content-preferences',
    cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/onboarding/subscription',
  });
  return NextResponse.json({ url: session.url });
}
