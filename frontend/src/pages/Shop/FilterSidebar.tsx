import type { Collection } from "../../api/collections";
import type { Gender } from "../../api/products";

type SidebarProps = {
  collections: Collection[];
  selectedCategories: string[];
  toggleCategory: (cat: string) => void;
  genders: Gender[];
  selectedGender: Gender[];
  toggleGender: (g: Gender) => void;
  priceRange: [number, number];
  priceBounds: [number, number];
  setPriceRange: (range: [number, number]) => void;
  availability: boolean;
  toggleAvailability: () => void;
};

const Sidebar = ({
  collections,
  selectedCategories,
  toggleCategory,
  genders,
  selectedGender,
  toggleGender,
  priceRange,
  priceBounds,
  setPriceRange,
  availability,
  toggleAvailability
}: SidebarProps) => (
  <div className="space-y-8">
    {/* Category  */}
    <div>
      <h3
        className="text-[0.7rem] tracking-[0.2em] uppercase text-(--color-gold) mb-4 font-medium"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Collection
      </h3>
      <div className="space-y-2.5">
        {collections.map((cat) => (
          <label
            key={cat.name}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              onClick={() => toggleCategory(cat.name)}
              className={`w-4 h-4 border flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                selectedCategories.includes(cat.name)
                  ? "border-[#0F5132] bg-[#0F5132]"
                  : "border-[#d0ccc0] group-hover:border-[#C9A227]"
              }`}
            >
              {selectedCategories.includes(cat.name) && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span
              className="text-sm text-[#444] group-hover:text-[#0F5132] transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-sans)" }}
              onClick={() => toggleCategory(cat.name)}
            >
              {cat.name}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* Gender */}
    <div>
      <h3
        className="text-[0.7rem] tracking-[0.2em] uppercase text-[#C9A227] mb-4 font-medium"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Gender
      </h3>
      <div className="flex flex-wrap gap-2">
        {genders.map((g) => (
          <button
            key={g}
            onClick={() => toggleGender(g)}
            className={`px-4 py-1.5 text-xs border tracking-wide transition-colors duration-200 ${
              selectedGender.includes(g)
                ? "bg-[#0F5132] border-[#0F5132] text-white"
                : "border-[#d0ccc0] text-[#666] hover:border-[#C9A227] hover:text-[#C9A227]"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {g[0].toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>
    </div>

    {/* Price Range */}
    <div>
      <h3
        className="text-[0.7rem] tracking-[0.2em] uppercase text-[#C9A227] mb-4 font-medium"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Price Range
      </h3>
      <div className="space-y-3">
        <input
          type="range"
          min={priceBounds[0]}
          max={priceBounds[1]}
          step="100"
          value={priceRange[1]}
          onChange={(e) => {
            const maxPrice = Number(e.target.value);
            setPriceRange([priceBounds[0], maxPrice]);
          }}
          className="w-full accent-[#C9A227]"
        />
        <div
          className="flex justify-between text-xs text-[#888]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <span>₹{priceBounds[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>
    </div>

    {/* Availability */}
    <div>
      <h3
        className="text-[0.7rem] tracking-[0.2em] uppercase text-[#C9A227] mb-4 font-medium"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Availability
      </h3>
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          onClick={toggleAvailability}
          className={`w-9 h-5 rounded-full border relative transition-colors duration-300 cursor-pointer ${
            availability
              ? "bg-[#0F5132] border-[#0F5132]"
              : "bg-[#f0ede4] border-[#d0ccc0]"
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${availability ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </div>
        <span
          className="text-sm text-[#666]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          In stock only
        </span>
      </label>
    </div>
  </div>
);

export default Sidebar;
