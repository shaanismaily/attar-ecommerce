import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import {
  getAllOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../../api/order";

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: "packed",
  packed: "shipped",
  shipped: "delivered",
  delivered: null,
  cancelled: null,
};
const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  packed: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-emerald-50 text-[#0F5132]",
  cancelled: "bg-red-50 text-red-600",
};

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllOrders({
        page: 1,
        limit: 50,
        query: "",
        sortType: "desc",
      });
      setOrders(response.data.data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not load orders.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);
  const advance = async (order: Order) => {
    const status = nextStatus[order.orderStatus];
    if (!status) return;
    setWorkingId(order._id);
    setError(null);
    try {
      await updateOrderStatus(order._id, status);
      await loadOrders();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not update order.",
      );
    } finally {
      setWorkingId(null);
    }
  };
  const visibleOrders = orders.filter((order) =>
    `${order._id} ${order.orderItems.map((item) => item.productName).join(" ")} ${order.shippingAddressSnapshot?.firstName ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-360 px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Fulfilment</p>
          <h1
            className="mt-2 text-3xl text-[#173a28] sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Orders
          </h1>
          <p className="mt-2 text-sm text-[#777]">
            Review new orders and move them through fulfilment.
          </p>
        </div>
        <button
          onClick={() => void loadOrders()}
          className="btn-outline flex w-fit items-center gap-2 px-4 py-3"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="mb-5 border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}
      <div className="border border-[#e5e1d7] bg-white">
        <div className="border-b border-[#eeeae1] p-4">
          <div className="relative max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]"
              size={17}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search orders"
              className="input-luxury py-2.5 pl-10"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-200">
            <thead>
              <tr className="border-b border-[#f0ede6] text-left text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[#999]">
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Fulfilment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-[#888]"
                  >
                    Loading orders…
                  </td>
                </tr>
              ) : visibleOrders.length ? (
                visibleOrders.map((order) => {
                  const next = nextStatus[order.orderStatus];
                  return (
                    <tr
                      key={order._id}
                      className="border-b border-[#f4f1eb] text-sm last:border-0 hover:bg-[#fcfbf8]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-[#999]">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[#666]">
                        {order.shippingAddressSnapshot
                          ? `${order.shippingAddressSnapshot.firstName} ${order.shippingAddressSnapshot.lastName}`
                          : "Customer"}
                        <p className="mt-1 text-xs text-[#999]">
                          {order.shippingAddressSnapshot
                            ? `${order.shippingAddressSnapshot.city}, ${order.shippingAddressSnapshot.state}`
                            : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[#666]">
                        {order.orderItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}{" "}
                        item(s)
                        <p className="mt-1 max-w-35 truncate text-xs text-[#999]">
                          {order.orderItems
                            .map((item) => item.productName)
                            .join(", ")}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-medium text-[#0F5132]">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 capitalize text-[#666]">
                        {order.paymentStatus}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-1 text-xs capitalize ${statusStyle[order.orderStatus]}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {next ? (
                          <button
                            disabled={workingId === order._id}
                            onClick={() => void advance(order)}
                            className="text-xs font-medium uppercase tracking-[0.09em] text-[#0F5132] hover:text-[#c9a227] disabled:opacity-40"
                          >
                            Mark {next}
                          </button>
                        ) : (
                          <span className="text-xs text-[#999]">Complete</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-[#888]"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Orders;
