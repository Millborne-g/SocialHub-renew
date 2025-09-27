import { NextRequest, NextResponse } from "next/server";
import { XenditService } from "@/lib/xendit";

// Example endpoint specifically for GCash payments
export async function POST(request: NextRequest) {
    try {
        const { amount, customerName, customerEmail, mobileNumber } =
            await request.json();

        // Validate required fields
        if (!amount || !customerName || !customerEmail || !mobileNumber) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields: amount, customerName, customerEmail, mobileNumber",
                },
                { status: 400 }
            );
        }

        // Create GCash charge
        const gcashCharge = await XenditService.createEwalletCharge({
            reference_id: `gcash_${Date.now()}`,
            currency: "PHP", // Philippine Peso
            amount: parseInt(amount),
            checkout_method: "ONE_TIME_PAYMENT",
            channel_code: "GCASH",
            channel_properties: {
                mobile_number: mobileNumber, // Must be Philippine mobile number format
                success_redirect_url: `${
                    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
                }/sample?success=true`,
                failure_redirect_url: `${
                    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
                }/sample?error=true`,
            },
            metadata: {
                customer_name: customerName,
                customer_email: customerEmail,
                payment_method: "GCash",
            },
        });

        return NextResponse.json({
            success: true,
            message: "GCash payment created successfully",
            data: {
                charge_id: gcashCharge.id,
                reference_id: gcashCharge.reference_id,
                amount: gcashCharge.amount,
                currency: gcashCharge.currency,
                status: gcashCharge.status,
                actions: gcashCharge.actions,
                created: gcashCharge.created,
            },
        });
    } catch (error) {
        console.error("GCash payment error:", error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create GCash payment",
            },
            { status: 500 }
        );
    }
}

// GET endpoint with GCash information
export async function GET() {
    return NextResponse.json({
        message: "GCash Payment Integration",
        supported_country: "Philippines",
        currency: "PHP",
        channel_code: "GCASH",
        mobile_number_format: "+639XXXXXXXXX",
        example: {
            amount: 1000, // 10.00 PHP
            mobile_number: "+639171234567",
            customer_name: "Juan Dela Cruz",
            customer_email: "juan@example.com",
        },
        documentation: "https://docs.xendit.co/docs/ewallet-gcash",
    });
}
