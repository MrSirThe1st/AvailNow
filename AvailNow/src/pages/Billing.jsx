// src/pages/Billing.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/SupabaseAuthContext";
import { supabase } from "../lib/supabase";
import {
  openPayFastCheckout,
  getPayFastSubscription,
  cancelPayFastSubscription,
} from "../lib/payfast";
import {
  CreditCard,
  Loader,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const Billing = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState({
    status: null,
    nextBilling: null,
    subscriptionToken: null,
    trial_ends_at: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadBillingData();
    }
  }, [user]);

  // Handle PayFast return
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      toast.success("Payment successful! Your subscription is now active.");
      loadBillingData();
    } else if (status === "cancelled") {
      toast.error("Payment was cancelled.");
    }
  }, [searchParams]);

  const loadBillingData = async () => {
    try {
      setLoading(true);

      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select(
          "subscription_status, subscription_token, trial_ends_at, created_at"
        )
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching user profile:", profileError);
      }

      if (userProfile) {
        let subscriptionDetails = {
          status: userProfile.subscription_status,
          nextBilling: null,
          subscriptionToken: userProfile.subscription_token,
          trial_ends_at: userProfile.trial_ends_at,
        };

        if (userProfile.subscription_token) {
          try {
            const payFastResult = await getPayFastSubscription(
              userProfile.subscription_token
            );
            if (payFastResult.success && payFastResult.data) {
              const pfData = payFastResult.data;
              subscriptionDetails.nextBilling = pfData.next_run_date
                ? new Date(pfData.next_run_date)
                : null;
            }
          } catch (err) {
            console.error("Error fetching PayFast subscription details:", err);
          }
        }

        setSubscriptionData(subscriptionDetails);
      } else {
        // No profile found, create one with trial
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);

        await supabase.from("user_profiles").insert({
          user_id: user.id,
          email: user.email,
          trial_ends_at: trialEndDate.toISOString(),
          subscription_status: "trial",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        setSubscriptionData({
          status: "trial",
          nextBilling: null,
          subscriptionToken: null,
          trial_ends_at: trialEndDate.toISOString(),
        });
      }
    } catch (error) {
      console.error("Error loading billing data:", error);
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (!user?.email) {
      toast.error("User email not found");
      return;
    }

    try {
      openPayFastCheckout(user.id, user.email, {
        firstName: user.user_metadata?.first_name || "User",
        lastName: user.user_metadata?.last_name || "Name",
      });
    } catch (error) {
      console.error("Error opening PayFast checkout:", error);
      toast.error("Failed to open checkout");
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionData.subscriptionToken) {
      toast.error("No active subscription to cancel");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription? You will lose access at the end of your current billing period."
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const result = await cancelPayFastSubscription(
        subscriptionData.subscriptionToken
      );

      if (result.success) {
        await supabase
          .from("user_profiles")
          .update({
            subscription_status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        toast.success("Subscription cancelled successfully");
        loadBillingData();
      } else {
        toast.error(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const getTrialDaysLeft = () => {
    if (!subscriptionData.trial_ends_at) return 0;
    const trialEnd = new Date(subscriptionData.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading billing information...</p>
      </div>
    );
  }

  const isOnTrial = subscriptionData.status === "trial";
  const isActive = subscriptionData.status === "active";
  const isCancelled = subscriptionData.status === "cancelled";
  const trialDaysLeft = getTrialDaysLeft();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Billing & Subscription
        </h1>
        <p className="text-gray-600">Manage your AvailNow subscription</p>
      </div>

      {/* Trial Warning */}
      {isOnTrial && trialDaysLeft <= 3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Trial Ending Soon
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your free trial ends in {trialDaysLeft} day
                {trialDaysLeft !== 1 ? "s" : ""}. Subscribe now to continue
                using AvailNow.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Current Status</h2>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(subscriptionData.status)}`}
          >
            {subscriptionData.status === "trial"
              ? "Free Trial"
              : subscriptionData.status || "Unknown"}
          </span>
        </div>

        {isOnTrial && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Free Trial Active
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  You have {trialDaysLeft} days left in your free trial. After
                  that, you'll need to subscribe to continue using AvailNow.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {isOnTrial ? trialDaysLeft : isActive ? "∞" : "0"}
            </div>
            <div className="text-sm text-gray-600">
              {isOnTrial
                ? "Trial Days Left"
                : isActive
                  ? "Days Remaining"
                  : "Access Days"}
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {isOnTrial ? "Free" : formatCurrency(30)}
            </div>
            <div className="text-sm text-gray-600">
              {isOnTrial ? "Current Cost" : "Monthly Cost"}
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {subscriptionData.nextBilling
                ? subscriptionData.nextBilling.toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                  })
                : isOnTrial
                  ? new Date(subscriptionData.trial_ends_at).toLocaleDateString(
                      "en-ZA",
                      { day: "numeric", month: "short" }
                    )
                  : "N/A"}
            </div>
            <div className="text-sm text-gray-600">
              {isOnTrial ? "Trial Ends" : "Next Billing"}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {isOnTrial && (
            <button
              onClick={handleSubscribe}
              className="flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Subscribe Now - {formatCurrency(30)}/month
            </button>
          )}

          {isActive && (
            <button
              onClick={handleCancelSubscription}
              disabled={actionLoading}
              className="flex items-center px-6 py-3 border border-red-300 rounded-md text-red-700 hover:bg-red-50 disabled:opacity-50 font-medium"
            >
              {actionLoading ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : null}
              Cancel Subscription
            </button>
          )}

          {isCancelled && (
            <button
              onClick={handleSubscribe}
              className="flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Reactivate Subscription
            </button>
          )}
        </div>
      </div>

      {/* Subscription Plan Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">AvailNow Subscription</h2>

        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium">Monthly Subscription</h3>
              <p className="text-gray-600">
                Full access to all AvailNow features
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(30)}
              </div>
              <div className="text-sm text-gray-600">per month</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Unlimited availability widgets</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Calendar integrations (Google, Outlook)</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Custom widget branding</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Real-time availability sync</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Mobile-responsive widgets</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Email support</span>
              </div>
            </div>
          </div>

          {!isActive && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  {isOnTrial
                    ? "Start Your Subscription"
                    : "Reactivate Your Subscription"}
                </h4>
                <p className="text-sm text-blue-700 mb-4">
                  Continue enjoying all AvailNow features with our affordable
                  monthly subscription.
                </p>
                <button
                  onClick={handleSubscribe}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscribe for {formatCurrency(30)}/month
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-white rounded-lg shadow p-6">
        

        {isActive && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-green-800">
                  Subscription Active
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Your subscription will automatically renew on{" "}
                  {subscriptionData.nextBilling
                    ? subscriptionData.nextBilling.toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "the next billing date"}
                  .
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
