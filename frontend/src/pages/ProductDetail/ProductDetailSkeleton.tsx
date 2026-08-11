function ProductDetailSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#FAF8F3] pt-20"
      aria-busy="true"
      aria-label="Loading fragrance"
    >
      <div className="max-w-350 mx-auto px-6 lg:px-10 py-5">
        <div className="h-4 w-64 animate-pulse bg-[#e6e1d8]" />
      </div>

      <div className="max-w-350 mx-auto px-6 lg:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-20 w-16 animate-pulse bg-[#e6e1d8]"
                />
              ))}
            </div>
            <div className="flex-1 aspect-4/5 animate-pulse bg-[#e6e1d8]" />
          </div>

          <div className="lg:py-4">
            <div className="h-3 w-28 animate-pulse bg-[#e6e1d8] mb-4" />
            <div className="h-12 max-w-md animate-pulse bg-[#e6e1d8] mb-4" />
            <div className="h-10 w-32 animate-pulse bg-[#e6e1d8] mb-10" />
            <div className="h-3 w-24 animate-pulse bg-[#e6e1d8] mb-4" />
            <div className="flex gap-3 mb-8">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-11 w-20 animate-pulse bg-[#e6e1d8]" />
              ))}
            </div>
            <div className="h-12 w-full animate-pulse bg-[#e6e1d8]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailSkeleton;
