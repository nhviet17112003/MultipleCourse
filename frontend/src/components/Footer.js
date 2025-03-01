import React from "react";
import { Facebook, Instagram, Twitter, Mail, PhoneCall, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer 
      className="relative text-gray-300 py-16 mt-16"
      style={{
        backgroundImage: "url('/apple-2562204_1280.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay để chữ dễ đọc hơn */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="relative container mx-auto px-6 lg:px-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1 - About Multicourse */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">About Multicourse</h2>
          <p className="text-sm text-gray-400">
            Multicourse is dedicated to providing high-quality online education for learners worldwide. 
            Join thousands of students in mastering new skills and advancing your career.
          </p>
        </div>

        {/* Column 2 - Contact Information */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={20} className="text-cyan-400" />
              123 Learning St, San Francisco, CA
            </li>
            <li className="flex items-center gap-2">
              <Mail size={20} className="text-cyan-400" />
              support@multicourse.com
            </li>
            <li className="flex items-center gap-2">
              <PhoneCall size={20} className="text-cyan-400" />
              +1 (123) 456-7890
            </li>
          </ul>
        </div>

        {/* Column 3 - Social Media */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Follow Us</h2>
          <div className="flex gap-4">
            <a href="#" className="hover:text-cyan-400 transition">
              <Facebook size={28} />
            </a>
            <a href="#" className="hover:text-cyan-400 transition">
              <Instagram size={28} />
            </a>
            <a href="#" className="hover:text-cyan-400 transition">
              <Twitter size={28} />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Multicourse. All rights reserved.</p>
        <p>
          <a href="#" className="hover:text-cyan-400 transition">Terms of Service</a> • 
          <a href="#" className="hover:text-cyan-400 transition ml-2">Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
}
