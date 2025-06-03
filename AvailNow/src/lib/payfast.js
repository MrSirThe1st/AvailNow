// src/lib/payfast.js
/**
 * PayFast Integration Service - Simple Monthly Subscription
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

const SUBSCRIPTION_AMOUNT = 30.0; // R30 per month

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

  const data = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    amount: SUBSCRIPTION_AMOUNT.toFixed(2),
    item_name: "AvailNow Monthly Subscription",
    item_description: "Monthly subscription to AvailNow",
    subscription_type: 1,
    recurring_amount: SUBSCRIPTION_AMOUNT.toFixed(2),
    frequency: 3, // Monthly
    cycles: 0, // Indefinite
    return_url: `${baseUrl}/billing?status=success`,
    cancel_url: `${baseUrl}/billing?status=cancelled`,
    notify_url: `${baseUrl}/api/payfast/webhook`,
    name_first: options.firstName || "User",
    name_last: options.lastName || "Name",
    email_address: userEmail,
    custom_str1: userId,
    custom_str2: new Date().toISOString(),
    m_payment_id: `subscription_${userId}_${Date.now()}`,
    email_confirmation: 1,
    confirmation_address: userEmail,
  };

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

    const { payment_status, custom_str1: userId } = webhookData;

    switch (payment_status) {
      case "COMPLETE":
        return handlePaymentComplete(webhookData, userId);
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

const handlePaymentComplete = async (data, userId) => {
  console.log("Payment completed for user:", userId);

  try {
    const { error } = await supabase.from("user_profiles").upsert({
      user_id: userId,
      subscription_id: data.pf_payment_id,
      subscription_status: "active",
      subscription_token: data.token,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true, message: "Subscription activated" };
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
 * Cancel subscription
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
 * Get subscription details
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

export default {
  openPayFastCheckout,
  handlePayFastWebhook,
  cancelPayFastSubscription,
  getPayFastSubscription,
  verifyPayFastSignature,
};
