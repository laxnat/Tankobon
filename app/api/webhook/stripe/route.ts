// app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    
    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header"}, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature"}, { status: 400 });
    }

    // All 3 cases use the Stripe customer ID to look up the user
    const customerId = (event.data.object as { customer?: string }).customer ?? null;

    switch (event.type) {
        case "checkout.session.completed":
        case "invoice.paid":
            // Payment succeeded - grant premium
            if (customerId) {
                await prisma.user.update({
                    where: { stripeCustomerId: customerId },
                    data: { isPremium: true },
                });
            }
            break;
        
        case "invoice.payment_failed":
        case "customer.subscription.deleted":
            // Payment failed or subscription cancelled - revoke premium
            if (customerId) {
                await prisma.user.update({
                    where: { stripeCustomerId: customerId },
                    data: { isPremium: false },
                });
            }
            break;
    }

    // Always return 200 - if you return an error, Stripe will retry repeatedly
    return new NextResponse(null, { status: 200 });
}