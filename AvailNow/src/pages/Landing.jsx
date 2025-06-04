// src/pages/Landing.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Globe,
  Smartphone,
  Star,
  Check,
  ArrowRight,
  Users,
  Building,
  Heart,
  BookOpen,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Real-Time Calendar Sync",
      description: "Sync with Google Calendar and Outlook automatically",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Embeddable Widget",
      description: "Add to any website with one line of code",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Responsive",
      description: "Perfect display on all devices",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Instant Availability",
      description: "Show real-time availability without manual updates",
    },
  ];

  const useCases = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Professional Services",
      description: "Consultants, lawyers, and advisors",
      examples: [
        "Legal consultations",
        "Business coaching",
        "Financial planning",
      ],
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-600" />,
      title: "Healthcare & Wellness",
      description: "Medical practices and wellness centers",
      examples: [
        "Doctor appointments",
        "Therapy sessions",
        "Wellness coaching",
      ],
    },
    {
      icon: <Building className="w-8 h-8 text-green-600" />,
      title: "Personal Services",
      description: "Beauty, fitness, and lifestyle services",
      examples: ["Hair salons", "Personal training", "Photography"],
    },
    {
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      title: "Education & Training",
      description: "Tutoring and educational services",
      examples: ["Music lessons", "Language tutoring", "Skills training"],
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Medical Practice",
      content:
        "AvailNow reduced our booking friction by 80%. Patients love seeing real-time availability.",
      rating: 5,
    },
    {
      name: "Mark Stevens",
      role: "Business Consultant",
      content:
        "Finally, a simple way to show my availability without the complexity of full booking systems.",
      rating: 5,
    },
    {
      name: "Lisa Chen",
      role: "Wellness Coach",
      content:
        "The widget integrates perfectly with my website. Setup took less than 5 minutes.",
      rating: 5,
    },
  ];

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleViewPricing = () => {
    navigate("/pricing");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary mr-2" />
              <span className="font-bold text-xl text-gray-900">AvailNow</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Show Your Availability
              <span className="text-primary block">Without the Hassle</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AvailNow lets you display real-time availability on your website
              instantly. No complex booking systems - just simple, beautiful
              availability display that syncs with your calendar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={handleViewPricing}
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50"
              >
                View Pricing
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              14-day free trial • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 mb-8">
              Trusted by professionals worldwide
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">500+</div>
              <div className="text-sm text-gray-500">Active Users</div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-2xl font-bold text-gray-400">50K+</div>
              <div className="text-sm text-gray-500">Widget Views</div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-2xl font-bold text-gray-400">99.9%</div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Display Availability
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, powerful features designed for professionals who want to
              show availability without complexity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Any Service-Based Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're a consultant, healthcare provider, or service
              professional, AvailNow adapts to your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  {useCase.icon}
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600">{useCase.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {useCase.examples.map((example, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Choose the plan that works for you
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="border border-gray-200 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Monthly
              </h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">R30</div>
              <p className="text-gray-600 mb-6">per month</p>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Unlimited widgets
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Calendar integrations
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Custom branding
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Email support
                </li>
              </ul>
              <button
                onClick={handleViewPricing}
                className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90"
              >
                Start Free Trial
              </button>
            </div>
            <div className="border border-primary rounded-lg p-8 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm">
                Best Value
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Lifetime
              </h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">R400</div>
              <p className="text-gray-600 mb-6">one-time payment</p>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Everything in Monthly
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Lifetime access
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Future updates included
                </li>
              </ul>
              <button
                onClick={handleViewPricing}
                className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90"
              >
                Get Lifetime Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Show Your Availability?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of professionals who trust AvailNow to display their
            availability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100"
            >
              Start Your Free Trial
            </button>
            <button
              onClick={handleViewPricing}
              className="border border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              View Pricing
            </button>
          </div>
          <p className="text-blue-200 mt-4">
            14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Calendar className="h-8 w-8 text-primary mr-2" />
                <span className="font-bold text-xl text-white">AvailNow</span>
              </div>
              <p className="text-gray-400">
                Simple availability display for professionals.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleViewPricing}
                    className="hover:text-white"
                  >
                    Pricing
                  </button>
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

export default Landing;
