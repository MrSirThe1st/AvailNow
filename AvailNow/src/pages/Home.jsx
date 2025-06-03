// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";
import {
  Calendar,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Globe,
  Clock,
  Users,
  BarChart,
  Zap,
  Code,
  MousePointer,
  Shield,
  CloudLightning,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hero section background style
  const heroBg = {
    backgroundImage:
      "linear-gradient(135deg, rgba(116, 142, 254, 0.2) 0%, rgba(36, 0, 255, 0.1) 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  // Features data
  const features = [
    {
      icon: <Calendar className="w-6 h-6 text-primary" />,
      title: "Calendar Synchronization",
      description:
        "Connect with Google Calendar, Microsoft Outlook, and other providers to sync your existing schedule.",
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "Real-Time Availability",
      description:
        "Show clients your available time slots updated in real-time as your schedule changes.",
    },
    {
      icon: <Code className="w-6 h-6 text-primary" />,
      title: "Embeddable Widget",
      description:
        "Add our widget to your website with a simple embed code. No coding skills required.",
    },
    {
      icon: <Globe className="w-6 h-6 text-primary" />,
      title: "Standalone Page",
      description:
        "Share your availability with a custom URL that can be added to social media profiles or email signatures.",
    },
    {
      icon: <MousePointer className="w-6 h-6 text-primary" />,
      title: "One-Click Booking",
      description:
        "Allow clients to select available times and book directly from your widget.",
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Fast Setup",
      description:
        "Get started in minutes with our easy-to-use interface and setup wizard.",
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Privacy Controls",
      description:
        "Control what information is visible to clients and how much of your schedule is shared.",
    },
    {
      icon: <BarChart className="w-6 h-6 text-primary" />,
      title: "Analytics Dashboard",
      description:
        "Track views, clicks, and bookings to measure the performance of your availability widget.",
    },
  ];

  // Pricing plans
  const pricingPlans = [
    {
      title: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals just getting started",
      features: [
        "1 calendar connection",
        "Basic widget customization",
        "5 bookings per month",
        "Email support",
      ],
      buttonText: "Get Started",
      buttonVariant: "outlined",
    },
    {
      title: "Pro",
      price: "$12",
      period: "per month",
      description: "Ideal for professionals and small businesses",
      features: [
        "Unlimited calendar connections",
        "Advanced widget customization",
        "Unlimited bookings",
        "Remove AvailNow branding",
        "Priority support",
      ],
      buttonText: "Subscribe Now",
      buttonVariant: "contained",
      highlighted: true,
    },
    {
      title: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "Team management",
        "API access",
        "SSO authentication",
        "Dedicated account manager",
        "SLA guarantees",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outlined",
    },
  ];

  // Testimonials
  const testimonials = [
    {
      content:
        "AvailNow has eliminated the back-and-forth emails completely. My clients can see when I'm available and book instantly. It's been a game-changer for my business.",
      author: "Sarah Johnson",
      position: "Independent Consultant",
      avatar: "/api/placeholder/50/50",
    },
    {
      content:
        "We implemented AvailNow across our team of 15 consultants and saw consultation bookings increase by 40% in the first month. The ROI has been incredible.",
      author: "Michael Chen",
      position: "Director of Operations, TechConsult Inc.",
      avatar: "/api/placeholder/50/50",
    },
    {
      content:
        "As a therapist, having a professional way to display my availability while maintaining client privacy is crucial. AvailNow provides exactly what I need.",
      author: "Dr. Emily Rodriguez",
      position: "Clinical Psychologist",
      avatar: "/api/placeholder/50/50",
    },
  ];

  // FAQ items
  const faqItems = [
    {
      question: "How does AvailNow work with my existing calendar?",
      answer:
        "AvailNow connects securely to your Google Calendar, Microsoft Outlook, or Apple Calendar using OAuth. We only read your calendar to check when you're busy - we never modify your events or access sensitive details. Your availability updates in real-time as your schedule changes.",
    },
    {
      question: "Can I customize how my availability appears to clients?",
      answer:
        "Absolutely! You can customize colors, text, time slot duration, and more. You control which days and hours to display, buffer time between appointments, and how far in advance clients can book.",
    },
    {
      question: "Is there a limit to how many bookings I can receive?",
      answer:
        "Free accounts can receive up to 5 bookings per month. Pro accounts have unlimited bookings. You can upgrade or downgrade your plan at any time.",
    },
    {
      question: "How do I add AvailNow to my website?",
      answer:
        "Simply copy the embed code from your dashboard and paste it into your website's HTML. No coding skills required. If you don't have a website, you can use our standalone page feature to share your availability with a custom URL.",
    },
    {
      question: "Can my clients book appointments directly through the widget?",
      answer:
        "Yes! Clients can select an available time slot and book directly. You can also configure the widget to redirect clients to your existing booking system if you prefer.",
    },
  ];

  // Handle the call-to-action click
  const handleGetStarted = () => {
    if (user) {
      navigate("/calendar");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="bg-white font-sans">
      {/* Hero Section */}
      <section style={heroBg} className="py-20 md:py-32 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-block px-3 py-1 bg-primary bg-opacity-10 rounded-full text-primary text-sm font-medium mb-6">
            Streamline Your Scheduling
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Show Your Real-Time Availability <br className="hidden md:block" />
            <span className="text-primary">
              Without the Booking Infrastructure
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            AvailNow lets you display your real-time availability to clients in
            a beautiful widget. Connect your calendar, embed on your website,
            and eliminate scheduling friction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center justify-center"
            >
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="px-8 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              See Demo
            </button>
          </div>
        </div>
      </section>

      {/* Clients/Users Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-gray-600 mb-2">
              Trusted by professionals and businesses worldwide
            </p>
            <div className="flex justify-center flex-wrap gap-10 opacity-70">
              {/* Add client logos here - using placeholders */}
              <div className="h-8 w-32 bg-gray-300 rounded"></div>
              <div className="h-8 w-28 bg-gray-300 rounded"></div>
              <div className="h-8 w-36 bg-gray-300 rounded"></div>
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
              <div className="h-8 w-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features, Simple Interface
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to display your availability, without the
              complexity of full-featured booking systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get up and running in minutes with our simple three-step process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-2">
                  1. Connect Calendar
                </h3>
                <p className="text-gray-600">
                  Connect your Google Calendar, Microsoft Outlook, or Apple
                  Calendar to sync your existing schedule.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-2">
                  2. Set Availability
                </h3>
                <p className="text-gray-600">
                  Define your working hours, buffer times, and any specific
                  availability rules you need.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-2">3. Embed Widget</h3>
                <p className="text-gray-600">
                  Add our widget to your website with a simple embed code or
                  share your standalone page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                See AvailNow in Action
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our beautiful, customizable widget seamlessly integrates with
                your website, showing clients your real-time availability
                without redirecting them elsewhere.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Automatically syncs with your calendar</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Fully customizable to match your brand</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Mobile-friendly responsive design</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Install with one line of code</span>
                </li>
              </ul>
              <button
                onClick={() => navigate("/widget")}
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-all inline-flex items-center"
              >
                Try the Widget <ChevronRight className="ml-1 w-5 h-5" />
              </button>
            </div>
            <div className="md:w-1/2 bg-gray-100 rounded-xl overflow-hidden shadow-md">
              {/* Widget preview mockup */}
              <div className="p-4 bg-white">
                <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-4 bg-blue-600 text-white">
                    <h3 className="font-bold">Check Availability</h3>
                    <div className="flex items-center mt-2">
                      <div className="w-8 h-8 bg-white rounded-full mr-2 flex items-center justify-center text-blue-600 font-bold">
                        A
                      </div>
                      <div>
                        <p className="text-sm">Acme Consulting</p>
                        <p className="text-xs opacity-75">San Francisco, CA</p>
                      </div>
                    </div>
                  </div>

                  {/* Calendar preview */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <p className="font-medium">September 2023</p>
                      <div className="flex space-x-2">
                        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100">
                          &lt;
                        </button>
                        <button className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100">
                          &gt;
                        </button>
                      </div>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                        <div
                          key={i}
                          className="text-xs font-medium text-gray-500 py-1"
                        >
                          {day}
                        </div>
                      ))}
                      {[...Array(35)].map((_, i) => (
                        <div
                          key={i}
                          className={`text-xs p-1 h-7 w-7 flex items-center justify-center mx-auto rounded-full
                            ${i === 15 ? "bg-blue-100 text-blue-600 font-bold" : ""}
                            ${i > 2 && i < 30 ? "text-gray-800" : "text-gray-400"}`}
                        >
                          {((i - 2) % 31) + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="p-4">
                    <p className="font-medium mb-3">
                      Available Times for Sept 15
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        "9:00 AM",
                        "10:00 AM",
                        "11:00 AM",
                        "1:00 PM",
                        "2:00 PM",
                        "3:00 PM",
                        "4:00 PM",
                        "5:00 PM",
                      ].map((time, i) => (
                        <div
                          key={i}
                          className="text-center p-2 text-xs border rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 p-2 bg-blue-600 text-white rounded-md text-sm">
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals who have simplified their
              scheduling with AvailNow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 italic">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works for you. All plans include core
              features with no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`
                  bg-white rounded-xl border overflow-hidden
                  ${
                    plan.highlighted
                      ? "border-primary shadow-md transform md:-translate-y-4"
                      : "border-gray-200 shadow-sm"
                  }
                `}
              >
                {plan.highlighted && (
                  <div className="bg-primary text-white text-center text-sm py-1 font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      plan.buttonVariant === "contained"
                        ? "bg-primary text-white hover:bg-opacity-90"
                        : "border border-primary text-primary hover:bg-primary hover:text-white"
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about AvailNow. Can't find the answer
              you're looking for?
              <a href="#" className="text-primary ml-1 hover:underline">
                Contact our support team
              </a>
              .
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <details className="group">
                    <summary className="flex items-center justify-between p-6 cursor-pointer">
                      <h3 className="text-lg font-medium">{item.question}</h3>
                      <span className="ml-6 flex-shrink-0 text-primary group-open:rotate-180 transition-transform">
                        <ChevronRight size={20} />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-gray-600">{item.answer}</div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Show Your Availability?
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join thousands of professionals who have simplified their scheduling
            with AvailNow. Get started for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-white text-primary rounded-lg font-medium hover:bg-opacity-90 transition-all"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="px-8 py-3 border border-white rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-all"
            >
              See Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
