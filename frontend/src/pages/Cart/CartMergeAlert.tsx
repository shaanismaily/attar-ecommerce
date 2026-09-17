type CartMergeAlertProps = {
  message?: string;
  onDismiss: () => void;
};

function CartMergeAlert({ message, onDismiss }: CartMergeAlertProps) {
  if (!message) return null;

  return (
    <div className="mb-6 flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
      <p>{message}</p>
      <button type="button" onClick={onDismiss} className="-mr-1 -mt-1 rounded p-1 text-amber-900/70 transition-colors hover:bg-amber-100 hover:text-amber-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700" aria-label="Dismiss error">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
    </div>
  );
}

export default CartMergeAlert;
