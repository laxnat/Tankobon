// app/api/portal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { error } from "console";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Re-read from DB - never trust the client with stripeCustomerId
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
        // Free user who never started a checkout - no portal to open
        return NextResponse.json({ error: "No subscription found "}, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        // After they're done in the portal, Stripe sends them back here
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`
    })

    return NextResponse.json({ url: portalSession.url })
}
