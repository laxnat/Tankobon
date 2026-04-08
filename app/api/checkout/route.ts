// app/api/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { error } from "console";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const priceId = process.env.STRIPE_PRICE_ID;

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, stripeCustomerId: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found"}, {status: 404});
    }
    let customerId = user.stripeCustomerId;

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: session.user.email,
        });
        customerId = customer.id;

        await prisma.user.update({
            where: { id: user.id },
            data : { stripeCustomerId: customerId},
        });
    }

    const stripeSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price: priceId,
            // For usage-based billing, don't pass quantity
            quantity: 1
          }
        ],
        // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
        // the actual Session ID is returned in the query parameter when your customer
        // is redirected to the success page.
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,                                                       
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`, 
    });
      
    // Redirect to the URL returned on the Checkout Session.
    // With express, you can redirect with:
    //   res.redirect(303, session.url);
    return NextResponse.json({ url: stripeSession.url }, { status: 201 });
}