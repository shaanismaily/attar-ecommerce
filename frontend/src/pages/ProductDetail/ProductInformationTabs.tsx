import type { Product } from "../../api/products";

type ProductInformationTabsProps = {
  product: Product;
  activeTab: "description" | "notes" | "reviews";
  onChangeTab: (tab: "description" | "notes" | "reviews") => void;
};

function ProductInformationTabs({
  product,
  activeTab,
  onChangeTab,
}: ProductInformationTabsProps) {
  return (
    <div className="mt-20 border-t border-[#e8e4d8]">
      <div className="flex gap-0 border-b border-[#e8e4d8] mb-10">
        {(["description", "notes", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChangeTab(tab)}
            className={`px-8 py-4 text-[0.72rem] tracking-[0.15em] uppercase font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-[#C9A227] text-[#222]"
                : "border-transparent text-[#888] hover:text-[#444]"
            }`}
          >
            {tab === "description"
              ? "Description"
              : tab === "notes"
                ? "Fragrance Notes"
                : "Reviews"}
          </button>
        ))}
      </div>

      {activeTab === "description" && (
        <div className="max-w-3xl space-y-6">
          <p className="text-base text-[#555] leading-relaxed">{product.description}</p>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl">
          {[
            { label: "Top Notes", notes: product.fragranceNotes?.top?.notes ?? [], desc: product.fragranceNotes?.top?.description, color: "#f5f2ec" },
            { label: "Heart Notes", notes: product.fragranceNotes?.heart?.notes ?? [], desc: product.fragranceNotes?.heart?.description, color: "#fdf9f0" },
            { label: "Base Notes", notes: product.fragranceNotes?.base?.notes ?? [], desc: product.fragranceNotes?.base?.description, color: "#f0ede4" },
          ].map((tier) => (
            <div key={tier.label} className="p-6 border border-[#e8e4d8]" style={{ background: tier.color }}>
              <p className="section-label mb-2">{tier.label}</p>
              {tier.desc && (
                <p className="text-[0.7rem] text-[#aaa] mb-4 leading-relaxed">{tier.desc}</p>
              )}
              <div className="space-y-2">
                {tier.notes.length > 0 ? tier.notes.map((note) => (
                  <div key={note} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                    <span className="text-sm text-[#444]">{note}</span>
                  </div>
                )) : (
                  <p className="text-sm text-[#888]">No notes listed.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "reviews" && (
        <p className="text-base text-[#555]">Reviews will be available soon.</p>
      )}
    </div>
  );
}

export default ProductInformationTabs;
