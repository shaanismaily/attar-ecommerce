import useAddress from "../../hooks/useAddress";

function DashboardAddresses() {
  const { addresses } = useAddress();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#222] mb-8" style={{ fontFamily: "var(--font-display)" }}>Saved Addresses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {addresses && addresses.length > 0 ? (
          addresses.map((address) => (
            <div key={address._id} className={`bg-white ${address.isDefault ? "border-2 border-[#0F5132]" : "border border-[#e8e4d8]"} p-6 relative`}>
              {address.isDefault && (
                <span className="absolute top-4 right-4 text-[0.6rem] tracking-widest uppercase bg-[#0F5132] text-white px-2 py-0.5 font-medium" style={{ fontFamily: "var(--font-sans)" }}>Default</span>
              )}
              <p className="font-semibold text-[#222] mb-1" style={{ fontFamily: "var(--font-sans)" }}>{address.addressType || "Address"}</p>
              <p className="text-sm text-[#666] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                {address.firstName} {address.lastName}<br />
                {address.street}<br />
                {address.city}, {address.state} {address.zipCode}<br />
                {address.country}
              </p>
              <div className="flex gap-3 mt-4">
                <button className="text-xs text-[#0F5132] hover:text-[#C9A227] transition-colors" style={{ fontFamily: "var(--font-sans)" }}>Edit</button>
                <button className="text-xs text-[#aaa] hover:text-red-400 transition-colors" style={{ fontFamily: "var(--font-sans)" }}>Remove</button>
              </div>
            </div>
          ))
        ) : null}
        <div className="bg-white border border-dashed border-[#d0ccc0] p-6 flex items-center justify-center cursor-pointer hover:border-[#C9A227] transition-colors group">
          <div className="text-center">
            <div className="w-10 h-10 border border-[#d0ccc0] flex items-center justify-center mx-auto mb-3 group-hover:border-[#C9A227] transition-colors">
              <svg width="18" height="18" fill="none" stroke="#888" strokeWidth="1.8" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <p className="text-sm text-[#888] group-hover:text-[#C9A227] transition-colors" style={{ fontFamily: "var(--font-sans)" }}>Add New Address</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAddresses;
