// app/api/stripe/webhook/route.ts
import Stripe from "stripe";

export const runtime = "nodejs";           // ensure Node (not Edge)
export const dynamic = "force-dynamic";    // webhooks shouldn't be cached

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20", // or your version
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    const body = await req.text(); // raw body in App Router
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // ... your logic
      break;
    }
    // add other cases you handle
    default:
      // optional: log unhandled event types
      break;
  }

  return new Response("OK", { status: 200 });
}
