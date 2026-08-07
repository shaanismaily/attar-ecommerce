import type { Collection } from "../../api/collections";

type SidebarProps = {
  collections: Collection[];
  selectedCategories: string[];
  toggleCategory: (cat: string) => void;
};

const Sidebar = ({ collections, selectedCategories, toggleCategory }: SidebarProps) => (

    <div className="space-y-8">
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
    </div>
  );

  export default Sidebar;