import { Link } from "react-router-dom"

function ShopHeader(selectedCategories: string[]) {
  return (
    <div className="bg-[#0a2e1c] pt-32 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 arabic-pattern opacity-25" />
        <div className="relative max-w-350 mx-auto px-6 lg:px-10">
          <p className="section-label text-[#C9A227] mb-3">Our Collection</p>
          <h1
            className="text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            All Attars
          </h1>
          <div
            className="flex items-center gap-2 text-sm text-white/40"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Link to="/" className="hover:text-[#C9A227] transition-colors">
              Home
            </Link>
            <span>›</span>
            <span>Shop</span>
            {selectedCategories.length === 1 && (
              <>
                <span>›</span>
                <span>{selectedCategories[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>
  )
}

export default ShopHeader