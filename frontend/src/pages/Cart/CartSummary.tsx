import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCheckoutIntent } from "../../store/checkoutSlice";

type CartSummaryProps = {
  cartTotal: number;
  shipping: number;
  tax: string;
  grandTotal: number;
};

function CartSummary({ cartTotal, shipping, tax, grandTotal }: CartSummaryProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const goToCheckout = () => {
    dispatch(setCheckoutIntent({ type: "cart" }));
    navigate("/checkout");
  };

  return (
    <div className="lg:w-80 xl:w-96">
      <div className="bg-white border border-[#e8e4d8] p-7 sticky top-28">
        <h3 className="text-xl font-bold text-[#222] mb-6 pb-4 border-b border-[#e8e4d8]" style={{ fontFamily: "var(--font-display)" }}>Order Summary</h3>
        <div className="space-y-3 mb-5">
          <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-sans)" }}><span className="text-[#666]">Subtotal</span><span className="text-[#222] font-medium">₹{cartTotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-sans)" }}><span className="text-[#666]">Shipping</span><span className={shipping === 0 ? "text-[#0F5132] font-medium" : "text-[#222] font-medium"}>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
          <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-sans)" }}><span className="text-[#666]">Tax (3%)</span><span className="text-[#222] font-medium">₹{tax}</span></div>
        </div>
        {shipping > 0 && <div className="bg-[#fdf9f0] border border-[#e8d88a] px-4 py-3 mb-5"><p className="text-xs text-[#8a7000]" style={{ fontFamily: "var(--font-sans)" }}>Add ₹{(599 - cartTotal).toLocaleString()} more for free shipping</p><div className="h-1.5 bg-[#f0e8c0] mt-2 overflow-hidden"><div className="h-full bg-[#C9A227]" style={{ width: `${Math.min((cartTotal / 599) * 100, 100)}%` }} /></div></div>}
        <div className="divider-gold mb-5" />
        <div className="flex justify-between mb-6"><span className="font-bold text-[#222]" style={{ fontFamily: "var(--font-display)" }}>Total</span><span className="font-bold text-xl text-[#0F5132]" style={{ fontFamily: "var(--font-display)" }}>₹{grandTotal.toLocaleString()}</span></div>
        <button type="button" onClick={goToCheckout} className="btn-primary w-full mb-4">Proceed to Checkout</button>
        <div className="flex items-center justify-center gap-3 py-3 border border-[#e8e4d8]">{["VISA", "MC", "UPI", "PayTM"].map((method) => <span key={method} className="text-[0.6rem] font-bold text-[#999] tracking-wider px-1.5 py-0.5 border border-[#e8e4d8]" style={{ fontFamily: "var(--font-sans)" }}>{method}</span>)}</div>
        <div className="flex items-center gap-2 mt-4 text-xs text-[#aaa]" style={{ fontFamily: "var(--font-sans)" }}><svg width="13" height="13" fill="none" stroke="#C9A227" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg><span>Secured by 256-bit SSL encryption</span></div>
      </div>
    </div>
  );
}

export default CartSummary;
