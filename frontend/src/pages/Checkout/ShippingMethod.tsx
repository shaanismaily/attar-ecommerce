export type KeyType = "standard";

type ShippingLabel = {
    label: string;
    desc: string;
    price: string;
};

type ShippingLabelsType = Record<KeyType, ShippingLabel>;

type ShippingMethodProps = {
    shippingLabels: ShippingLabelsType;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    shipping: KeyType;
    setShipping: React.Dispatch<React.SetStateAction<KeyType>>;
};

function ShippingMethod({
    shippingLabels,
    setStep,
    shipping,
    setShipping
}: ShippingMethodProps) {
  return (
    <div className="animate-fade-in">
      <h2
        className="text-2xl font-bold text-[#222] mb-8"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Shipping Method
      </h2>
      <div className="space-y-4">
        {(
          Object.keys(shippingLabels) as Array<keyof typeof shippingLabels>
        ).map((key) => {
          const info = shippingLabels[key];
          return (
            <label
              key={key}
              className={`flex items-center justify-between p-5 bg-white border-2 cursor-pointer transition-colors ${
                shipping === key
                  ? "border-[#0F5132]"
                  : "border-[#e8e4d8] hover:border-[#C9A227]/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shipping === key ? "border-[#0F5132]" : "border-[#d0ccc0]"}`}
                >
                  {shipping === key && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0F5132]" />
                  )}
                </div>
                <input
                  type="radio"
                  name="shipping"
                  value={key}
                  checked={shipping === key}
                  onChange={() => setShipping(key)}
                  className="hidden"
                />
                <div>
                  <p
                    className="font-medium text-[#222] text-sm"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {info.label}
                  </p>
                  <p
                    className="text-xs text-[#888]"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {info.desc}
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold text-sm ${info.price === "Free" ? "text-[#0F5132]" : "text-[#222]"}`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {info.price}
              </span>
            </label>
          );
        })}
      </div>
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(1)}
          className="btn-outline px-8"
          style={{ color: "#444", borderColor: "#d0ccc0" }}
        >
          Back
        </button>
        <button onClick={() => setStep(3)} className="btn-primary px-12">
          Continue to Payment
        </button>
      </div>
    </div>
  );
}

export default ShippingMethod;
