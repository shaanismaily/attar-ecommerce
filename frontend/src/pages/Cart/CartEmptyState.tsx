import { Link } from "react-router-dom";
import CartMergeAlert from "./CartMergeAlert";

type CartEmptyStateProps = {
  mergeError?: string;
  isMergeErrorDismissed: boolean;
  onDismissMergeError: () => void;
};

function CartEmptyState({ mergeError, isMergeErrorDismissed, onDismissMergeError }: CartEmptyStateProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-32 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {mergeError && !isMergeErrorDismissed && <CartMergeAlert message={mergeError} onDismiss={onDismissMergeError} />}
        <div className="w-20 h-20 border border-[#d0ccc0] flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" fill="none" stroke="#C9A227" strokeWidth="1.2" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-[#222] mb-3" style={{ fontFamily: "var(--font-display)" }}>Your cart is empty</h2>
        <p className="text-[#888] mb-8" style={{ fontFamily: "var(--font-sans)" }}>Discover our collection of rare and precious attars.</p>
        <Link to="/shop" className="btn-primary inline-block">Explore Fragrances</Link>
      </div>
    </div>
  );
}

export default CartEmptyState;
