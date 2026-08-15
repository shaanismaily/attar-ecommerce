import { useNavigate, Link } from "react-router-dom"
import useCart from "../hooks/useCart"
import { useSelector } from "react-redux"
import type { RootState } from "../store/store"

function Cart() {
    const { cart, removeFromCart, updateItemQuantity, updatingItem, error, loading, refetch } = useCart()
    const navigate = useNavigate()

      const authStatus = useSelector((state: RootState) => state.auth.status);
    
  
    const cartTotal = cart?.totalAmount ?? 0;
    const shipping = cartTotal >= 599 ? 0 : 60;
    const tax = cartTotal * 0.03;
    const grandTotal = cartTotal + shipping + tax;

  if (loading && !cart) {
    return (
      <div
        className="min-h-screen bg-[#FAF8F3] pt-32 flex items-center justify-center px-6"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#666]" style={{ fontFamily: "var(--font-sans)" }}>
            Loading your cart…
          </p>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] pt-32 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h2 className="text-3xl font-bold text-[#222] mb-3" style={{ fontFamily: "var(--font-display)" }}>
            We couldn't load your cart
          </h2>
          <p className="text-[#888] mb-8" style={{ fontFamily: "var(--font-sans)" }}>
            {error}
          </p>
          <button type="button" className="btn-primary" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] pt-32 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 border border-[#d0ccc0] flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" fill="none" stroke="#C9A227" strokeWidth="1.2" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#222] mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Your cart is empty
          </h2>
          <p className="text-[#888] mb-8" style={{ fontFamily: "var(--font-sans)" }}>
            Discover our collection of rare and precious attars.
          </p>
          <Link to="/shop" className="btn-primary inline-block">
            Explore Fragrances
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F3] min-h-screen pt-20">
      {/* Header */}
      <div className="bg-[#0a2e1c] py-12 relative overflow-hidden">
        <div className="absolute inset-0 arabic-pattern opacity-20" />
        <div className="relative max-w-350 mx-auto px-6 lg:px-10">
          <p className="section-label text-[#C9A227] mb-2">Your Selection</p>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Shopping Cart
          </h1>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">

          {/* Cart Items */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e8e4d8]">
              <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#888]" style={{ fontFamily: "var(--font-sans)" }}>
                {cart?.items.length} {cart?.items.length === 1 ? "item" : "items"}
              </span>
              <Link to="/shop" className="text-xs tracking-wide text-[#0F5132] hover:text-[#C9A227] transition-colors underline underline-offset-2" style={{ fontFamily: "var(--font-sans)" }}>
                Continue Shopping
              </Link>
            </div>

            <div className="space-y-4">
              {cart?.items.map((item) => (
                <div key={`${item.product.slug}-${item.variant.volume}`} className="flex gap-5 bg-white p-5 border border-[#e8e4d8] hover:border-[#C9A227]/30 transition-colors group">
                  {/* Image */}
                  <Link to={`/product/${item.product.slug}`} className="shrink-0">
                    <div className="w-24 h-32 overflow-hidden bg-[#f5f2ec]">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A227] mb-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                          {item.product.name}
                        </p>
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-semibold text-[#222] hover:text-[#0F5132] transition-colors"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => authStatus ? removeFromCart(item._id) : removeFromCart(item.variant._id)}
                        className="text-[#ccc] hover:text-red-400 transition-colors p-1"
                        aria-label="Remove"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-xs border border-[#d0ccc0] px-2 py-0.5 text-[#666]" style={{ fontFamily: "var(--font-sans)" }}>
                        {item.variant.volume}
                      </span>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                      {/* Qty */}
                      <div className="flex items-center border border-[#d0ccc0]">
                        <button
                          onClick={() => authStatus ? updateItemQuantity(item._id, item.quantity - 1) : updateItemQuantity(item.variant._id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#f5f2ec] transition-colors"
                          disabled={Boolean(updatingItem)}
                        >
                          <svg width="12" height="12" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                        <span className="w-9 text-center text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => authStatus ? updateItemQuantity(item._id, item.quantity + 1) : updateItemQuantity(item.variant._id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#f5f2ec] transition-colors"
                        >
                          <svg width="12" height="12" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-bold text-lg text-[#0F5132]" style={{ fontFamily: "var(--font-display)" }}>
                          ₹{(item.variant.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-xs text-[#aaa]" style={{ fontFamily: "var(--font-sans)" }}>
                          ₹{item.variant.price.toLocaleString()} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 xl:w-96">
            <div className="bg-white border border-[#e8e4d8] p-7 sticky top-28">
              <h3 className="text-xl font-bold text-[#222] mb-6 pb-4 border-b border-[#e8e4d8]" style={{ fontFamily: "var(--font-display)" }}>
                Order Summary
              </h3>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-sans)" }}>
                  <span className="text-[#666]">Subtotal</span>
                  <span className="text-[#222] font-medium">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-sans)" }}>
                  <span className="text-[#666]">Shipping</span>
                  <span className={shipping === 0 ? "text-[#0F5132] font-medium" : "text-[#222] font-medium"}>
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-sans)" }}>
                  <span className="text-[#666]">Tax (3%)</span>
                  <span className="text-[#222] font-medium">₹{tax}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="bg-[#fdf9f0] border border-[#e8d88a] px-4 py-3 mb-5">
                  <p className="text-xs text-[#8a7000]" style={{ fontFamily: "var(--font-sans)" }}>
                    Add ₹{(2999 - cartTotal).toLocaleString()} more for free shipping
                  </p>
                  <div className="h-1.5 bg-[#f0e8c0] mt-2 overflow-hidden">
                    <div className="h-full bg-[#C9A227]" style={{ width: `${Math.min((cartTotal / 2999) * 100, 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="divider-gold mb-5" />

              <div className="flex justify-between mb-6">
                <span className="font-bold text-[#222]" style={{ fontFamily: "var(--font-display)" }}>Total</span>
                <span className="font-bold text-xl text-[#0F5132]" style={{ fontFamily: "var(--font-display)" }}>
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="btn-primary w-full mb-4"
              >
                Proceed to Checkout
              </button>

              <div className="flex items-center justify-center gap-3 py-3 border border-[#e8e4d8]">
                {["VISA", "MC", "UPI", "PayTM"].map((method) => (
                  <span key={method} className="text-[0.6rem] font-bold text-[#999] tracking-wider px-1.5 py-0.5 border border-[#e8e4d8]" style={{ fontFamily: "var(--font-sans)" }}>
                    {method}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs text-[#aaa]" style={{ fontFamily: "var(--font-sans)" }}>
                <svg width="13" height="13" fill="none" stroke="#C9A227" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Secured by 256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
