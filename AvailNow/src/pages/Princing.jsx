// src/pages/Pricing.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";
import {
  Calendar,
  Check,
  Star,
  ArrowRight,
  Clock,
  Globe,
  Smartphone,
  Users,
} from "lucide-react";
import { openPayFastCheckout } from "../lib/payfast";
import toast from "react-hot-toast";

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  const features = [
    "Unlimited availability widgets",
    "Real-time calendar sync (Google, Outlook)",
    "Custom widget branding and styling",
    "Mobile-responsive design",
    "Embed on unlimited websites",
    "Email support",
    "Analytics and insights",
    "Custom domain support",
  ];

  const lifetimeFeatures = [
    ...features,
    "Priority email support",
    "Early access to new features",
    "Lifetime updates included",
    "One-time payment, no recurring fees",
  ];

  const handlePurchase = (planType) => {
    if (!user) {
      localStorage.setItem("selectedPlan", planType);
      navigate("/login");
      return;
    }

    try {
      openPayFastCheckout(user.id, user.email, {
        firstName: user.user_metadata?.first_name || "User",
        lastName: user.user_metadata?.last_name || "Name",
        planType: planType,
      });
    } catch (error) {
      console.error("Error opening checkout:", error);
      toast.error("Failed to open checkout");
    }
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const testimonials = [
    {
      name: "Dr. Michael Rodriguez",
      role: "Healthcare Provider",
      content:
        "AvailNow eliminated the back-and-forth emails about availability. Patients can instantly see when I'm free.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Business Consultant",
      content:
        "The lifetime plan was a no-brainer. Set it once and never worry about subscription fees again.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Calendar className="h-8 w-8 text-primary mr-2" />
              <span className="font-bold text-xl text-gray-900">AvailNow</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/#features"
                className="text-gray-700 hover:text-primary"
              >
                Features
              </Link>
              <Link
                to="/#use-cases"
                className="text-gray-700 hover:text-primary"
              >
                Use Cases
              </Link>
              <Link to="/pricing" className="text-primary font-medium">
                Pricing
              </Link>
              {user ? (
                <Link
                  to="/calendar"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary"
                  >
                    Sign In
                  </Link>
                  <button
                    onClick={handleSignUp}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that works best for your business. Start with a
            14-day free trial.
          </p>
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === "monthly"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan("lifetime")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === "lifetime"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Lifetime
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div
              className={`border rounded-lg p-8 relative ${
                selectedPlan === "monthly"
                  ? "border-primary ring-2 ring-primary ring-opacity-20"
                  : "border-gray-200"
              }`}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Monthly Subscription
                </h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">R30</span>
                  <span className="text-xl text-gray-600 ml-2">per month</span>
                </div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase("monthly")}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                {user ? "Subscribe Monthly" : "Start Free Trial"}
              </button>

              {!user && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  14-day free trial • No credit card required
                </p>
              )}
            </div>

            {/* Lifetime Plan */}
            <div
              className={`border rounded-lg p-8 relative ${
                selectedPlan === "lifetime"
                  ? "border-primary ring-2 ring-primary ring-opacity-20"
                  : "border-gray-200"
              }`}
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Best Value
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Lifetime Access
                </h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">R400</span>
                  <span className="text-xl text-gray-600 ml-2">one-time</span>
                </div>
                <div className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm inline-block mb-4">
                  Save R260 per year
                </div>
                <p className="text-gray-600">Pay once, use forever</p>
              </div>

              <ul className="space-y-4 mb-8">
                {lifetimeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase("lifetime")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                Get Lifetime Access
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                One-time payment • No recurring fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AvailNow?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stop losing potential clients due to booking friction. Show your
              availability instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Save Time
              </h3>
              <p className="text-gray-600">
                No more back-and-forth emails about availability
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Increase Bookings
              </h3>
              <p className="text-gray-600">
                Clients can see availability immediately
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Integration
              </h3>
              <p className="text-gray-600">
                Add to any website with one line of code
              </p>
            </div>

            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mobile Ready
              </h3>
              <p className="text-gray-600">Looks perfect on all devices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's included in the free trial?
              </h3>
              <p className="text-gray-600">
                The 14-day free trial includes full access to all features:
                unlimited widgets, calendar integrations, custom branding, and
                email support.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your monthly subscription anytime from your
                account settings. Your access will continue until the end of
                your current billing period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What calendars do you integrate with?
              </h3>
              <p className="text-gray-600">
                We currently support Google Calendar and Microsoft Outlook. More
                integrations are coming soon including Apple Calendar and
                popular scheduling tools.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is the lifetime plan really lifetime?
              </h3>
              <p className="text-gray-600">
                Yes! Pay once and use AvailNow forever. You'll get all future
                updates and new features at no additional cost.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for both monthly and
                lifetime plans. If you're not satisfied, contact us for a full
                refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of professionals who trust AvailNow to display their
            availability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handlePurchase("monthly")}
              className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 flex items-center justify-center"
            >
              {user ? "Subscribe Monthly" : "Start Free Trial"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={() => handlePurchase("lifetime")}
              className="border border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              Get Lifetime Access
            </button>
          </div>
          {!user && (
            <p className="text-blue-200 mt-4">
              14-day free trial • No credit card required
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center mb-4">
                <Calendar className="h-8 w-8 text-primary mr-2" />
                <span className="font-bold text-xl text-white">AvailNow</span>
              </Link>
              <p className="text-gray-400">
                Simple availability display for professionals.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 AvailNow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
