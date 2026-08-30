import useOrder from "../../hooks/useOrder";

const statusColors: Record<string, string> = {
  Delivered: "bg-[#0F5132]/10 text-[#0F5132]",
  "In Transit": "bg-[#C9A227]/10 text-[#8a7000]",
  Processing: "bg-blue-50 text-blue-700",
  Cancelled: "bg-red-50 text-red-600",
};

function DashboardOrders() {
  const { orders } = useOrder();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#222] mb-8" style={{ fontFamily: "var(--font-display)" }}>My Orders</h2>
      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.orderedBy} className="bg-white border border-[#e8e4d8] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ede4]">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-sm text-[#222]" style={{ fontFamily: "var(--font-sans)" }}>Order</span>
                  <span className={`text-[0.62rem] px-2 py-0.5 font-medium ${statusColors[order.orderStatus] || "bg-gray-50 text-gray-600"}`} style={{ fontFamily: "var(--font-sans)" }}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0F5132]" style={{ fontFamily: "var(--font-display)" }}>₹{(order.totalAmount || 0).toLocaleString()}</p>
                  <p className="text-xs text-[#888]" style={{ fontFamily: "var(--font-sans)" }}>1 item</p>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="flex justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[#333]" style={{ fontFamily: "var(--font-sans)" }}>{order.orderItems.productName || "Product"}</p>
                    <p className="text-xs text-[#888]" style={{ fontFamily: "var(--font-sans)" }}>Qty: {order.orderItems.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#222]" style={{ fontFamily: "var(--font-sans)" }}>₹{(order.orderItems.price * order.orderItems.quantity).toLocaleString()}</span>
                </div>
              </div>
              <div className="px-6 pb-4 flex gap-3">
                <button className="btn-primary text-xs px-6 py-2">Reorder</button>
                {order.orderStatus === "shipped" && (
                  <button className="btn-outline text-xs px-6 py-2" style={{ color: "#0F5132", borderColor: "#0F5132" }}>Track Package</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-[#e8e4d8] p-8 text-center">
            <p className="text-[#888]" style={{ fontFamily: "var(--font-sans)" }}>You haven't placed any orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardOrders;
