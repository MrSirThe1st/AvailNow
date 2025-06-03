// src/components/settings/BillingTab.jsx
import React, { useState, useEffect } from "react";
import { CreditCard, Loader, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/SupabaseAuthContext";
import { supabase } from "../../lib/supabase";
import {
  openPayFastCheckout,
  getPayFastSubscription,
  cancelPayFastSubscription,
} from "../../lib/payfast";
import toast from "react-hot-toast";

const BillingTab = ({ user }) => {
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

        // If user has a subscription token, fetch details from PayFast
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
        trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

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
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Billing & Subscription</h2>

      {/* Current Status */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Current Status</h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(subscriptionData.status)}`}
          >
            {subscriptionData.status || "Unknown"}
          </span>
        </div>

        {isOnTrial && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Plan</p>
            <p className="text-lg font-semibold">
              {isOnTrial
                ? `Trial (${trialDaysLeft} days left)`
                : isActive
                  ? "Monthly Subscription"
                  : "No Active Plan"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-lg font-semibold">
              {isOnTrial ? "Free" : formatCurrency(30)}
              {!isOnTrial && "/month"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Billing</p>
            <p className="text-lg font-semibold">
              {subscriptionData.nextBilling
                ? subscriptionData.nextBilling.toLocaleDateString()
                : isOnTrial
                  ? new Date(
                      subscriptionData.trial_ends_at
                    ).toLocaleDateString()
                  : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {isOnTrial && (
            <button
              onClick={handleSubscribe}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Subscribe Now - {formatCurrency(30)}/month
            </button>
          )}

          {isActive && (
            <button
              onClick={handleCancelSubscription}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Cancel Subscription
            </button>
          )}

          {isCancelled && (
            <button
              onClick={handleSubscribe}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Reactivate Subscription
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingTab;
