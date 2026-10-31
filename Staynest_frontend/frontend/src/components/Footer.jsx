import React from "react";
import { Link } from "react-router-dom";
import { Compass, Heart } from "lucide-react";

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/",
    path: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    path: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z",
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-600 text-sm mt-auto border-t border-gray-200 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top: brand + quick links */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500 text-white">
                <Compass className="w-5 h-5" />
              </span>
              <span className="font-bold text-gray-900 text-xl tracking-tight">StayNest</span>
            </div>
            <p className="text-sm text-gray-500 max-w-sm mx-auto sm:mx-0">
              Discover and book unique stay listings around the world with ease.
            </p>
          </div>

          <nav aria-label="Explore" className="text-center sm:text-left">
            <h4 className="font-semibold text-gray-900 mb-3">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-rose-500 transition-colors">All stays</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-rose-500 transition-colors">Wishlist</Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-rose-500 transition-colors">My bookings</Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Hosting" className="text-center sm:text-left">
            <h4 className="font-semibold text-gray-900 mb-3">Hosting</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/listings/new" className="hover:text-rose-500 transition-colors">Add a listing</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-rose-500 transition-colors">Log in</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-rose-500 transition-colors">Sign up</Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom: copyright + socials */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="font-semibold text-gray-800">StayNest, Inc.</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span aria-hidden="true">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for travelers
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 transition-all hover:text-rose-500 hover:border-rose-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;