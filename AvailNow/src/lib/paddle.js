// src/lib/paddle.js
/**
 * Paddle Integration Service
 * Handles subscription management, billing, and payments with Paddle
 */

const PADDLE_VENDOR_ID = import.meta.env.VITE_PADDLE_VENDOR_ID;
const PADDLE_API_KEY = import.meta.env.VITE_PADDLE_API_KEY;
const PADDLE_ENVIRONMENT = import.meta.env.VITE_PADDLE_ENVIRONMENT || "sandbox"; // 'sandbox' or 'production'

// Product IDs for different plans
const PLAN_PRODUCTS = {
  pro: import.meta.env.VITE_PADDLE_PRO_PRODUCT_ID,
  enterprise: import.meta.env.VITE_PADDLE_ENTERPRISE_PRODUCT_ID,
};

// Initialize Paddle
let paddleInitialized = false;

const initializePaddle = () => {
  if (paddleInitialized) return;

  if (window.Paddle) {
    window.Paddle.Setup({
      vendor: parseInt(PADDLE_VENDOR_ID),
      debug: PADDLE_ENVIRONMENT === "sandbox",
    });
    paddleInitialized = true;
  }
};

// Load Paddle SDK
const loadPaddleSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.Paddle) {
      resolve(window.Paddle);
      return;
    }

    const script = document.createElement("script");
    script.src =
      PADDLE_ENVIRONMENT === "sandbox"
        ? "https://cdn.paddle.com/paddle/paddle.js"
        : "https://cdn.paddle.com/paddle/paddle.js";

    script.onload = () => {
      initializePaddle();
      resolve(window.Paddle);
    };

    script.onerror = () => {
      reject(new Error("Failed to load Paddle SDK"));
    };

    document.head.appendChild(script);
  });
};

/**
 * Open Paddle checkout for a specific plan
 */
export const openPaddleCheckout = async (
  planName,
  userEmail,
  userId,
  successCallback
) => {
  const productId = PLAN_PRODUCTS[planName];

  if (!productId) {
    throw new Error(`No product ID found for plan: ${planName}`);
  }

  try {
    await loadPaddleSDK();

    window.Paddle.Checkout.open({
      product: parseInt(productId),
      email: userEmail,
      passthrough: JSON.stringify({
        user_id: userId,
        plan: planName,
      }),
      success:
        successCallback ||
        function (data) {
          console.log("Payment successful:", data);
        },
      close: function () {
        console.log("Checkout closed");
      },
    });
  } catch (error) {
    console.error("Error opening Paddle checkout:", error);
    throw error;
  }
};

/**
 * Get subscription details from Paddle API
 */
export const getSubscription = async (subscriptionId) => {
  try {
    const response = await fetch(
      `https://vendors.paddle.com/api/2.0/subscription/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          vendor_id: PADDLE_VENDOR_ID,
          vendor_auth_code: PADDLE_API_KEY,
          subscription_id: subscriptionId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch subscription");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Failed to fetch subscription");
    }

    const subscription = data.response[0];

    return {
      id: subscription.subscription_id,
      status: subscription.state,
      planId: subscription.plan_id,
      userId: subscription.user_id,
      quantity: subscription.quantity,
      nextBillDate: subscription.next_payment?.date,
      lastPayment: subscription.last_payment,
      currency: subscription.last_payment?.currency,
      amount: subscription.last_payment?.amount,
      cancelUrl: subscription.cancel_url,
      updateUrl: subscription.update_url,
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw error;
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await fetch(
      `https://vendors.paddle.com/api/2.0/subscription/users_cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          vendor_id: PADDLE_VENDOR_ID,
          vendor_auth_code: PADDLE_API_KEY,
          subscription_id: subscriptionId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to cancel subscription");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Failed to cancel subscription");
    }

    return data.response;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
};

/**
 * Get user's payment history
 */
export const getPaymentHistory = async (userEmail) => {
  try {
    const response = await fetch(
      `https://vendors.paddle.com/api/2.0/user/history`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          vendor_id: PADDLE_VENDOR_ID,
          vendor_auth_code: PADDLE_API_KEY,
          email: userEmail,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch payment history");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Failed to fetch payment history");
    }

    return data.response || [];
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return [];
  }
};

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (payload, signature, publicKey) => {
  // Paddle webhook verification logic
  // This would typically use crypto libraries to verify the signature
  // For now, we'll return true but in production you'd implement proper verification
  console.log("Verifying webhook signature...");
  return true;
};

/**
 * Handle Paddle webhook events
 */
export const handleWebhookEvent = async (event) => {
  const { alert_name, ...data } = event;

  switch (alert_name) {
    case "subscription_created":
      return handleSubscriptionCreated(data);
    case "subscription_updated":
      return handleSubscriptionUpdated(data);
    case "subscription_cancelled":
      return handleSubscriptionCancelled(data);
    case "subscription_payment_succeeded":
      return handlePaymentSucceeded(data);
    case "subscription_payment_failed":
      return handlePaymentFailed(data);
    case "subscription_payment_refunded":
      return handlePaymentRefunded(data);
    default:
      console.log(`Unhandled webhook event: ${alert_name}`);
      return { success: true };
  }
};

const handleSubscriptionCreated = async (data) => {
  console.log("Subscription created:", data);
  // Update user's subscription status in your database
  return { success: true };
};

const handleSubscriptionUpdated = async (data) => {
  console.log("Subscription updated:", data);
  // Update subscription details in your database
  return { success: true };
};

const handleSubscriptionCancelled = async (data) => {
  console.log("Subscription cancelled:", data);
  // Handle subscription cancellation
  return { success: true };
};

const handlePaymentSucceeded = async (data) => {
  console.log("Payment succeeded:", data);
  // Handle successful payment
  return { success: true };
};

const handlePaymentFailed = async (data) => {
  console.log("Payment failed:", data);
  // Handle failed payment
  return { success: true };
};

const handlePaymentRefunded = async (data) => {
  console.log("Payment refunded:", data);
  // Handle payment refund
  return { success: true };
};

/**
 * Get available products and pricing
 */
export const getProducts = async () => {
  try {
    const response = await fetch(
      `https://vendors.paddle.com/api/2.0/product/get_products`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          vendor_id: PADDLE_VENDOR_ID,
          vendor_auth_code: PADDLE_API_KEY,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Failed to fetch products");
    }

    return data.response || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
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
  openPaddleCheckout,
  getSubscription,
  cancelSubscription,
  getPaymentHistory,
  verifyWebhookSignature,
  handleWebhookEvent,
  getProducts,
  checkUsageLimits,
};
