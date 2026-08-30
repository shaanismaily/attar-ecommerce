import useOrder from "../../hooks/useOrder";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  Delivered: "bg-[#0F5132]/10 text-[#0F5132]",
  "In Transit": "bg-[#C9A227]/10 text-[#8a7000]",
  Processing: "bg-blue-50 text-blue-700",
  Cancelled: "bg-red-50 text-red-600",
};

function DashboardOverview() {
  const { orders } = useOrder();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#222] mb-8" style={{ fontFamily: "var(--font-display)" }}>Account Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Orders", value: orders?.length || "0", icon: "📦" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-5 border border-[#e8e4d8]">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-[#222]" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</div>
            <div className="text-xs text-[#888] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <h3 className="text-lg font-bold text-[#222] mb-4" style={{ fontFamily: "var(--font-display)" }}>Recent Orders</h3>
      <div className="space-y-3">
        {orders && orders.length > 0 ? (
          orders.slice(0, 2).map((order) => (
            <div key={order.orderedBy} className="bg-white border border-[#e8e4d8] p-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-sm text-[#222]" style={{ fontFamily: "var(--font-sans)" }}>Order</span>
                  <span className={`text-[0.62rem] px-2 py-0.5 font-medium tracking-wide ${statusColors[order.orderStatus] || "bg-gray-50 text-gray-600"}`} style={{ fontFamily: "var(--font-sans)" }}>
                    {order.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-[#888]" style={{ fontFamily: "var(--font-sans)" }}>
                  1 item
                </p>
              </div>
              <span className="font-bold text-[#0F5132]" style={{ fontFamily: "var(--font-display)" }}>₹{(order.totalAmount || 0).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#888]" style={{ fontFamily: "var(--font-sans)" }}>No orders yet</p>
        )}
      </div>
      <Link to="/dashboard/orders" className="inline-flex items-center gap-2 mt-4 text-xs tracking-widest uppercase text-[#0F5132] hover:text-[#C9A227] transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
        View All Orders <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </Link>
    </div>
  );
}

export default DashboardOverview;
