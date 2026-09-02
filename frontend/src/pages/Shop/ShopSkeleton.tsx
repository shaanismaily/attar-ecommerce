const SKELETON_ITEMS = Array.from({ length: 6 }, (_, skeletonIndex) => skeletonIndex);

function ShopSkeleton() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
      aria-busy="true"
      aria-label="Loading products"
    >
      {SKELETON_ITEMS.map((skeletonItem) => (
        <div key={skeletonItem} className="bg-white flex flex-col">
          <div className="aspect-3/4 animate-pulse bg-[#e6e1d8]" />

          <div className="p-5 flex flex-col flex-1">
            <div className="h-2.5 w-20 animate-pulse bg-[#e6e1d8] mb-3" />
            <div className="h-5 w-3/4 animate-pulse bg-[#e6e1d8] mb-5" />
            <div className="h-5 w-24 animate-pulse bg-[#e6e1d8] mb-6" />
            <div className="h-11 w-full animate-pulse bg-[#e6e1d8] mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ShopSkeleton;