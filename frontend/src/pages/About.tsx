import { Link } from "react-router-dom";

const values = [
  {
    number: "01",
    title: "Thoughtful Fragrances",
    description:
      "We select fragrances for their character, balance, and the experience they create — not simply to fill a catalogue.",
  },
  {
    number: "02",
    title: "Rooted in Tradition",
    description:
      "Inspired by India's remarkable fragrance heritage and the timeless craft of attar, with a modern approach to discovery.",
  },
  {
    number: "03",
    title: "Made Personal",
    description:
      "Fragrance is deeply personal. Our goal is to help you discover scents that feel like an extension of who you are.",
  },
];

const promises = [
  "Thoughtfully selected fragrances",
  "Clear and honest product information",
  "Carefully packed orders",
  "Customer-first service",
];

export default function About() {
  return (
    <main className="bg-[#FAF8F3] text-[#222222]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0F5132] text-[#FAF8F3]">
        <div className="absolute inset-0 arabic-pattern opacity-60" />

        <div className="relative mx-auto flex min-h-155 max-w-7xl items-center px-6 py-24 lg:px-12">
          <div className="grid w-full items-center gap-16 lg:grid-cols-2">
            <div className="animate-fade-in-up">
              <p className="section-label mb-6">
                The Story Behind Shaan
              </p>

              <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
                Fragrance
                <br />
                <span className="gold-shimmer italic">
                  that feels personal.
                </span>
              </h1>

              <div className="my-8 h-px w-24 bg-[#C9A227]" />

              <p className="max-w-xl font-accent text-2xl leading-relaxed text-[#F0EDE4]">
                A modern fragrance house inspired by the timeless world of
                attar.
              </p>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-5 border border-[#C9A227]/30" />

              <div className="relative aspect-4/5 overflow-hidden bg-[#0a3b24]">
                <img
                  src="/src/assets/images/attar.jpg"
                  alt="Traditional attar bottles"
                  className="h-full w-full object-cover opacity-90"
                />

                <div className="absolute inset-0 bg-linear-to-t from-[#0F5132]/50 to-transparent" />
              </div>

              <p className="mt-5 text-center font-accent text-lg italic text-[#d4b04a]">
                Inspired by tradition. Made for today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center lg:py-32">
        <p className="section-label mb-5">Our Story</p>

        <h2 className="font-display text-4xl text-[#0F5132] sm:text-5xl">
          It started with curiosity.
        </h2>

        <div className="mx-auto my-8 w-24">
          <div className="divider-gold" />
        </div>

        <div className="mx-auto max-w-3xl space-y-6 font-accent text-xl leading-relaxed text-[#444444]">
          <p>
            Shaan began with a fascination for the world of attar — its rich
            aromas, its craftsmanship, and the way a fragrance can become
            connected to a memory, a moment, or a person.
          </p>

          <p>
            That curiosity led us to Kannauj, India's historic perfume city,
            where we explored the fragrance world firsthand and discovered the
            depth behind a craft that has been part of India's cultural story
            for generations.
          </p>

          <p>
            We came away with a simple belief:
            <span className="text-[#0F5132] italic">
              {" "}
              attar isn't simply an old-fashioned alternative to perfume.
              It's a different way of experiencing fragrance.
            </span>
          </p>
        </div>
      </section>

      {/* Image / Story */}
      <section className="bg-[#F0EDE4]">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="min-h-112.5">
            <img
              src="/src/assets/images/kannauj.jpg"
              alt="Kannauj perfume craftsmanship"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex items-center px-6 py-20 sm:px-12 lg:px-20">
            <div>
              <p className="section-label mb-5">From Kannauj</p>

              <h2 className="font-display text-4xl leading-tight text-[#0F5132] sm:text-5xl">
                Where India's fragrance story comes alive.
              </h2>

              <div className="my-7 h-px w-20 bg-[#C9A227]" />

              <div className="space-y-5 font-accent text-xl leading-relaxed text-[#444444]">
                <p>
                  Kannauj holds a special place in India's perfume heritage.
                  Walking through its fragrance markets gave us a deeper
                  appreciation for the people, ingredients, and craftsmanship
                  behind the scents we love.
                </p>

                <p>
                  Shaan is our way of taking that appreciation forward —
                  creating a modern space where anyone can discover and enjoy
                  the world of fragrance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Attar */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label mb-5">Why Attar?</p>

          <h2 className="font-display text-4xl text-[#0F5132] sm:text-5xl">
            More than a fragrance.
          </h2>

          <div className="mx-auto my-8 w-24">
            <div className="divider-gold" />
          </div>

          <p className="font-accent text-xl leading-relaxed text-[#444444]">
            Attars are concentrated perfume oils that sit close to the skin
            and develop with your natural body chemistry. The result is a
            fragrance experience that feels intimate, distinctive, and
            personal.
          </p>
        </div>

        <div className="mt-16 grid gap-px bg-[#C9A227]/20 md:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.number}
              className="bg-[#FAF8F3] px-8 py-10 text-center transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="font-accent text-lg italic text-[#C9A227]">
                {value.number}
              </span>

              <h3 className="mt-4 font-display text-2xl text-[#0F5132]">
                {value.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#8a8478]">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="relative overflow-hidden bg-[#0F5132] py-24 text-[#FAF8F3] lg:py-32">
        <div className="absolute inset-0 arabic-pattern" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="section-label mb-6">Our Philosophy</p>

          <blockquote className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
            “Your fragrance should not simply smell good.
            <span className="text-[#C9A227]"> It should feel like you.</span>”
          </blockquote>

          <div className="mx-auto mt-10 h-px w-20 bg-[#C9A227]" />
        </div>
      </section>

      {/* Promise */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="section-label mb-5">Our Promise</p>

            <h2 className="font-display text-4xl leading-tight text-[#0F5132] sm:text-5xl">
              The experience matters.
            </h2>

            <div className="my-7 h-px w-20 bg-[#C9A227]" />

            <p className="font-accent text-xl leading-relaxed text-[#444444]">
              When you choose Shaan, you're trusting us to help you discover
              something worth wearing. We're committed to making that
              experience thoughtful from discovery to delivery.
            </p>
          </div>

          <div className="border-y border-[#d4b04a]/40">
            {promises.map((promise, index) => (
              <div
                key={promise}
                className="flex items-center gap-6 border-b border-[#e0dbd0] py-6 last:border-b-0"
              >
                <span className="font-accent text-lg text-[#C9A227]">
                  0{index + 1}
                </span>

                <span className="text-sm font-medium uppercase tracking-[0.12em] text-[#444444]">
                  {promise}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#F0EDE4] px-6 py-24 text-center">
        <p className="section-label mb-5">The Beginning</p>

        <h2 className="font-display text-4xl text-[#0F5132] sm:text-5xl">
          This is just the beginning.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl font-accent text-xl leading-relaxed text-[#444444]">
          We're building Shaan one fragrance at a time — and we'd love for you
          to be part of the journey.
        </p>

        <Link
          to="/shop"
          className="btn-primary mt-10 inline-block"
        >
          Explore The Collection
        </Link>
      </section>
    </main>
  );
}