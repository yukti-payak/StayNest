import React from "react";
import { Compass, Heart, ShieldCheck, CalendarCheck, Headphones, Mail, MapPin } from "lucide-react";

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

// Plain, non-clickable highlights (no duplicates of navbar links)
const highlights = [
  {
    icon: ShieldCheck,
    title: "Verified stays",
    text: "Every listing is reviewed before it goes live.",
  },
  {
    icon: CalendarCheck,
    title: "Easy booking",
    text: "Pick your dates and confirm in a few steps.",
  },
  {
    icon: Headphones,
    title: "Help when you need it",
    text: "Our team is available around the clock.",
  },
];

const Footer = () => {
  return (
    <footer className="relative z-10 mt-auto border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white text-sm text-gray-600">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.9fr] lg:gap-16">
          {/* Brand */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-200">
                <Compass className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight text-gray-900">StayNest</span>
            </div>

            <p className="max-w-sm leading-relaxed text-gray-500">
              Find and book unique stays around the world, from beach houses to mountain cabins.
            </p>

            <ul className="space-y-2 text-gray-500">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-rose-500" />
                <span>Hosts and travelers in 50+ countries</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-rose-500" />
                <span>support@staynest.com</span>
              </li>
            </ul>
          </div>

          {/* Highlights */}
          <div className="grid gap-8 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3.5 sm:flex-col sm:gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 ring-1 ring-rose-100">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">{title}</h4>
                  <p className="mt-1 leading-relaxed text-gray-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-xs text-gray-500 sm:flex-row">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="font-semibold text-gray-800">StayNest, Inc.</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> for travelers
            </span>
          </p>

          <div className="flex items-center gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
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