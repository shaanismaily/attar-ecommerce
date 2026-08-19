
type CardType = {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
}

type PaymentMethodProps = {
    setStep: React.Dispatch<React.SetStateAction<number>>;
    payment: "card" | "upi" | "cod";
    card: CardType;
    setPayment: React.Dispatch<React.SetStateAction<"card" | "upi" | "cod">>;
    setCard: React.Dispatch<React.SetStateAction<CardType>>;
}

function PaymentMethod({ setStep, payment, card, setPayment, setCard }: PaymentMethodProps) {

  return (
    <div className="animate-fade-in">
      <h2
        className="text-2xl font-bold text-[#222] mb-8"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Payment Method
      </h2>
      <div className="space-y-4 mb-8">
        {[
          { key: "card", label: "Credit / Debit Card", icon: "💳" },
          { key: "upi", label: "UPI / Net Banking", icon: "📱" },
          { key: "cod", label: "Cash on Delivery", icon: "💵" },
        ].map((m) => (
          <label
            key={m.key}
            className={`flex items-center gap-4 p-5 bg-white border-2 cursor-pointer transition-colors ${payment === m.key ? "border-[#0F5132]" : "border-[#e8e4d8] hover:border-[#C9A227]/50"}`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === m.key ? "border-[#0F5132]" : "border-[#d0ccc0]"}`}
            >
              {payment === m.key && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#0F5132]" />
              )}
            </div>
            <input
              type="radio"
              name="payment"
              value={m.key}
              checked={payment === (m.key as typeof payment)}
              onChange={() => setPayment(m.key as typeof payment)}
              className="hidden"
            />
            <span className="text-lg">{m.icon}</span>
            <span
              className="font-medium text-sm text-[#222]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {m.label}
            </span>
          </label>
        ))}
      </div>

      {payment === "card" && (
        <div className="space-y-4 p-6 bg-white border border-[#e8e4d8] animate-fade-in">
          <div>
            <label
              className="block text-[0.68rem] tracking-[0.15em] uppercase text-[#888] mb-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Card Number
            </label>
            <input
              type="text"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
              placeholder="1234 5678 9012 3456"
              className="input-luxury"
              maxLength={19}
            />
          </div>
          <div>
            <label
              className="block text-[0.68rem] tracking-[0.15em] uppercase text-[#888] mb-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Name on Card
            </label>
            <input
              type="text"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              placeholder="As it appears on your card"
              className="input-luxury"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[0.68rem] tracking-[0.15em] uppercase text-[#888] mb-2"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Expiry Date
              </label>
              <input
                type="text"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                placeholder="MM / YY"
                className="input-luxury"
                maxLength={7}
              />
            </div>
            <div>
              <label
                className="block text-[0.68rem] tracking-[0.15em] uppercase text-[#888] mb-2"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                CVV
              </label>
              <input
                type="password"
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                placeholder="•••"
                className="input-luxury"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(2)}
          className="btn-outline px-8"
          style={{ color: "#444", borderColor: "#d0ccc0" }}
        >
          Back
        </button>
        <button onClick={() => setStep(4)} className="btn-primary px-12">
          Review Order
        </button>
      </div>
    </div>
  );
}

export default PaymentMethod;
