import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { HamburgerIcon, CartIcon, AccountIcon } from "./icons";
import useCart from "../hooks/useCart";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const { cart } = useCart();
  const authStatus = useSelector((state: RootState) => state.auth.status);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    // setSearchOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";

  const navBg =
    scrolled || !isHome
      ? "bg-[#FAF8F3] shadow-[0_2px_32px_rgba(15,81,50,0.08)] border-b border-[#e8e4d8]"
      : "bg-transparent";

  const textColor = scrolled || !isHome ? "text-[#222222]" : "text-white";
  const logoColor = scrolled || !isHome ? "text-[#0F5132]" : "text-white";
  const hoverColor =
    scrolled || !isHome ? "hover:text-[#C9A227]" : "hover:text-[#C9A227]";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
      >
        <div className="max-w-350 mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              to="/"
              className={`flex flex-col leading-none transition-colors duration-300 ${logoColor}`}
            >
              <span
                className="font-display text-2xl font-bold tracking-wide"
                style={{ fontFamily: "var(--font-display)" }}
              >
                SHAAN
              </span>
              <span
                className="text-[0.55rem] tracking-[0.3em] uppercase"
                style={{ color: "#C9A227", fontFamily: "var(--font-sans)" }}
              >
                BY SHAAN ISMAILY
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[0.78rem] tracking-[0.12em] uppercase font-medium transition-colors duration-200 ${textColor} ${hoverColor} ${
                    location.pathname === link.to ? "text-[#C9A227]" : ""
                  }`}
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4">
              {!authStatus && (
                <Link
                  to="/login"
                  className={`flex items-center gap-1.5 px-4 py-2 border text-[0.72rem] tracking-widest uppercase font-medium transition-all duration-300 hover:bg-[#C9A227] hover:text-white ${
                    scrolled || !isHome
                      ? "text-black"
                      : "text-[#C9A227] border-[#C9A227]"
                  }`}
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Login
                </Link>
              )}

              {/* Account */}
              {authStatus && (
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-4 py-2 border text-[0.72rem] tracking-widest rounded-full uppercase font-medium transition-all duration-300 hover:bg-[#C9A227] hover:text-white hover:border-[#C9A227] ${
                    scrolled || !isHome
                      ? "text-black"
                      : "text-white"
                  }`}
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <AccountIcon />
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className={`p-2 relative transition-colors duration-200 ${textColor} ${hoverColor}`}
                aria-label="Cart"
              >
                <CartIcon />
                {(cart?.items?.length ?? 0) > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#0F5132] text-white text-[0.6rem] flex items-center justify-center font-medium">
                    {cart?.items?.length}
                  </span>
                )}
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`lg:hidden p-2 transition-colors ${textColor} ${hoverColor}`}
                aria-label="Menu"
              >
                <HamburgerIcon menuOpen={menuOpen} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-[#FAF8F3] border-t border-[#e8e4d8] px-6 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-3 text-[0.82rem] tracking-[0.15em] uppercase text-[#222] hover:text-[#C9A227] border-b border-[#f0ede4] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;
