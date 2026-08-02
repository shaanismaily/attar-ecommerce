import { Link } from "react-router";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#0a2e1c] text-[#d4cfbf]">
      {/* Top divider */}
      <div className="h-px bg-linear-to-r from-transparent via-[#C9A227] to-transparent" />

      {/* Main Footer Content */}
      <div className="max-w-350 mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <div className="text-3xl font-bold text-white tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
                SHAAN
              </div>
              <div className="text-[0.58rem] tracking-[0.3em] uppercase text-[#C9A227] mt-0.5">
                Luxury Attars
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-[#9a9585] mb-6 max-w-xs" style={{ fontFamily: "var(--font-sans)" }}>
              Authentic alcohol-free attars inspired by India's rich fragrance heritage. Crafted for those who appreciate timeless elegance.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { label: "Instagram", icon: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M6.5 20.5h11a5 5 0 0 0 5-5v-11a5 5 0 0 0-5-5h-11a5 5 0 0 0-5 5v11a5 5 0 0 0 5 5z" },
                { label: "Facebook", icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                { label: "Twitter/X", icon: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
                { label: "Pinterest", icon: "M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 border border-[#2a5a3c] flex items-center justify-center text-[#9a9585] hover:border-[#C9A227] hover:text-[#C9A227] transition-all duration-300"
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-[0.7rem] tracking-[0.2em] uppercase mb-6 font-medium" style={{ fontFamily: "var(--font-sans)" }}>
              Shop
            </h4>
            <ul className="space-y-3">
              {["All Attars", "Oudh Collection", "Floral Collection", "Musk Collection", "Amber Collection", "Gift Sets"].map((item) => (
                <li key={item}>
                  <Link
                    to="/shop"
                    className="text-sm text-[#9a9585] hover:text-[#C9A227] transition-colors duration-200"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white text-[0.7rem] tracking-[0.2em] uppercase mb-6 font-medium" style={{ fontFamily: "var(--font-sans)" }}>
              Company
            </h4>
            <ul className="space-y-3">
              {["Our Story", "Craftsmanship", "Sustainability", "Press", "Careers", "Contact Us"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-[#9a9585] hover:text-[#C9A227] transition-colors duration-200"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white text-[0.7rem] tracking-[0.2em] uppercase mb-6 font-medium" style={{ fontFamily: "var(--font-sans)" }}>
              Newsletter
            </h4>
            <p className="text-sm text-[#9a9585] mb-4 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
              Receive rare finds, new arrivals, and exclusive offers.
            </p>
            {subscribed ? (
              <p className="text-[#C9A227] text-sm font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                ✦ Welcome to the community
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full bg-transparent border border-[#2a5a3c] px-4 py-3 text-sm text-[#d4cfbf] placeholder:text-[#6a6558] outline-none focus:border-[#C9A227] transition-colors"
                  style={{ fontFamily: "var(--font-sans)" }}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#C9A227] text-[#0a2e1c] py-3 text-[0.7rem] tracking-[0.15em] uppercase font-semibold hover:bg-[#e4bc45] transition-colors duration-300"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#1a4a2e]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[0.72rem] text-[#6a6558] tracking-wide" style={{ fontFamily: "var(--font-sans)" }}>
            © {new Date().getFullYear()} SHAAN Luxury Attars. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Refund Policy", "Shipping Policy"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[0.7rem] text-[#6a6558] hover:text-[#C9A227] transition-colors tracking-wide"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
