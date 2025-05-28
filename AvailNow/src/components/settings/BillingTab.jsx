// src/components/settings/BillingTab.jsx
import React, { useState, useEffect } from "react";
import { CreditCard, ExternalLink, Crown, Check } from "lucide-react";
import toast from "react-hot-toast";

const BillingTab = ({ user }) => {
  const [subscriptionData, setSubscriptionData] = useState({
    plan: "free",
    status: "active",
    nextBilling: null,
    amount: 0,
    customerId: null,
  });

  useEffect(() => {
    // Load subscription data (mock for now - replace with actual LemonSqueezy API calls)
    setSubscriptionData({
      plan: "free",
      status: "active",
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: 0,
      customerId: null,
    });
  }, [user]);

  const handleBillingPortal = () => {
    // In a real implementation, this would redirect to LemonSqueezy customer portal
    toast.info("Redirecting to billing portal...");
    // Example: window.open(`https://your-store.lemonsqueezy.com/billing/${subscriptionData.customerId}`, "_blank");
  };

  const handleUpgrade = (planName, price) => {
    // In a real implementation, this would redirect to LemonSqueezy checkout
    toast.info(`Redirecting to ${planName} checkout...`);
    // Example: window.open(`https://your-store.lemonsqueezy.com/checkout/buy/product-id`, "_blank");
  };

  const plans = [
    {
      name: "free",
      display: "Free",
      price: 0,
      features: [
        "1 Widget",
        "Basic customization",
        "100 monthly views",
        "Email support",
      ],
      popular: false,
    },
    {
      name: "pro",
      display: "Pro",
      price: 19,
      features: [
        "Unlimited widgets",
        "Advanced customization",
        "10,000 monthly views",
        "Calendar integrations",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "enterprise",
      display: "Enterprise",
      price: 99,
      features: [
        "Everything in Pro",
        "Unlimited views",
        "White-label options",
        "API access",
        "Dedicated support",
      ],
      popular: false,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Billing & Subscription</h2>

      {/* Current Plan */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Current Plan</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {subscriptionData.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Plan</p>
            <p className="text-lg font-semibold capitalize">
              {subscriptionData.plan}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-lg font-semibold">
              ${subscriptionData.amount}/month
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Billing</p>
            <p className="text-lg font-semibold">
              {subscriptionData.nextBilling
                ? subscriptionData.nextBilling.toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>

        {subscriptionData.plan !== "free" && (
          <button
            onClick={handleBillingPortal}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Billing
            <ExternalLink className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded-lg p-6 relative ${
              plan.popular ? "border-primary" : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                  <Crown className="w-3 h-3 mr-1" />
                  Popular
                </span>
              </div>
            )}

            <h4 className="text-lg font-semibold mb-2">{plan.display}</h4>
            <p className="text-3xl font-bold mb-4">
              ${plan.price}
              <span className="text-lg text-gray-500">/mo</span>
            </p>

            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.display, plan.price)}
              disabled={subscriptionData.plan === plan.name}
              className={`w-full py-2 px-4 rounded-md transition-colors ${
                subscriptionData.plan === plan.name
                  ? "border border-gray-300 text-gray-500 cursor-not-allowed"
                  : plan.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {subscriptionData.plan === plan.name
                ? "Current Plan"
                : plan.name === "free"
                  ? "Downgrade"
                  : plan.name === "enterprise"
                    ? "Contact Sales"
                    : "Upgrade"}
            </button>
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div className="mt-8 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Billing History</h3>
        <div className="space-y-3">
          {subscriptionData.plan === "free" ? (
            <p className="text-gray-500 text-center py-4">
              No billing history available for free plan
            </p>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No invoices yet</p>
              <p className="text-sm text-gray-400">
                Your billing history will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingTab;
