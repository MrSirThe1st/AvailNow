// src/pages/Billing.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/SupabaseAuthContext";
import {
  openPaddleCheckout,
  getSubscription,
  cancelSubscription,
  getPaymentHistory,
  checkUsageLimits,
} from "../lib/paddle";
import { supabase } from "../lib/supabase";
import {
  CreditCard,
  ExternalLink,
  Crown,
  Check,
  Loader,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Eye,
  MousePointer,
} from "lucide-react";
import toast from "react-hot-toast";

const Billing = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: "free",
    status: "active",
    nextBilling: null,
    amount: 0,
    subscriptionId: null,
    cancelUrl: null,
    updateUrl: null,
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [usage, setUsage] = useState({
    widgets: 0,
    monthlyViews: 0,
    calendars: 0,
  });
  const [usageLimits, setUsageLimits] = useState(null);

  useEffect(() => {
    if (user) {
      loadBillingData();
    }
  }, [user]);

  const loadBillingData = async () => {
    try {
      setLoading(true);

      // Load subscription data from Supabase
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("subscription_id, plan, subscription_status")
        .eq("user_id", user.id)
        .single();

      if (userProfile?.subscription_id) {
        try {
          const subscription = await getSubscription(
            userProfile.subscription_id
          );
          setSubscriptionData({
            plan: userProfile.plan || "pro",
            status: subscription.status,
            nextBilling: subscription.nextBillDate
              ? new Date(subscription.nextBillDate)
              : null,
            amount: subscription.amount || 0,
            subscriptionId: subscription.id,
            cancelUrl: subscription.cancelUrl,
            updateUrl: subscription.updateUrl,
          });
        } catch (err) {
          console.error("Error fetching subscription:", err);
        }
      }

      // Load payment history
      if (user.email) {
        try {
          const history = await getPaymentHistory(user.email);
          setPaymentHistory(history);
        } catch (err) {
          console.error("Error fetching payment history:", err);
        }
      }

      // Load usage data
      const [widgetStats, calendarIntegrations] = await Promise.all([
        supabase
          .from("widget_stats")
          .select("views")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("calendar_integrations")
          .select("id")
          .eq("user_id", user.id),
      ]);

      const currentUsage = {
        widgets: 1, // Assuming 1 widget for now
        monthlyViews: widgetStats.data?.views || 0,
        calendars: calendarIntegrations.data?.length || 0,
      };

      setUsage(currentUsage);
      setUsageLimits(
        checkUsageLimits(userProfile?.plan || "free", currentUsage)
      );
    } catch (error) {
      console.error("Error loading billing data:", error);
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName, productId) => {
    if (!user?.email) return;

    try {
      await openPaddleCheckout(planName, user.email, user.id, async (data) => {
        console.log("Payment successful:", data);

        // Update user profile with subscription data
        await supabase.from("user_profiles").upsert({
          user_id: user.id,
          subscription_id: data.checkout.subscription_id,
          plan: planName,
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        });

        toast.success(`Successfully upgraded to ${planName}!`);
        loadBillingData();
      });
    } catch (error) {
      console.error("Error opening checkout:", error);
      toast.error("Failed to open checkout");
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionData.subscriptionId) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription?"
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await cancelSubscription(subscriptionData.subscriptionId);

      await supabase
        .from("user_profiles")
        .update({
          subscription_status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      toast.success("Subscription cancelled successfully");
      loadBillingData();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = () => {
    if (subscriptionData.updateUrl) {
      window.open(subscriptionData.updateUrl, "_blank");
    } else {
      toast.info("Billing management not available");
    }
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
      productId: null,
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
      productId: process.env.VITE_PADDLE_PRO_PRODUCT_ID,
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
      productId: process.env.VITE_PADDLE_ENTERPRISE_PRODUCT_ID,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading billing information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Billing & Subscription
        </h1>
        <p className="text-gray-600">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Usage Overview */}
      {usageLimits && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Monthly Views</p>
              <p className="text-2xl font-bold text-blue-600">
                {usageLimits.monthlyViews.current.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                of{" "}
                {usageLimits.monthlyViews.limit === Infinity
                  ? "unlimited"
                  : usageLimits.monthlyViews.limit.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <MousePointer className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Active Widgets</p>
              <p className="text-2xl font-bold text-green-600">
                {usageLimits.widgets.current}
              </p>
              <p className="text-xs text-gray-500">
                of{" "}
                {usageLimits.widgets.limit === Infinity
                  ? "unlimited"
                  : usageLimits.widgets.limit}
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Connected Calendars</p>
              <p className="text-2xl font-bold text-purple-600">
                {usageLimits.calendars.current}
              </p>
              <p className="text-xs text-gray-500">
                of{" "}
                {usageLimits.calendars.limit === Infinity
                  ? "unlimited"
                  : usageLimits.calendars.limit}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Current Plan</h2>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              subscriptionData.status === "active"
                ? "bg-green-100 text-green-800"
                : subscriptionData.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
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

        <div className="flex gap-3">
          {subscriptionData.plan !== "free" && (
            <>
              <button
                onClick={handleManageBilling}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>

              <button
                onClick={handleCancelSubscription}
                className="flex items-center px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50"
              >
                Cancel Subscription
              </button>
            </>
          )}
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Available Plans</h2>
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
                onClick={() => handleUpgrade(plan.name, plan.productId)}
                disabled={
                  subscriptionData.plan === plan.name || !plan.productId
                }
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
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <div className="space-y-3">
          {paymentHistory.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payment history available</p>
              <p className="text-sm text-gray-400">
                Your payment history will appear here after your first purchase
              </p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistory.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.product_name || "Subscription"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount} {payment.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "refunded"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Usage Warnings */}
      {usageLimits && (
        <div className="space-y-4">
          {usageLimits.monthlyViews.exceeded && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Monthly Views Limit Exceeded
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    You've exceeded your monthly views limit. Consider upgrading
                    to a higher plan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {usageLimits.widgets.exceeded && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Widget Limit Exceeded
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    You've exceeded your widget limit. Upgrade to create more
                    widgets.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Billing;
