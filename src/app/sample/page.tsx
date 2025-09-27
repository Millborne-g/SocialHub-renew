"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    Wallet3,
    Bank,
    TickCircle,
    CloseCircle,
    Clock,
    ArrowRight,
    MoneySend,
    Shield,
} from "iconsax-reactjs";
import toast from "react-hot-toast";

import { XenditService } from "@/lib/xendit";

// Use real Xendit service or fallback to mock for demo
const useRealXendit =
    process.env.NODE_ENV === "production" && process.env.XENDIT_SECRET_KEY;

const mockXendit = {
    createInvoice: async (data: any) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
            id: `inv_${Date.now()}`,
            external_id: data.external_id,
            status: "PENDING",
            amount: data.amount,
            description: data.description,
            invoice_url: `https://checkout.xendit.co/web/${Date.now()}`,
            expiry_date: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            ).toISOString(),
            created: new Date().toISOString(),
        };
    },
    createVirtualAccount: async (data: any) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
            id: `va_${Date.now()}`,
            external_id: data.external_id,
            owner_id: data.owner_id,
            bank_code: data.bank_code,
            account_number: Math.floor(Math.random() * 9000000000) + 1000000000,
            status: "ACTIVE",
            created: new Date().toISOString(),
        };
    },
    createEwalletCharge: async (data: any) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
            id: `ewc_${Date.now()}`,
            external_id: data.external_id,
            business_id: data.business_id,
            amount: data.amount,
            status: "PENDING",
            created: new Date().toISOString(),
        };
    },
};

interface PaymentMethod {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    popular?: boolean;
}

interface PaymentResult {
    id: string;
    type: string;
    status: string;
    amount: number;
    description: string;
    created: string;
    details?: any;
}

const Sample = () => {
    const [selectedMethod, setSelectedMethod] = useState<string>("");
    const [amount, setAmount] = useState<string>("100000");
    const [description, setDescription] = useState<string>("Sample Payment");
    const [customerName, setCustomerName] = useState<string>("");
    const [customerEmail, setCustomerEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
        null
    );
    const [paymentHistory, setPaymentHistory] = useState<PaymentResult[]>([]);

    const paymentMethods: PaymentMethod[] = [
        {
            id: "invoice",
            name: "Invoice Payment",
            icon: <Card size="24" />,
            description: "Pay via credit card, bank transfer, or e-wallet",
            popular: true,
        },
        {
            id: "virtual_account",
            name: "Virtual Account",
            icon: <Bank size="24" />,
            description: "Generate virtual account for bank transfer",
        },
        {
            id: "ewallet",
            name: "E-Wallet",
            icon: <Wallet3 size="24" />,
            description: "Pay using OVO, DANA, LinkAja, or other e-wallets",
        },
    ];

    const banks = [
        { code: "BCA", name: "Bank Central Asia" },
        { code: "BNI", name: "Bank Negara Indonesia" },
        { code: "BRI", name: "Bank Rakyat Indonesia" },
        { code: "MANDIRI", name: "Bank Mandiri" },
        { code: "PERMATA", name: "Bank Permata" },
    ];

    const ewalletProviders = [
        { code: "OVO", name: "OVO" },
        { code: "DANA", name: "DANA" },
        { code: "LINKAJA", name: "LinkAja" },
        { code: "SHOPEEPAY", name: "ShopeePay" },
        { code: "GCASH", name: "GCash" },
    ];

    const handlePayment = async () => {
        if (!selectedMethod || !amount || !customerName || !customerEmail) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            let result: PaymentResult;

            switch (selectedMethod) {
                case "invoice":
                    const invoiceData = useRealXendit
                        ? await XenditService.createInvoice({
                              external_id: `invoice_${Date.now()}`,
                              amount: parseInt(amount),
                              description: description,
                              customer: {
                                  given_names: customerName,
                                  email: customerEmail,
                              },
                              success_redirect_url: `${window.location.origin}/sample?success=true`,
                              failure_redirect_url: `${window.location.origin}/sample?error=true`,
                          })
                        : await mockXendit.createInvoice({
                              external_id: `invoice_${Date.now()}`,
                              amount: parseInt(amount),
                              description: description,
                              customer: {
                                  given_names: customerName,
                                  email: customerEmail,
                              },
                          });
                    result = {
                        id: invoiceData.id,
                        type: "Invoice",
                        status: invoiceData.status,
                        amount: invoiceData.amount,
                        description: invoiceData.description,
                        created: invoiceData.created,
                        details: {
                            invoice_url: invoiceData.invoice_url,
                            expiry_date: invoiceData.expiry_date,
                        },
                    };
                    break;

                case "virtual_account":
                    const bankCode = banks[0].code; // Default to BCA
                    const vaData = useRealXendit
                        ? await XenditService.createVirtualAccount({
                              external_id: `va_${Date.now()}`,
                              bank_code: bankCode,
                              name: customerName,
                              expected_amount: parseInt(amount),
                              is_closed: true,
                              expiration_date: new Date(
                                  Date.now() + 24 * 60 * 60 * 1000
                              ).toISOString(),
                          })
                        : await mockXendit.createVirtualAccount({
                              external_id: `va_${Date.now()}`,
                              owner_id: customerName,
                              bank_code: bankCode,
                          });
                    result = {
                        id: vaData.id,
                        type: "Virtual Account",
                        status: vaData.status,
                        amount: parseInt(amount),
                        description: `${description} - ${
                            banks.find((b) => b.code === bankCode)?.name
                        }`,
                        created: vaData.created,
                        details: {
                            account_number: vaData.account_number,
                            bank_code: vaData.bank_code,
                        },
                    };
                    break;

                case "ewallet":
                    const ewalletCode = ewalletProviders[0].code; // Default to OVO
                    const ewalletData = useRealXendit
                        ? await XenditService.createEwalletCharge({
                              reference_id: `ewc_${Date.now()}`,
                              currency: "IDR",
                              amount: parseInt(amount),
                              checkout_method: "ONE_TIME_PAYMENT",
                              channel_code: ewalletCode,
                              channel_properties: {
                                  mobile_number: "+6281234567890", // You might want to collect this from user
                                  success_redirect_url: `${window.location.origin}/sample?success=true`,
                                  failure_redirect_url: `${window.location.origin}/sample?error=true`,
                              },
                          })
                        : await mockXendit.createEwalletCharge({
                              external_id: `ewc_${Date.now()}`,
                              business_id: "sample_business",
                              amount: parseInt(amount),
                          });
                    result = {
                        id: ewalletData.id,
                        type: "E-Wallet",
                        status: ewalletData.status,
                        amount: ewalletData.amount,
                        description: `${description} - ${
                            ewalletProviders.find((e) => e.code === ewalletCode)
                                ?.name
                        }`,
                        created: ewalletData.created,
                        details: {
                            provider: ewalletCode,
                            actions: ewalletData.actions,
                        },
                    };
                    break;

                default:
                    throw new Error("Invalid payment method");
            }

            setPaymentResult(result);
            setPaymentHistory((prev) => [result, ...prev]);
            toast.success("Payment created successfully!");
        } catch (error) {
            toast.error("Failed to create payment");
            console.error("Payment error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Clock size="20" className="text-yellow-500" />;
            case "PAID":
            case "ACTIVE":
                return <TickCircle size="20" className="text-green-500" />;
            case "EXPIRED":
            case "FAILED":
                return <CloseCircle size="20" className="text-red-500" />;
            default:
                return <Clock size="20" className="text-gray-500" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Xendit Payment Integration
                    </h1>
                    <p className="text-xl text-gray-600">
                        Sample implementation of Xendit payment methods
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Payment Form */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Create Payment
                        </h2>

                        {/* Payment Method Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            selectedMethod === method.id
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        onClick={() =>
                                            setSelectedMethod(method.id)
                                        }
                                    >
                                        {method.popular && (
                                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs px-2 py-1 rounded-full font-medium">
                                                Popular
                                            </span>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="text-blue-600">
                                                {method.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {method.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {method.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (IDR)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="100000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Payment description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Email *
                                </label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) =>
                                        setCustomerEmail(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={isLoading || !selectedMethod}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Creating Payment...
                                </>
                            ) : (
                                <>
                                    <MoneySend size="20" />
                                    Create Payment
                                    <ArrowRight size="16" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Payment Result & History */}
                    <div className="space-y-6">
                        {/* Current Payment Result */}
                        {paymentResult && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Payment Created
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">
                                            ID:
                                        </span>
                                        <span className="text-sm font-mono text-gray-900">
                                            {paymentResult.id}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">
                                            Type:
                                        </span>
                                        <span className="text-sm text-gray-900">
                                            {paymentResult.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">
                                            Amount:
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(
                                                paymentResult.amount
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">
                                            Status:
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(
                                                paymentResult.status
                                            )}
                                            <span className="text-sm text-gray-900 capitalize">
                                                {paymentResult.status}
                                            </span>
                                        </div>
                                    </div>
                                    {paymentResult.details?.invoice_url && (
                                        <div className="pt-3 border-t">
                                            <a
                                                href={
                                                    paymentResult.details
                                                        .invoice_url
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                View Payment Page →
                                            </a>
                                        </div>
                                    )}
                                    {paymentResult.details?.account_number && (
                                        <div className="pt-3 border-t">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm font-medium text-gray-700 mb-1">
                                                    Virtual Account Number:
                                                </p>
                                                <p className="text-lg font-mono text-gray-900">
                                                    {
                                                        paymentResult.details
                                                            .account_number
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payment History */}
                        {paymentHistory.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Payment History
                                </h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {paymentHistory.map((payment, index) => (
                                        <div
                                            key={payment.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(payment.status)}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {payment.type}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {formatCurrency(
                                                            payment.amount
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">
                                                    {new Date(
                                                        payment.created
                                                    ).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(
                                                        payment.created
                                                    ).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                        Xendit Features Demonstrated
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Card size="32" className="text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Invoice Payments
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Accept payments via credit cards, bank
                                transfers, and e-wallets with a single
                                integration.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bank size="32" className="text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Virtual Accounts
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Generate unique virtual account numbers for
                                seamless bank transfer payments.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield size="32" className="text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Secure & Reliable
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Bank-grade security with PCI DSS compliance and
                                fraud protection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sample;
