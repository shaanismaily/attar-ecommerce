// import React from 'react'
import { Link } from "react-router-dom";
import heroImage from "../assets/images/bg.avif";
import useCollections from "../hooks/useCollection";
import ProductCard from "../components/ProductCard";
import useFeaturedProduct from "../hooks/useFeaturedProduct";
import useProducts from "../hooks/useProducts";
import type { Product } from "../api/products";

function Home() {
  const { collections, error, loading, refetch } = useCollections();
  const { featuredProduct } = useFeaturedProduct()
  const { products } = useProducts({
    bestSeller: true,
    limit: 4
  });


  return (
    <div className="bg-(--color-ivory)">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Hero image"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#0a1f12]/90 via-[#0a1f12]/60 to-[#0a1f12]/20" />
          <div className="absolute inset-0 arabic-pattern opacity-30" />
        </div>

        <div className="relative z-10 max-w-250 mx-auto px-6 lg:px-10 py-32">
          <div className="max-w-2xl">
            <p className="section-label animate-fade-in-up mb-6">
              ✦ Est. 2025 · Arabian Heritage
            </p>
            <h1
              className="text-5xl lg:text-7xl text-white font-bold leading-[1.05] mb-6 animate-fade-in-up stagger-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Discover
              <br />
              <span className="gold-shimmer">Timeless</span>
              <br />
              Fragrances
            </h1>
            <p
              className="text-lg text-white/70 mb-4 font-light animate-fade-in-up stagger-2"
              style={{
                fontFamily: "var(--font-accent)",
                fontStyle: "italic",
                fontSize: "1.25rem",
              }}
            >
              Crafted with tradition. Inspired by elegance.
            </p>
            <p
              className="text-sm text-white/55 mb-10 leading-relaxed max-w-md animate-fade-in-up stagger-3"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Each attar is a story of rare ingredients, master craftsmanship,
              and centuries of Arabian perfumery tradition.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-4">
              <Link to="/shop" className="btn-primary inline-block text-center">
                Shop Now
              </Link>
              <Link
                to="/collections"
                className="btn-outline inline-block text-center"
              >
                Explore Collections
              </Link>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-scroll-bounce">
            <span
              className="text-[0.6rem] tracking-[0.25em] uppercase text-white/40"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Scroll
            </span>
            <div className="w-px h-10 bg-linear-to-b from-(--color-gold)/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="bg-(--color-emerald) py-4 overflow-hidden">
        <div className="flex gap-0 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="text-[0.65rem] tracking-[0.3em] uppercase text-(--color-gold) mx-10 font-medium"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              ✦ Royal Oudh &nbsp;·&nbsp; Pure Attars &nbsp;·&nbsp; Arabian
              Heritage &nbsp;·&nbsp; Handcrafted Excellence &nbsp;·&nbsp; 100%
              Natural &nbsp;·&nbsp; Free Shipping over ₹999
            </span>
          ))}
        </div>
      </div>

      {/* FEATURED COLLECTIONS */}
      <section className="py-20 lg:py-28 max-w-350 mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="section-label mb-4">Our Collections</p>
          <h2
            className="text-4xl lg:text-5xl font-bold text-(--color-charcoal) mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Curated for Connoisseurs
          </h2>
          <div className="divider-gold mx-auto w-24"></div>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          aria-busy={loading}
          aria-live="polite"
        >
          {loading &&
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="aspect-3/4 overflow-hidden bg-[#e8e3d8] animate-pulse"
                aria-label="Loading collection"
              >
                <div className="h-full flex flex-col justify-end p-5 bg-linear-to-t from-[#d8d1c1] via-[#e8e3d8] to-[#f3efe6]">
                  <div className="h-2 w-2/3 bg-[#c8c0b0] mb-3" />
                  <div className="h-5 w-4/5 bg-[#c8c0b0] mb-2" />
                  <div className="h-3 w-full bg-[#d5cebf]" />
                </div>
              </div>
            ))}

          {!loading && error && (
            <div className="col-span-full py-10 text-center">
              <p className="text-(--color-charcoal) mb-4">{error}</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => void refetch()}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && collections.length === 0 && (
            <p className="col-span-full py-10 text-center text-(--color-stone)">
              No collections are available yet.
            </p>
          )}

          {!loading &&
            !error &&
            collections.map((col) => (
              <Link
                key={col._id}
                to={`/shop?category=${col.slug}`}
                className="group relative overflow-hidden aspect-3/4 bg-[#0a2e1c]"
              >
                <img
                  src={col.image}
                  alt={col.name}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-[#0a1f12]/90 via-transparent to-transparent" />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p
                    className="text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A227] mb-1"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {col.productCount}{" "}
                    {col.productCount === 1 ? "fragrance" : "fragrances"}
                  </p>
                  <h3
                    className="text-white text-lg font-semibold leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {col.name}
                  </h3>
                  <p
                    className="text-white/60 text-xs mt-1 font-light"
                    style={{
                      fontFamily: "var(--font-accent)",
                      fontStyle: "italic",
                    }}
                  >
                    {col.description}
                  </p>
                </div>
                {/* Arrow on hover */}
                <div className="absolute top-4 right-4 w-8 h-8 border border-[#C9A227] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    stroke="#C9A227"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-16 lg:py-24 bg-[#f5f2ec]">
        <div className="max-w-350 mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-label mb-3">Best Sellers</p>
              <h2
                className="text-4xl font-bold text-[#222]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Our Most Loved Attars
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.length > 0 && products.map((product: Product) => (
              <ProductCard key={product._id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCT SPOTLIGHT */}
      <section className="py-20 lg:py-28 bg-[#0a2e1c] relative overflow-hidden">
        <div className="absolute inset-0 arabic-pattern opacity-20" />
        <div className="max-w-350 mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label text-[#C9A227] mb-4">Featured Attar</p>
              <h2
                className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {featuredProduct?.name}
                <br />
                <span className="gold-shimmer">The Crown Jewel</span>
              </h2>
              <p
                className="text-[#d4cfbf]/70 text-base mb-4 leading-relaxed"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                A majestic composition born from the heart of Assam's finest oud trees,
                aged for over a decade to achieve unparalleled depth and complexity.
              </p>
              <p
                className="text-[#C9A227] text-lg mb-8"
                style={{ fontFamily: "var(--font-accent)", fontStyle: "italic" }}
              >
                "{featuredProduct?.description}"
              </p>
              {/* Notes */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { label: "Top Notes", notes: ["Saffron", "Black Pepper"] },
                  { label: "Heart Notes", notes: ["Assam Oud", "Turkish Rose"] },
                  { label: "Base Notes", notes: ["Ambergris", "Musk"] },
                ].map((n) => (
                  <div key={n.label}>
                    <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A227] mb-2" style={{ fontFamily: "var(--font-sans)" }}>
                      {n.label}
                    </p>
                    {n.notes.map((note) => (
                      <p key={note} className="text-sm text-white/60" style={{ fontFamily: "var(--font-sans)" }}>
                        {note}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>₹4,800</span>
                  <span className="text-sm text-[#888] line-through ml-2" style={{ fontFamily: "var(--font-sans)" }}>₹5,500</span>
                </div>
                <Link to="/product/1" className="btn-gold flex-1 text-center inline-block">
                  Shop Now
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-4 bg-[#C9A227]/10 blur-3xl rounded-full" />
                <img
                  src={featuredProduct?.images?.[0]?.url ?? heroImage}
                  alt={featuredProduct?.name ?? "Featured attar"}
                  className="relative w-full object-cover shadow-2xl"
                />
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#C9A227] flex flex-col items-center justify-center text-center shadow-lg">
                  <span className="text-[#0a2e1c] text-[0.55rem] tracking-widest uppercase font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                    Rating
                  </span>
                  <span className="text-[#0a2e1c] text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>4.9</span>
                  <span className="text-[#0a2e1c] text-[0.5rem] tracking-widest" style={{ fontFamily: "var(--font-sans)" }}>★★★★★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-20 lg:py-28 max-w-350 mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="section-label mb-4">Our Promise</p>
          <h2
            className="text-4xl font-bold text-[#222] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Why Choose NAQSH
          </h2>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: (
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              ),
              title: "100% Original Attars",
              desc: "Every product is authenticated and sourced directly from master distillers across Arabia, India, and Southeast Asia.",
            },
            {
              icon: (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </>
              ),
              title: "Long Lasting Fragrance",
              desc: "Our pure attars are highly concentrated — a single application lasts 8 to 18 hours on skin and days on fabric.",
            },
            {
              icon: (
                <>
                  <rect x="3" y="1" width="18" height="22" rx="2" />
                  <path d="M7 8h10M7 12h10M7 16h6" />
                </>
              ),
              title: "Premium Packaging",
              desc: "Each attar arrives in hand-crafted gift packaging worthy of the most precious fragrance inside.",
            },
            {
              icon: (
                <path d="M5 12h14M12 5l7 7-7 7M3 17l-1 4 4-1 14-14-3-3L3 17z" />
              ),
              title: "Fast & Secure Delivery",
              desc: "Fully insured and tracked delivery to 40+ countries. Order by 2PM for same-day dispatch on weekdays.",
            },
          ].map((item, i) => (
            <div key={i} className="text-center group">
              <div className="w-16 h-16 border border-[#e0dbd0] flex items-center justify-center mx-auto mb-6 group-hover:border-[#C9A227] group-hover:bg-[#fdf9f0] transition-all duration-300">
                <svg width="26" height="26" fill="none" stroke="#C9A227" strokeWidth="1.5" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
              </div>
              <h3
                className="text-lg font-semibold text-[#222] mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.title}
              </h3>
              <p className="text-sm text-[#888] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
