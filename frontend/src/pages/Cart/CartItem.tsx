import { Link } from "react-router-dom";
import type { Cart } from "../../api/cart";

export type CartItemData = Cart["items"][number];

type CartItemProps = {
  item: CartItemData;
  isAuthenticated: boolean;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
};

function CartItem({ item, isAuthenticated, onRemove, onUpdateQuantity }: CartItemProps) {
  const itemId = isAuthenticated ? item._id : item.variant._id;
  const productUrl = `/product/${item.product.slug}`;

  return (
    <div className="flex gap-5 bg-white p-5 border border-[#e8e4d8] hover:border-[#C9A227]/30 transition-colors group">
      <Link to={productUrl} className="shrink-0"><div className="w-24 h-32 overflow-hidden bg-[#f5f2ec]"><img src={item.product.images[0]?.url} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div></Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2"><div><p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A227] mb-0.5" style={{ fontFamily: "var(--font-sans)" }}>{item.product.category.name}</p><Link to={productUrl} className="font-semibold text-[#222] hover:text-[#0F5132] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{item.product.name}</Link></div><button type="button" onClick={() => onRemove(itemId)} className="text-[#ccc] hover:text-red-400 transition-colors p-1" aria-label={`Remove ${item.product.name}`}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg></button></div>
        <div className="flex flex-wrap items-center gap-3 mb-4"><span className="text-xs border border-[#d0ccc0] px-2 py-0.5 text-[#666]" style={{ fontFamily: "var(--font-sans)" }}>{item.variant.volume} ml</span></div>
        <div className="flex items-center justify-between flex-wrap gap-4"><div className="flex items-center border border-[#d0ccc0]"><button type="button" onClick={() => onUpdateQuantity(itemId, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-[#f5f2ec] transition-colors" aria-label="Decrease quantity"><svg width="12" height="12" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /></svg></button><span className="w-9 text-center text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>{item.quantity}</span><button type="button" onClick={() => onUpdateQuantity(itemId, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-[#f5f2ec] transition-colors" aria-label="Increase quantity"><svg width="12" height="12" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg></button></div><div className="text-right"><div className="font-bold text-lg text-[#0F5132]" style={{ fontFamily: "var(--font-display)" }}>₹{(item.variant.price * item.quantity).toLocaleString()}</div><div className="text-xs text-[#aaa]" style={{ fontFamily: "var(--font-sans)" }}>₹{item.variant.price.toLocaleString()} each</div></div></div>
      </div>
    </div>
  );
}

export default CartItem;
