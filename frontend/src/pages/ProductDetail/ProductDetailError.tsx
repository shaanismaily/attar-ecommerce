type ProductDetailErrorProps = {
  message: string;
  onRetry: () => void;
};

function ProductDetailError({ message, onRetry }: ProductDetailErrorProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center pt-20">
      <div className="max-w-md px-6 text-center">
        <h2
          className="font-display text-2xl mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Unable to load fragrance
        </h2>
        <p className="text-[#666] mb-6">{message}</p>
        <button type="button" className="btn-primary" onClick={onRetry}>
          Try again
        </button>
      </div>
    </div>
  );
}

export default ProductDetailError;
