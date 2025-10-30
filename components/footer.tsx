import Link from 'next/link';
import { Heart, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-blue-500 fill-blue-500" />
              <span className="text-xl font-bold text-white">VolunteerHub</span>
            </div>
            <p className="text-sm text-gray-400">
              Connect with meaningful volunteer opportunities and make a difference in your community.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-sm hover:text-blue-500 transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-blue-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-blue-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">For Organizers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="text-sm hover:text-blue-500 transition-colors">
                  Become an Organizer
                </Link>
              </li>
              <li>
                <Link href="/organizer/dashboard" className="text-sm hover:text-blue-500 transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} VolunteerHub. All rights reserved.
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/privacy" className="text-xs hover:text-blue-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs hover:text-blue-500 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
