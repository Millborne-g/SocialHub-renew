"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/Button";

interface PricingData {
    currency: string;
    symbol: string;
    freePrice: string;
    proMonthly: string;
    proYearly: string;
    yearlyDiscount: string;
}

const PricingPage = () => {
    const [pricingData, setPricingData] = useState<PricingData>({
        currency: "PHP",
        symbol: "₱",
        freePrice: "0",
        proMonthly: "79",
        proYearly: "799",
        yearlyDiscount: "17%",
    });
    const [country, setCountry] = useState<string>("Philippines");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<string>("Free");
    const [isYearly, setIsYearly] = useState<boolean>(false);

    // Currency conversion rates (simplified - in real app, use a proper API)
    const currencyRates: { [key: string]: PricingData } = {
        US: {
            currency: "USD",
            symbol: "$",
            freePrice: "0",
            proMonthly: "1.50",
            proYearly: "15",
            yearlyDiscount: "17%",
        },
        GB: {
            currency: "GBP",
            symbol: "£",
            freePrice: "0",
            proMonthly: "1.20",
            proYearly: "12",
            yearlyDiscount: "17%",
        },
        EU: {
            currency: "EUR",
            symbol: "€",
            freePrice: "0",
            proMonthly: "1.40",
            proYearly: "14",
            yearlyDiscount: "17%",
        },
        JP: {
            currency: "JPY",
            symbol: "¥",
            freePrice: "0",
            proMonthly: "220",
            proYearly: "2200",
            yearlyDiscount: "17%",
        },
        AU: {
            currency: "AUD",
            symbol: "A$",
            freePrice: "0",
            proMonthly: "2.30",
            proYearly: "23",
            yearlyDiscount: "17%",
        },
        CA: {
            currency: "CAD",
            symbol: "C$",
            freePrice: "0",
            proMonthly: "2.00",
            proYearly: "20",
            yearlyDiscount: "17%",
        },
        IN: {
            currency: "INR",
            symbol: "₹",
            freePrice: "0",
            proMonthly: "125",
            proYearly: "1250",
            yearlyDiscount: "17%",
        },
        PH: {
            currency: "PHP",
            symbol: "₱",
            freePrice: "0",
            proMonthly: "79",
            proYearly: "799",
            yearlyDiscount: "17%",
        },
    };

    const detectCountry = async () => {
        try {
            // Try to get country from IP geolocation
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();

            if (data.country_code) {
                const countryCode = data.country_code;
                const countryName = data.country_name || "Unknown";
                setCountry(countryName);

                // Map country codes to our supported currencies
                const currencyMap: { [key: string]: string } = {
                    US: "US",
                    GB: "GB",
                    DE: "EU",
                    FR: "EU",
                    IT: "EU",
                    ES: "EU",
                    NL: "EU",
                    BE: "EU",
                    AT: "EU",
                    IE: "EU",
                    PT: "EU",
                    FI: "EU",
                    GR: "EU",
                    LU: "EU",
                    JP: "JP",
                    AU: "AU",
                    CA: "CA",
                    IN: "IN",
                    PH: "PH",
                };

                const currencyKey = currencyMap[countryCode] || "PH"; // Default to Philippines
                setPricingData(currencyRates[currencyKey]);
            }
        } catch (error) {
            console.error("Error detecting country:", error);
            // Fallback to Philippines pricing
            setPricingData(currencyRates["PH"]);
            setCountry("Philippines");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        detectCountry();
    }, []);

    const features = [
        {
            plan: "Free",
            title: "Free Plan",
            price: pricingData.freePrice,
            currency: pricingData.symbol,
            period: "Free forever",
            description: "Perfect for getting started",
            features: [
                "10 storage links (each max 9 links)",
                "Templates usable on 5 storages only",
                "Basic customization (title, description, image, alias)",
                "With platform branding",
            ],
            buttonText: currentPlan === "Free" ? "Current Plan" : "Get Started",
            buttonVariant:
                currentPlan === "Free"
                    ? ("secondary" as const)
                    : ("primary" as const),
            popular: false,
            isCurrentPlan: currentPlan === "Free",
        },
        {
            plan: "Pro",
            title: "Pro Plan (Early Supporter Price)",
            price: isYearly ? pricingData.proYearly : pricingData.proMonthly,
            currency: pricingData.symbol,
            period: isYearly ? "per year" : "per month",
            yearlyPrice: pricingData.proYearly,
            yearlyPeriod: "per year",
            description: "Unlock unlimited potential",
            features: [
                "Unlimited storage links",
                "Unlimited links inside each storage",
                "Templates on all storages",
                '"Early Pro" discount — lock this price before it increases',
            ],
            buttonText:
                currentPlan === "Pro" ? "Current Plan" : "Start Pro Trial",
            buttonVariant:
                currentPlan === "Pro"
                    ? ("secondary" as const)
                    : ("primary" as const),
            popular: true,
            discount: pricingData.yearlyDiscount,
            isCurrentPlan: currentPlan === "Pro",
        },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Detecting your location...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">
                        Choose the plan that's right for you
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        Pricing shown in {pricingData.currency} for {country}
                    </p>

                    {/* Current Plan Status */}
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        You are currently on the{" "}
                        <span className="font-semibold">
                            {currentPlan} Plan
                        </span>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span
                            className={`text-sm font-medium ${
                                !isYearly ? "text-gray-900" : "text-gray-500"
                            }`}
                        >
                            Monthly
                        </span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                isYearly ? "bg-primary" : "bg-gray-200"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isYearly ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                        <span
                            className={`text-sm font-medium ${
                                isYearly ? "text-gray-900" : "text-gray-500"
                            }`}
                        >
                            Yearly
                        </span>
                        {isYearly && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Save {pricingData.yearlyDiscount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {features.map((plan, index) => (
                        <div
                            key={plan.plan}
                            className={`relative bg-white rounded-2xl shadow-elevation-2 p-8 ${
                                plan.popular
                                    ? "ring-2 ring-primary scale-105"
                                    : "hover:shadow-elevation-3 transition-shadow duration-300"
                            } ${
                                plan.isCurrentPlan
                                    ? "ring-2 ring-green-500 bg-green-50"
                                    : ""
                            }`}
                        >
                            {plan.popular && !plan.isCurrentPlan && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            {plan.isCurrentPlan && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                                        Current Plan
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.title}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {plan.description}
                                </p>

                                <div className="mb-4">
                                    <span className="text-5xl font-bold text-gray-900">
                                        {plan.currency}
                                        {plan.price}
                                    </span>
                                    <span className="text-gray-600 ml-2">
                                        {plan.period}
                                    </span>
                                </div>

                                {plan.plan === "Pro" && !isYearly && (
                                    <div className="text-sm text-gray-600 mb-2">
                                        or {plan.currency}
                                        {plan.yearlyPrice} {plan.yearlyPeriod}
                                        <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                            Save {plan.discount}
                                        </span>
                                    </div>
                                )}

                                {plan.plan === "Pro" && isYearly && (
                                    <div className="text-sm text-green-600 mb-2 font-medium">
                                        Billed annually - Save {plan.discount}
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <li
                                        key={featureIndex}
                                        className="flex items-start"
                                    >
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-gray-700">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                text={plan.buttonText}
                                variant={plan.buttonVariant}
                                width="full"
                                size="lg"
                                className="w-full"
                                disabled={plan.isCurrentPlan}
                            />
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-20 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-8">
                        <div className="bg-white rounded-lg p-6 shadow-elevation-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Can I change my plan anytime?
                            </h3>
                            <p className="text-gray-600">
                                Yes, you can upgrade or downgrade your plan at
                                any time. Changes will be reflected in your next
                                billing cycle.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-elevation-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                What happens to my data if I cancel?
                            </h3>
                            <p className="text-gray-600">
                                Your data remains safe and accessible. You can
                                export your links and continue using the free
                                plan with limited features.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-elevation-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Is there a free trial for Pro?
                            </h3>
                            <p className="text-gray-600">
                                Yes! You can try Pro features for 14 days with
                                no commitment. No credit card required to start.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-elevation-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                How does the Early Supporter pricing work?
                            </h3>
                            <p className="text-gray-600">
                                Early supporters get to lock in the current Pro
                                pricing forever. Once you subscribe, your price
                                will never increase even when we raise prices
                                for new customers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of users who trust LinkLet for their link
                        management needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            text="Start Free Plan"
                            variant="secondary"
                            size="lg"
                            onClick={() => (window.location.href = "/signup")}
                        />
                        <Button
                            text="Try Pro Free"
                            variant="primary"
                            size="lg"
                            onClick={() => (window.location.href = "/signup")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
