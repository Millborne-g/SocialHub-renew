import { NextRequest, NextResponse } from "next/server";
import { XenditService } from "@/lib/xendit";

// Test endpoint for Xendit integration
export async function POST(request: NextRequest) {
    try {
        const { method, data } = await request.json();

        let result;

        switch (method) {
            case "invoice":
                result = await XenditService.createInvoice({
                    external_id: `test_invoice_${Date.now()}`,
                    amount: data.amount || 100000,
                    description: data.description || "Test Invoice",
                    customer: {
                        given_names: data.customerName || "Test User",
                        email: data.customerEmail || "test@example.com",
                    },
                });
                break;

            case "virtual_account":
                result = await XenditService.createVirtualAccount({
                    external_id: `test_va_${Date.now()}`,
                    bank_code: data.bankCode || "BCA",
                    name: data.customerName || "Test User",
                    expected_amount: data.amount || 100000,
                });
                break;

            case "ewallet":
                result = await XenditService.createEwalletCharge({
                    reference_id: `test_ewc_${Date.now()}`,
                    currency: "IDR",
                    amount: data.amount || 100000,
                    checkout_method: "ONE_TIME_PAYMENT",
                    channel_code: data.channelCode || "OVO",
                    channel_properties: {
                        mobile_number: data.mobileNumber || "+6281234567890",
                    },
                });
                break;

            default:
                return NextResponse.json(
                    {
                        error: "Invalid method. Use: invoice, virtual_account, or ewallet",
                    },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            method,
            result,
        });
    } catch (error) {
        console.error("Xendit test error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check if Xendit is configured
export async function GET() {
    const isConfigured = !!process.env.XENDIT_SECRET_KEY;

    return NextResponse.json({
        configured: isConfigured,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
}
