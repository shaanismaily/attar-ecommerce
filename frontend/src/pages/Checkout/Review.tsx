import type { Address } from "../../api/addresses";
import type { Cart } from "../../api/cart"

type CardType = {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
}

type ReviewProps = {
    cart: Cart | null,
    grandTotal: number;
    handlePlaceOrder: () => void;
    payment: "card" | "upi" | "cod";
    card: CardType;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    address: Address
}

function Review({ cart, handlePlaceOrder, grandTotal, payment, card, setStep, address }: ReviewProps) {
  return (
    <div className="animate-fade-in">
                <h2
                  className="text-2xl font-bold text-[#222] mb-8"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Review Your Order
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-8">
                  {cart?.items.map((item) => (
                    <div
                      key={`${item.product._id}-${item.variant.volume}`}
                      className="flex items-center gap-4 bg-white p-4 border border-[#e8e4d8]"
                    >
                      <div className="w-16 h-20 bg-[#f5f2ec] overflow-hidden shrink-0">
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-semibold text-sm text-[#222]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {item.product.name}
                        </p>
                        <p
                          className="text-xs text-[#888] mt-0.5"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          Size: {item.variant.volume} · Qty: {item.quantity}
                        </p>
                      </div>
                      <div
                        className="font-bold text-[#0F5132]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        ₹{(item.variant.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Address summary */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-5 bg-white border border-[#e8e4d8]">
                    <p className="section-label mb-3">Delivery To</p>
                    <p
                      className="text-sm text-[#333] font-medium"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {address.firstName} {address.lastName}
                    </p>
                    <p
                      className="text-sm text-[#666]"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {address.street}
                    </p>
                    <p
                      className="text-sm text-[#666]"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                  </div>
                  <div className="p-5 bg-white border border-[#e8e4d8]">
                    <p className="section-label mb-3">Payment</p>
                    <p
                      className="text-sm text-[#333] font-medium capitalize"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {payment === "card"
                        ? "Credit/Debit Card"
                        : payment === "upi"
                          ? "UPI/Net Banking"
                          : "Cash on Delivery"}
                    </p>
                    {payment === "card" && card.number && (
                      <p
                        className="text-sm text-[#666]"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        **** **** **** {card.number.slice(-4)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(3)}
                    className="btn-outline px-8"
                    style={{ color: "#444", borderColor: "#d0ccc0" }}
                  >
                    Back
                  </button>
                  <button onClick={handlePlaceOrder} className="btn-gold px-12">
                    Place Order · ₹{grandTotal.toLocaleString()}
                  </button>
                </div>
              </div>
  )
}

export default Review