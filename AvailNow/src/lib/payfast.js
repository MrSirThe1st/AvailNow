// src/lib/payfast.js
/**
 * PayFast Integration Service - Monthly Subscription and Lifetime Payment
 */

import crypto from "crypto";
import { supabase } from "./supabase";

const PAYFAST_MERCHANT_ID = import.meta.env.VITE_PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = import.meta.env.VITE_PAYFAST_MERCHANT_KEY;
const PAYFAST_PASSPHRASE = import.meta.env.VITE_PAYFAST_PASSPHRASE;
const PAYFAST_ENVIRONMENT =
  import.meta.env.VITE_PAYFAST_ENVIRONMENT || "sandbox";

const PAYFAST_BASE_URL =
  PAYFAST_ENVIRONMENT === "sandbox"
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

const PAYFAST_API_URL =
  PAYFAST_ENVIRONMENT === "sandbox"
    ? "https://api.sandbox.payfast.co.za"
    : "https://api.payfast.co.za";

const MONTHLY_AMOUNT = 30.0; // R30 per month
const LIFETIME_AMOUNT = 400.0; // R400 one-time

/**
 * Generate PayFast signature
 */
const generateSignature = (data, passphrase = "") => {
  const queryString = Object.keys(data)
    .filter(
      (key) => data[key] !== "" && data[key] !== null && data[key] !== undefined
    )
    .sort()
    .map((key) => `${key}=${encodeURIComponent(data[key])}`)
    .join("&");

  const stringToHash = passphrase
    ? `${queryString}&passphrase=${passphrase}`
    : queryString;
  return crypto.createHash("md5").update(stringToHash).digest("hex");
};

/**
 * Generate PayFast payment form data
 */
export const generatePayFastFormData = (userId, userEmail, options = {}) => {
  const baseUrl = window.location.origin;
  const planType = options.planType || "monthly";
  const isLifetime = planType === "lifetime";

  const amount = isLifetime ? LIFETIME_AMOUNT : MONTHLY_AMOUNT;
  const itemName = isLifetime
    ? "AvailNow Lifetime Access"
    : "AvailNow Monthly Subscription";
  const itemDescription = isLifetime
    ? "Lifetime access to AvailNow with all features"
    : "Monthly subscription to AvailNow";

  const data = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    amount: amount.toFixed(2),
    item_name: itemName,
    item_description: itemDescription,
    name_first: options.firstName || "User",
    name_last: options.lastName || "Name",
    email_address: userEmail,
    custom_str1: userId,
    custom_str2: planType,
    custom_str3: new Date().toISOString(),
    m_payment_id: `${planType}_${userId}_${Date.now()}`,
    return_url: `${baseUrl}/billing?status=success&plan=${planType}`,
    cancel_url: `${baseUrl}/billing?status=cancelled`,
    notify_url: `${baseUrl}/api/payfast/webhook`,
    email_confirmation: 1,
    confirmation_address: userEmail,
  };

  // Add subscription-specific fields only for monthly plan
  if (!isLifetime) {
    data.subscription_type = 1;
    data.recurring_amount = MONTHLY_AMOUNT.toFixed(2);
    data.frequency = 3; // Monthly
    data.cycles = 0; // Indefinite
  }

  data.signature = generateSignature(data, PAYFAST_PASSPHRASE);
  return data;
};

/**
 * Open PayFast checkout
 */
export const openPayFastCheckout = (userId, userEmail, options = {}) => {
  const formData = generatePayFastFormData(userId, userEmail, options);

  const form = document.createElement("form");
  form.method = "POST";
  form.action = PAYFAST_BASE_URL;
  form.style.display = "none";

  Object.keys(formData).forEach((key) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = formData[key];
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

/**
 * Verify PayFast signature
 */
export const verifyPayFastSignature = (data, signature) => {
  try {
    const expectedSignature = generateSignature(data, PAYFAST_PASSPHRASE);
    return expectedSignature === signature;
  } catch (error) {
    console.error("Error verifying PayFast signature:", error);
    return false;
  }
};

/**
 * Handle PayFast webhook
 */
export const handlePayFastWebhook = async (webhookData) => {
  try {
    if (!verifyPayFastSignature(webhookData, webhookData.signature)) {
      return { success: false, error: "Invalid signature" };
    }

    const {
      payment_status,
      custom_str1: userId,
      custom_str2: planType,
      token,
      pf_payment_id,
    } = webhookData;

    switch (payment_status) {
      case "COMPLETE":
        return handlePaymentComplete(webhookData, userId, planType);
      case "FAILED":
        return handlePaymentFailed(webhookData, userId);
      case "CANCELLED":
        return handlePaymentCancelled(webhookData, userId);
      default:
        return { success: true, message: "Event acknowledged" };
    }
  } catch (error) {
    console.error("Error handling PayFast webhook:", error);
    return { success: false, error: error.message };
  }
};

const handlePaymentComplete = async (data, userId, planType) => {
  console.log("Payment completed for user:", userId, "Plan:", planType);

  try {
    const isLifetime = planType === "lifetime";

    const updateData = {
      user_id: userId,
      subscription_id: data.pf_payment_id,
      subscription_status: isLifetime ? "lifetime" : "active",
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    };

    // Only add subscription token for recurring payments
    if (!isLifetime && data.token) {
      updateData.subscription_token = data.token;
    }

    const { error } = await supabase.from("user_profiles").upsert(updateData);

    if (error) throw error;

    const message = isLifetime
      ? "Lifetime access activated"
      : "Monthly subscription activated";

    return { success: true, message };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return { success: false, error: "Database update failed" };
  }
};

const handlePaymentFailed = async (data, userId) => {
  console.log("Payment failed for user:", userId);

  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        subscription_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true, message: "Payment failure recorded" };
  } catch (error) {
    console.error("Error updating payment failure:", error);
    return { success: false, error: "Database update failed" };
  }
};

const handlePaymentCancelled = async (data, userId) => {
  console.log("Payment cancelled for user:", userId);

  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        subscription_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true, message: "Payment cancellation recorded" };
  } catch (error) {
    console.error("Error updating payment cancellation:", error);
    return { success: false, error: "Database update failed" };
  }
};

/**
 * Cancel subscription (only applicable to monthly subscriptions)
 */
export const cancelPayFastSubscription = async (subscriptionToken) => {
  try {
    const response = await fetch(
      `${PAYFAST_API_URL}/subscriptions/${subscriptionToken}/cancel`,
      {
        method: "PUT",
        headers: {
          "merchant-id": PAYFAST_MERCHANT_ID,
          version: "v1",
          timestamp: new Date().toISOString(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to cancel subscription");
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error cancelling PayFast subscription:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get subscription details (only applicable to monthly subscriptions)
 */
export const getPayFastSubscription = async (subscriptionToken) => {
  try {
    const response = await fetch(
      `${PAYFAST_API_URL}/subscriptions/${subscriptionToken}/fetch`,
      {
        method: "GET",
        headers: {
          "merchant-id": PAYFAST_MERCHANT_ID,
          version: "v1",
          timestamp: new Date().toISOString(),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch subscription");
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching PayFast subscription:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has valid access (trial, active subscription, or lifetime)
 */
export const checkUserAccess = async (userId) => {
  try {
    const { data: userProfile, error } = await supabase
      .from("user_profiles")
      .select("subscription_status, trial_ends_at, created_at")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error checking user access:", error);
      return { hasAccess: false, reason: "error" };
    }

    if (!userProfile) {
      return { hasAccess: false, reason: "no_profile" };
    }

    const { subscription_status, trial_ends_at } = userProfile;

    // Lifetime access
    if (subscription_status === "lifetime") {
      return { hasAccess: true, reason: "lifetime" };
    }

    // Active subscription
    if (subscription_status === "active") {
      return { hasAccess: true, reason: "active" };
    }

    // Trial access
    if (subscription_status === "trial" && trial_ends_at) {
      const trialEnd = new Date(trial_ends_at);
      const now = new Date();

      if (trialEnd > now) {
        return { hasAccess: true, reason: "trial" };
      } else {
        return { hasAccess: false, reason: "trial_expired" };
      }
    }

    return { hasAccess: false, reason: "no_subscription" };
  } catch (error) {
    console.error("Error in checkUserAccess:", error);
    return { hasAccess: false, reason: "error" };
  }
};

export default {
  openPayFastCheckout,
  handlePayFastWebhook,
  cancelPayFastSubscription,
  getPayFastSubscription,
  verifyPayFastSignature,
  checkUserAccess,
};
