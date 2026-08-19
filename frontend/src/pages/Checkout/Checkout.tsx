import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";
import { useState } from "react";
import AddressStep from "./AddressStep";
import ShippingMethod, { type KeyType } from "./ShippingMethod"
import PaymentMethod from "./PaymentMethod";
import Review from "./Review";
import type { Address } from "../../api/addresses";

const STEPS = [
  { id: 1, label: "Address" },
  { id: 2, label: "Shipping" },
  { id: 3, label: "Payment" },
  { id: 4, label: "Review" },
];

function Checkout() {
  const { cart, clearCart } = useCart();
  // const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [ordered, setOrdered] = useState(false);

  const [payment, setPayment] = useState<"card" | "upi" | "cod">("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  const [ selectedAddressId, setSelectedAddressId ] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [shipping, setShipping] = useState<KeyType>("standard");

  type ShippingMethod = "standard";
  const FREE_SHIPPING_THRESHOLD = 599;
  const STANDARD_SHIPPING_COST = 60;

  const shippingCosts: Record<ShippingMethod, number> = {
    standard: STANDARD_SHIPPING_COST,
  };
  
  const shippingCost =
       shipping === "standard" && (cart?.totalAmount ?? 0) >= FREE_SHIPPING_THRESHOLD
           ? 0
           : shippingCosts[shipping];

  const shippingLabels: Record<
      ShippingMethod,
      {
          label: string;
          desc: string;
          price: string;
      }
  > = {
      standard: {
          label: "Standard Delivery",
          desc: "5-7 business days",
          price: shippingCost == 0 ? 
            "Free" : `₹${shippingCost}`,
      },
  };

  const tax = Math.round((cart?.totalAmount ?? 0) * 0.03);

  const grandTotal = (cart?.totalAmount ?? 0) + shippingCost + tax;
  const handlePlaceOrder = async () => {
    clearCart();
    setOrdered(true);
  };

  if (ordered) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] pt-32 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-[#0F5132] flex items-center justify-center mx-auto mb-6">
            <svg
              width="36"
              height="36"
              fill="none"
              stroke="white"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="section-label mb-4">Order Confirmed</p>
          <h2
            className="text-4xl font-bold text-[#222] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Thank You, {selectedAddress?.firstName || "Dear Customer"}
          </h2>
          <p
            className="text-[#888] mb-3 leading-relaxed"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Your order{" "}
            <strong className="text-[#222]">
              #NQ{Math.floor(Math.random() * 90000 + 10000)}
            </strong>{" "}
            has been placed successfully.
          </p>
          <p
            className="text-[#888] mb-10 leading-relaxed"
            style={{ fontFamily: "var(--font-sans)" }}
          >
          Your precious attars are being prepared with care.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary inline-block">
              Continue Shopping
            </Link>
            <Link
              to="/dashboard/orders"
              className="btn-outline inline-block"
              style={{ color: "#0F5132", borderColor: "#0F5132" }}
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart?.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] pt-32 flex items-center justify-center">
        <div className="text-center">
          <h2
            className="text-3xl font-bold text-[#222] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nothing to checkout
          </h2>
          <Link to="/shop" className="btn-primary inline-block">
            Browse Fragrances
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
          <h1
            className="text-4xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Checkout
          </h1>
          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${step >= s.id ? "text-white" : "text-white/40"}`}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors ${
                      step > s.id
                        ? "bg-[#C9A227] text-white"
                        : step === s.id
                          ? "bg-white text-[#0F5132]"
                          : "border border-white/30 text-white/40"
                    }`}
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {step > s.id ? "✓" : s.id}
                  </div>
                  <span
                    className="text-[0.7rem] tracking-[0.12em] uppercase hidden sm:block"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-8 sm:w-16 mx-3 transition-colors ${step > s.id ? "bg-[#C9A227]" : "bg-white/20"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
          {/* Form Area */}
          <div className="flex-1">
            {/* Step 1: Address */}
            {step === 1 && (
              <AddressStep
                setSelectedAddressId={setSelectedAddressId}
                selectedAddressId={selectedAddressId}
                setStep={setStep}
                setSelectedAddress={setSelectedAddress}
              />
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <ShippingMethod
                shippingLabels={shippingLabels}
                setStep={setStep}
                shipping={shipping}
                setShipping={setShipping}
              />
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <PaymentMethod 
                setStep={setStep}
                payment={payment}
                setPayment={setPayment}
                card={card}
                setCard={setCard}
              />
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <Review  
                setStep={setStep}
                payment={payment}
                handlePlaceOrder={handlePlaceOrder}
                grandTotal={grandTotal}
                cart={cart}
                card={card}
              />
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white border border-[#e8e4d8] p-6 sticky top-28">
              <h3
                className="font-bold text-[#222] mb-5 pb-4 border-b border-[#e8e4d8]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                }}
              >
                Your Order ({cart?.items.length} items)
              </h3>
              <div className="space-y-3 mb-5">
                {cart?.items.map((item) => (
                  <div
                    key={`${item.product._id}-${item.variant.volume}`}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-13 bg-[#f5f2ec] overflow-hidden shrink-0">
                      <img
                        src={item.product.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium text-[#333] truncate"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {item.product.name}
                      </p>
                      <p
                        className="text-[0.65rem] text-[#888]"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {item.variant.volume} × {item.quantity}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold text-[#0F5132]"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      ₹{(item.variant.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="divider-gold mb-4" />
              <div className="space-y-2 mb-4">
                <div
                  className="flex justify-between text-sm"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <span className="text-[#666]">Subtotal</span>
                  <span>₹{cart?.totalAmount.toLocaleString()}</span>
                </div>
                <div
                  className="flex justify-between text-sm"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <span className="text-[#666]">Shipping</span>
                  <span className={shippingCost === 0 ? "text-[#0F5132]" : ""}>
                    {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                  </span>
                </div>
                <div
                  className="flex justify-between text-sm"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <span className="text-[#666]">Tax</span>
                  <span>₹{tax}</span>
                </div>
              </div>
              <div
                className="flex justify-between font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="text-[#222]">Total</span>
                <span className="text-[#0F5132] text-xl">
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
