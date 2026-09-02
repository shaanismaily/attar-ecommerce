import { Mail, MessageCircle, MapPin, Clock, ArrowUpRight } from "lucide-react";

export default function Contact() {
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Connect this to your backend/API later.
    console.log("Contact form submitted");
  };

  return (
    <main className="bg-[#FAF8F3] text-[#222222]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0F5132] py-24 text-[#FAF8F3] lg:py-32">
        <div className="absolute inset-0 arabic-pattern" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="section-label mb-6">
            Get In Touch
          </p>

          <h1 className="font-display text-5xl leading-tight sm:text-6xl">
            We'd love to
            <br />
            <span className="gold-shimmer italic">
              hear from you.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl font-accent text-xl leading-relaxed text-[#F0EDE4]">
            Have a question about a fragrance, an order, or simply need help
            finding your next scent? We're here to help.
          </p>
        </div>
      </section>

      {/* Contact options */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28">
        <div className="grid gap-6 md:grid-cols-3">
          {/* WhatsApp */}
          <a
            href="https://wa.me/918960055810"
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-[#e0dbd0] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl hover:shadow-[#C9A227]/10"
          >
            <div className="flex items-start justify-between">
              <MessageCircle className="h-7 w-7 text-[#0F5132]" />

              <ArrowUpRight className="h-5 w-5 text-[#8a8478] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>

            <h2 className="mt-10 font-display text-2xl text-[#0F5132]">
              WhatsApp
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#8a8478]">
              The quickest way to reach us for product recommendations,
              questions, or order assistance.
            </p>

            <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A227]">
              Chat With Us
            </span>
          </a>

          {/* Email */}
          <a
            href="mailto:shaanrazaismaily@gmail.com"
            className="group border border-[#e0dbd0] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl hover:shadow-[#C9A227]/10"
          >
            <div className="flex items-start justify-between">
              <Mail className="h-7 w-7 text-[#0F5132]" />

              <ArrowUpRight className="h-5 w-5 text-[#8a8478] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>

            <h2 className="mt-10 font-display text-2xl text-[#0F5132]">
              Email
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#8a8478]">
              Send us a message and we'll get back to you as soon as possible.
            </p>

            <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A227]">
              shaanrazaismaily@gmail.com
            </span>
          </a>

          {/* Support */}
          <div className="border border-[#e0dbd0] bg-white p-8">
            <Clock className="h-7 w-7 text-[#0F5132]" />

            <h2 className="mt-10 font-display text-2xl text-[#0F5132]">
              Support Hours
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#8a8478]">
              We're available to answer your questions and help you choose the
              right fragrance.
            </p>

            <div className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A227]">
              Mon — Sat
              <br />
              10:00 AM — 7:00 PM
            </div>
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="bg-[#F0EDE4]">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.3fr_0.7fr] lg:px-12 lg:py-28">
          {/* Form */}
          <div>
            <p className="section-label mb-5">
              Send A Message
            </p>

            <h2 className="font-display text-4xl text-[#0F5132] sm:text-5xl">
              How can we help?
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#8a8478]">
              Whether you have a question about an order or need help finding
              a fragrance that matches your taste, fill out the form below.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#444444]"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                    className="input-luxury"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#444444]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="input-luxury"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#444444]"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91"
                  className="input-luxury"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#444444]"
                >
                  Subject
                </label>

                <select
                  id="subject"
                  name="subject"
                  defaultValue=""
                  className="input-luxury"
                  required
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  <option value="order">
                    Order Assistance
                  </option>
                  <option value="fragrance">
                    Fragrance Recommendation
                  </option>
                  <option value="product">
                    Product Question
                  </option>
                  <option value="shipping">
                    Shipping & Delivery
                  </option>
                  <option value="other">
                    Something Else
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#444444]"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Tell us how we can help..."
                  required
                  className="input-luxury resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="border-t border-[#C9A227] pt-8">
              <p className="section-label">
                Looking For A Fragrance?
              </p>

              <h3 className="mt-5 font-display text-3xl leading-tight text-[#0F5132]">
                Not sure what to choose?
              </h3>

              <p className="mt-5 font-accent text-xl leading-relaxed text-[#444444]">
                Tell us what kind of fragrances you normally enjoy — sweet,
                woody, fresh, floral, warm, strong, or subtle — and we'll help
                you find something that suits you.
              </p>

              <a
                href="https://wa.me/918960055810"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mt-8 inline-flex items-center gap-3"
              >
                Ask For A Recommendation
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-16 border-t border-[#e0dbd0] pt-8">
              <MapPin className="h-6 w-6 text-[#C9A227]" />

              <h3 className="mt-5 font-display text-2xl text-[#0F5132]">
                Our Roots
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#8a8478]">
                Inspired by the fragrance heritage of Kannauj and the timeless
                art of attar.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-20 text-center lg:py-24">
        <p className="font-accent text-2xl italic text-[#C9A227]">
          Shaan
        </p>

        <h2 className="mt-3 font-display text-3xl text-[#0F5132] sm:text-4xl">
          Wear Your Story.
        </h2>

        <div className="mx-auto mt-6 w-20">
          <div className="divider-gold" />
        </div>
      </section>
    </main>
  );
}