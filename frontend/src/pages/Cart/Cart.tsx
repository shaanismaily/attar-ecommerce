import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import useCart from "../../hooks/useCart";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import CartEmptyState from "./CartEmptyState";
import CartItem from "./CartItem";
import CartMergeAlert from "./CartMergeAlert";
import CartSummary from "./CartSummary";

function Cart() {
  const { cart, removeFromCart, updateItemQuantity, error, loading, refetch } = useCart();
  const location = useLocation();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const [isCartMergeErrorDismissed, setIsCartMergeErrorDismissed] = useState(false);
  const cartMergeError = location.state?.cartMergeError as string | undefined;

  const cartTotal = cart?.totalAmount ?? 0;
  const shipping = cartTotal >= 599 ? 0 : 60;
  const tax = (cartTotal * 0.03).toFixed(2);
  const grandTotal = cartTotal + shipping + Number(tax);

  if (loading && !cart) return <CartLoadingState />;
  if (error && !cart) return <CartErrorState error={error} onRetry={() => void refetch()} />;
  if (!cart || cart.items.length === 0) {
    return <CartEmptyState mergeError={cartMergeError} isMergeErrorDismissed={isCartMergeErrorDismissed} onDismissMergeError={() => setIsCartMergeErrorDismissed(true)} />;
  }

  return (
    <div className="bg-[#FAF8F3] min-h-screen pt-20">
      <CartHeader />
      <div className="max-w-350 mx-auto px-6 lg:px-10 py-12">
        {cartMergeError && !isCartMergeErrorDismissed && <CartMergeAlert message={cartMergeError} onDismiss={() => setIsCartMergeErrorDismissed(true)} />}
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e8e4d8]">
              <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#888]" style={{ fontFamily: "var(--font-sans)" }}>{cart.items.length} {cart.items.length === 1 ? "item" : "items"}</span>
              <Link to="/shop" className="text-xs tracking-wide text-[#0F5132] hover:text-[#C9A227] transition-colors underline underline-offset-2" style={{ fontFamily: "var(--font-sans)" }}>Continue Shopping</Link>
            </div>
            <div className="space-y-4">
              {cart.items.map((item) => <CartItem key={`${item.product.slug}-${item.variant.volume}`} item={item} isAuthenticated={authStatus} onRemove={(id) => void removeFromCart(id)} onUpdateQuantity={(id, quantity) => void updateItemQuantity(id, quantity)} />)}
            </div>
          </div>
          <CartSummary cartTotal={cartTotal} shipping={shipping} tax={tax} grandTotal={grandTotal} />
        </div>
      </div>
    </div>
  );
}

function CartHeader() {
  return <div className="bg-[#0a2e1c] py-12 relative overflow-hidden"><div className="absolute inset-0 arabic-pattern opacity-20" /><div className="relative max-w-350 mx-auto px-6 lg:px-10"><p className="section-label text-[#C9A227] mb-2">Your Selection</p><h1 className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Shopping Cart</h1></div></div>;
}

function CartLoadingState() {
  return <div className="min-h-screen bg-[#FAF8F3] pt-32 flex items-center justify-center px-6" aria-busy="true" aria-live="polite"><div className="text-center"><div className="w-10 h-10 mx-auto mb-4 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" /><p className="text-[#666]" style={{ fontFamily: "var(--font-sans)" }}>Loading your cart...</p></div></div>;
}

function CartErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return <div className="min-h-screen bg-[#FAF8F3] pt-32 flex items-center justify-center px-6"><div className="text-center max-w-sm"><h2 className="text-3xl font-bold text-[#222] mb-3" style={{ fontFamily: "var(--font-display)" }}>We couldn't load your cart</h2><p className="text-[#888] mb-8" style={{ fontFamily: "var(--font-sans)" }}>{error}</p><button type="button" className="btn-primary" onClick={onRetry}>Try again</button></div></div>;
}

export default Cart;
