import { NextRequest, NextResponse } from "next/server";
import { XenditService } from "@/lib/xendit";

// Webhook handler for Xendit payment notifications
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Verify webhook signature (in production, you should verify the signature)
        const xenditSignature = request.headers.get("x-xendit-signature");

        // Log the webhook for debugging
        console.log("Xendit Webhook Received:", {
            type: body.type,
            id: body.id,
            status: body.status,
            timestamp: new Date().toISOString(),
        });

        // Handle different webhook types
        switch (body.type) {
            case "invoice.paid":
                await handleInvoicePaid(body);
                break;

            case "invoice.expired":
                await handleInvoiceExpired(body);
                break;

            case "virtual_account.paid":
                await handleVirtualAccountPaid(body);
                break;

            case "ewallet.charge.succeeded":
                await handleEwalletChargeSucceeded(body);
                break;

            case "ewallet.charge.failed":
                await handleEwalletChargeFailed(body);
                break;

            default:
                console.log("Unhandled webhook type:", body.type);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

// Handle invoice payment success
async function handleInvoicePaid(data: any) {
    console.log("Invoice Paid:", {
        invoiceId: data.id,
        externalId: data.external_id,
        amount: data.amount,
        status: data.status,
        paidAt: data.paid_at,
    });

    // Here you would typically:
    // 1. Update your database with payment status
    // 2. Send confirmation email to customer
    // 3. Update order status
    // 4. Trigger fulfillment process

    // Example: Update payment status in your database
    // await updatePaymentStatus(data.external_id, 'PAID', {
    //   paymentId: data.id,
    //   paidAt: data.paid_at,
    //   amount: data.amount,
    // });
}

// Handle invoice expiration
async function handleInvoiceExpired(data: any) {
    console.log("Invoice Expired:", {
        invoiceId: data.id,
        externalId: data.external_id,
        status: data.status,
        expiredAt: data.expired_at,
    });

    // Here you would typically:
    // 1. Update payment status to expired
    // 2. Release reserved inventory
    // 3. Send notification to customer
    // 4. Update order status
}

// Handle virtual account payment
async function handleVirtualAccountPaid(data: any) {
    console.log("Virtual Account Paid:", {
        vaId: data.id,
        externalId: data.external_id,
        accountNumber: data.account_number,
        bankCode: data.bank_code,
        amount: data.amount,
        paidAt: data.paid_at,
    });

    // Here you would typically:
    // 1. Update payment status
    // 2. Process the payment
    // 3. Send confirmation
}

// Handle e-wallet charge success
async function handleEwalletChargeSucceeded(data: any) {
    console.log("E-wallet Charge Succeeded:", {
        chargeId: data.id,
        referenceId: data.reference_id,
        amount: data.amount,
        channelCode: data.channel_code,
        status: data.status,
    });

    // Here you would typically:
    // 1. Update payment status
    // 2. Process the payment
    // 3. Send confirmation
}

// Handle e-wallet charge failure
async function handleEwalletChargeFailed(data: any) {
    console.log("E-wallet Charge Failed:", {
        chargeId: data.id,
        referenceId: data.reference_id,
        amount: data.amount,
        channelCode: data.channel_code,
        status: data.status,
        failureReason: data.failure_reason,
    });

    // Here you would typically:
    // 1. Update payment status to failed
    // 2. Log failure reason
    // 3. Notify customer of failure
    // 4. Offer alternative payment methods
}

// GET endpoint for webhook verification (optional)
export async function GET() {
    return NextResponse.json({
        message: "Xendit webhook endpoint is active",
        timestamp: new Date().toISOString(),
    });
}
