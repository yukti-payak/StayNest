import React from "react";
import { Compass, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-600 text-sm mt-auto border-t border-gray-200 py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Section: Brand & Description */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-200 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Compass className="w-5 h-5 text-rose-500" />
              <span className="font-bold text-gray-900 text-lg tracking-tight">
                StayNest
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-md">
              Discover and book unique stay listings around the world with ease.
            </p>
          </div>
        </div>

        {/* Bottom Section: Copyright & Social Icons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          
          {/* Copyright & Tagline */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold text-gray-800">StayNest, Inc.</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-gray-500">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for travelers
            </span>
          </div>

          {/* Social Icons (Static Visuals) */}
          <div className="flex items-center gap-2.5">
            {/* GitHub */}
            <div className="p-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-gray-600 transition cursor-default">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>

            {/* LinkedIn */}
            <div className="p-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-gray-600 transition cursor-default">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </div>

            {/* X / Twitter */}
            <div className="p-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-gray-600 transition cursor-default">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;