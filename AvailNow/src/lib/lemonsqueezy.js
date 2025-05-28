// src/lib/lemonsqueezy.js
/**
 * LemonSqueezy Integration Service
 * Handles subscription management, billing, and payments
 */

const LEMONSQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1";
const LEMONSQUEEZY_API_KEY = import.meta.env.VITE_LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = import.meta.env.VITE_LEMONSQUEEZY_STORE_ID;

// Product/Variant IDs for different plans
const PLAN_VARIANTS = {
  pro: import.meta.env.VITE_LEMONSQUEEZY_PRO_VARIANT_ID,
  enterprise: import.meta.env.VITE_LEMONSQUEEZY_ENTERPRISE_VARIANT_ID,
};

/**
 * Make authenticated request to LemonSqueezy API
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${LEMONSQUEEZY_API_URL}${endpoint}`;
  const config = {
    headers: {
      Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.detail || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("LemonSqueezy API Error:", error);
    throw error;
  }
};

/**
 * Create checkout URL for a specific plan
 */
export const createCheckoutUrl = async (planName, userId, userEmail) => {
  const variantId = PLAN_VARIANTS[planName];

  if (!variantId) {
    throw new Error(`No variant ID found for plan: ${planName}`);
  }

  try {
    const checkoutData = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: {
              user_id: userId,
              plan: planName,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: LEMONSQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    };

    const response = await apiRequest("/checkouts", {
      method: "POST",
      body: JSON.stringify(checkoutData),
    });

    return response.data.attributes.url;
  } catch (error) {
    console.error("Error creating checkout:", error);
    throw error;
  }
};

/**
 * Get customer portal URL for managing subscription
 */
export const getCustomerPortalUrl = async (customerId) => {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  try {
    const response = await apiRequest(`/customers/${customerId}`);
    return response.data.attributes.urls.customer_portal;
  } catch (error) {
    console.error("Error getting customer portal URL:", error);
    throw error;
  }
};

/**
 * Get subscription details by subscription ID
 */
export const getSubscription = async (subscriptionId) => {
  try {
    const response = await apiRequest(`/subscriptions/${subscriptionId}`);

    const subscription = response.data;
    const attributes = subscription.attributes;

    return {
      id: subscription.id,
      status: attributes.status,
      planName: attributes.product_name,
      variantName: attributes.variant_name,
      price: attributes.subtotal,
      currency: attributes.currency,
      interval: attributes.billing_anchor,
      currentPeriodStart: new Date(attributes.created_at),
      currentPeriodEnd: new Date(attributes.renews_at),
      cancelAtPeriodEnd: attributes.cancelled,
      customerId: attributes.customer_id,
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw error;
  }
};

/**
 * Get all subscriptions for a customer
 */
export const getCustomerSubscriptions = async (customerId) => {
  try {
    const response = await apiRequest(
      `/subscriptions?filter[customer_id]=${customerId}`
    );

    return response.data.map((subscription) => {
      const attributes = subscription.attributes;
      return {
        id: subscription.id,
        status: attributes.status,
        planName: attributes.product_name,
        variantName: attributes.variant_name,
        price: attributes.subtotal,
        currency: attributes.currency,
        currentPeriodEnd: new Date(attributes.renews_at),
        cancelAtPeriodEnd: attributes.cancelled,
      };
    });
  } catch (error) {
    console.error("Error fetching customer subscriptions:", error);
    throw error;
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    const cancelData = {
      data: {
        type: "subscriptions",
        id: subscriptionId,
        attributes: {
          cancelled: true,
        },
      },
    };

    const response = await apiRequest(`/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      body: JSON.stringify(cancelData),
    });

    return response.data;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
};

/**
 * Resume a cancelled subscription
 */
export const resumeSubscription = async (subscriptionId) => {
  try {
    const resumeData = {
      data: {
        type: "subscriptions",
        id: subscriptionId,
        attributes: {
          cancelled: false,
        },
      },
    };

    const response = await apiRequest(`/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      body: JSON.stringify(resumeData),
    });

    return response.data;
  } catch (error) {
    console.error("Error resuming subscription:", error);
    throw error;
  }
};

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (payload, signature, secret) => {
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
};

/**
 * Handle LemonSqueezy webhook events
 */
export const handleWebhookEvent = async (event) => {
  const { type, data } = event;

  switch (type) {
    case "subscription_created":
      return handleSubscriptionCreated(data);
    case "subscription_updated":
      return handleSubscriptionUpdated(data);
    case "subscription_cancelled":
      return handleSubscriptionCancelled(data);
    case "subscription_resumed":
      return handleSubscriptionResumed(data);
    case "subscription_expired":
      return handleSubscriptionExpired(data);
    case "subscription_paused":
      return handleSubscriptionPaused(data);
    case "subscription_unpaused":
      return handleSubscriptionUnpaused(data);
    case "order_created":
      return handleOrderCreated(data);
    default:
      console.log(`Unhandled webhook event type: ${type}`);
      return { success: true };
  }
};

const handleSubscriptionCreated = async (data) => {
  // Update user's subscription status in your database
  console.log("Subscription created:", data);
  return { success: true };
};

const handleSubscriptionUpdated = async (data) => {
  // Update subscription details in your database
  console.log("Subscription updated:", data);
  return { success: true };
};

const handleSubscriptionCancelled = async (data) => {
  // Handle subscription cancellation
  console.log("Subscription cancelled:", data);
  return { success: true };
};

const handleSubscriptionResumed = async (data) => {
  // Handle subscription resumption
  console.log("Subscription resumed:", data);
  return { success: true };
};

const handleSubscriptionExpired = async (data) => {
  // Handle subscription expiration
  console.log("Subscription expired:", data);
  return { success: true };
};

const handleSubscriptionPaused = async (data) => {
  // Handle subscription pause
  console.log("Subscription paused:", data);
  return { success: true };
};

const handleSubscriptionUnpaused = async (data) => {
  // Handle subscription unpause
  console.log("Subscription unpaused:", data);
  return { success: true };
};

const handleOrderCreated = async (data) => {
  // Handle new order creation
  console.log("Order created:", data);
  return { success: true };
};

/**
 * Get available products and variants
 */
export const getProducts = async () => {
  try {
    const response = await apiRequest(
      `/products?filter[store_id]=${LEMONSQUEEZY_STORE_ID}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

/**
 * Usage tracking and billing limits
 */
export const checkUsageLimits = (plan, usage) => {
  const limits = {
    free: {
      widgets: 1,
      monthlyViews: 100,
      calendars: 0,
    },
    pro: {
      widgets: Infinity,
      monthlyViews: 10000,
      calendars: Infinity,
    },
    enterprise: {
      widgets: Infinity,
      monthlyViews: Infinity,
      calendars: Infinity,
    },
  };

  const planLimits = limits[plan] || limits.free;

  return {
    widgets: {
      current: usage.widgets || 0,
      limit: planLimits.widgets,
      exceeded: usage.widgets > planLimits.widgets,
    },
    monthlyViews: {
      current: usage.monthlyViews || 0,
      limit: planLimits.monthlyViews,
      exceeded: usage.monthlyViews > planLimits.monthlyViews,
    },
    calendars: {
      current: usage.calendars || 0,
      limit: planLimits.calendars,
      exceeded: usage.calendars > planLimits.calendars,
    },
  };
};

export default {
  createCheckoutUrl,
  getCustomerPortalUrl,
  getSubscription,
  getCustomerSubscriptions,
  cancelSubscription,
  resumeSubscription,
  verifyWebhookSignature,
  handleWebhookEvent,
  getProducts,
  checkUsageLimits,
};
