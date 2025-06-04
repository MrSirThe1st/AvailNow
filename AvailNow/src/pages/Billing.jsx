// src/pages/Pricing.jsx
import React from "react";
import { Link} from "react-router-dom";
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


const Billing = () => {
  

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Billing;
