import { Xendit } from "xendit-node";

// Initialize Xendit client
const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || "xnd_public_development_...", // Replace with your actual secret key
});

export interface InvoiceData {
    external_id: string;
    amount: number;
    description: string;
    customer: {
        given_names: string;
        email: string;
    };
    currency?: string;
    payment_methods?: string[];
    success_redirect_url?: string;
    failure_redirect_url?: string;
}

export interface VirtualAccountData {
    external_id: string;
    bank_code: string;
    name: string;
    expected_amount?: number;
    is_closed?: boolean;
    expiration_date?: string;
    is_single_use?: boolean;
}

export interface EwalletChargeData {
    reference_id: string;
    currency: string;
    amount: number;
    checkout_method: string;
    channel_code: string;
    channel_properties: {
        mobile_number?: string;
        success_redirect_url?: string;
        failure_redirect_url?: string;
    };
    metadata?: Record<string, any>;
}

export class XenditService {
    // Create Invoice
    static async createInvoice(data: InvoiceData) {
        try {
            // For now, using a mock implementation due to SDK compatibility issues
            // In production, you would use the actual Xendit API v2
            console.warn("Using mock implementation for invoice creation");

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockInvoice = {
                id: `inv_${Date.now()}`,
                externalId: data.external_id,
                status: "PENDING",
                amount: data.amount,
                description: data.description,
                invoiceUrl: `https://checkout.xendit.co/web/${Date.now()}`,
                expiryDate: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ).toISOString(),
                created: new Date().toISOString(),
                currency: data.currency || "IDR",
                paymentMethod: data.payment_methods || [
                    "CREDIT_CARD",
                    "BCA",
                    "BNI",
                    "BRI",
                    "MANDIRI",
                    "OVO",
                    "DANA",
                    "LINKAJA",
                ],
            };

            return {
                id: mockInvoice.id,
                external_id: mockInvoice.externalId,
                status: mockInvoice.status,
                amount: mockInvoice.amount,
                description: mockInvoice.description,
                invoice_url: mockInvoice.invoiceUrl,
                expiry_date: mockInvoice.expiryDate,
                created: mockInvoice.created,
                currency: mockInvoice.currency,
                payment_methods: mockInvoice.paymentMethod,
            };
        } catch (error) {
            console.error("Error creating invoice:", error);
            throw new Error("Failed to create invoice");
        }
    }

    // Create Virtual Account (Mock implementation - requires Xendit API v2)
    static async createVirtualAccount(data: VirtualAccountData) {
        try {
            // Note: Virtual Account creation requires Xendit API v2
            // This is a mock implementation for demonstration
            console.warn(
                "Virtual Account creation requires Xendit API v2 integration"
            );

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            return {
                id: `va_${Date.now()}`,
                external_id: data.external_id,
                owner_id: data.name,
                bank_code: data.bank_code,
                account_number:
                    Math.floor(Math.random() * 9000000000) + 1000000000,
                status: "ACTIVE",
                created: new Date().toISOString(),
                expected_amount: data.expected_amount,
                expiration_date: data.expiration_date,
            };
        } catch (error) {
            console.error("Error creating virtual account:", error);
            throw new Error("Failed to create virtual account");
        }
    }

    // Create E-wallet Charge (Mock implementation - requires Xendit API v2)
    static async createEwalletCharge(data: EwalletChargeData) {
        try {
            // Note: E-wallet charge creation requires Xendit API v2
            // This is a mock implementation for demonstration
            console.warn(
                "E-wallet charge creation requires Xendit API v2 integration"
            );

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            return {
                id: `ewc_${Date.now()}`,
                reference_id: data.reference_id,
                status: "PENDING",
                amount: data.amount,
                currency: data.currency,
                created: new Date().toISOString(),
                actions: {
                    desktop_web_checkout_url: `https://checkout.xendit.co/web/${Date.now()}`,
                    mobile_web_checkout_url: `https://checkout.xendit.co/web/${Date.now()}`,
                },
            };
        } catch (error) {
            console.error("Error creating e-wallet charge:", error);
            throw new Error("Failed to create e-wallet charge");
        }
    }

    // Get Invoice by ID
    static async getInvoice(invoiceId: string) {
        try {
            const invoice = await xenditClient.Invoice.getInvoiceById({
                invoiceId: invoiceId,
            });

            return invoice;
        } catch (error) {
            console.error("Error getting invoice:", error);
            throw new Error("Failed to get invoice");
        }
    }

    // Get Virtual Account by ID (Mock implementation)
    static async getVirtualAccount(vaId: string) {
        try {
            // Mock implementation
            console.warn(
                "Virtual Account retrieval requires Xendit API v2 integration"
            );

            return {
                id: vaId,
                external_id: `va_${vaId}`,
                status: "ACTIVE",
                account_number: "1234567890",
                bank_code: "BCA",
                created: new Date().toISOString(),
            };
        } catch (error) {
            console.error("Error getting virtual account:", error);
            throw new Error("Failed to get virtual account");
        }
    }

    // Expire Invoice
    static async expireInvoice(invoiceId: string) {
        try {
            const invoice = await xenditClient.Invoice.expireInvoice({
                invoiceId: invoiceId,
            });

            return invoice;
        } catch (error) {
            console.error("Error expiring invoice:", error);
            throw new Error("Failed to expire invoice");
        }
    }

    // Get Payment Methods
    static getAvailablePaymentMethods() {
        return {
            banks: [
                { code: "BCA", name: "Bank Central Asia" },
                { code: "BNI", name: "Bank Negara Indonesia" },
                { code: "BRI", name: "Bank Rakyat Indonesia" },
                { code: "MANDIRI", name: "Bank Mandiri" },
                { code: "PERMATA", name: "Bank Permata" },
                { code: "CIMB", name: "CIMB Niaga" },
                { code: "DANAMON", name: "Bank Danamon" },
            ],
            ewallets: [
                { code: "OVO", name: "OVO" },
                { code: "DANA", name: "DANA" },
                { code: "LINKAJA", name: "LinkAja" },
                { code: "SHOPEEPAY", name: "ShopeePay" },
                { code: "JENIUS", name: "Jenius" },
                { code: "GCASH", name: "GCash" },
            ],
            creditCards: [
                { code: "CREDIT_CARD", name: "Credit Card" },
                { code: "BCA_KLIKPAY", name: "BCA KlikPay" },
                { code: "MANDIRI_CLICKPAY", name: "Mandiri ClickPay" },
                { code: "CIMB_CLICKS", name: "CIMB Clicks" },
            ],
        };
    }
}

export default XenditService;
