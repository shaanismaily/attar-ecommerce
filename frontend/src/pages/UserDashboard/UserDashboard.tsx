import { useParams, Link } from "react-router-dom";
import DashboardOverview from "./DashboardOverview";
import DashboardOrders from "./DashboardOrders";
import DashboardAddresses from "./DashboardAddresses";
import DashboardSettings from "./DashboardSettings";
import useUser from "../../hooks/useUser";
import { logout } from "../../api/auth";
import { useDispatch } from "react-redux";
import { logout as reduxLogout } from "../../store/authSlice";

type DashTab = "overview" | "orders" | "wishlist" | "addresses" | "settings";

function UserDashboard() {
    const { user } = useUser()
    const { section } = useParams<{ section?: string }>();
    const activeTab = (section || "overview") as DashTab;
    const dispatch = useDispatch()

    const tabs: { id: DashTab; label: string; icon: string }[] = [
        { id: "overview", label: "Overview", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
        { id: "orders", label: "My Orders", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
        { id: "addresses", label: "Addresses", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
        { id: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return <DashboardOverview />;
            case "orders":
                return <DashboardOrders />;
            case "addresses":
                return <DashboardAddresses />;
            case "settings":
                return <DashboardSettings />;
            default:
                return <DashboardOverview />;
        }
    };

  return (
    <div className="bg-[#FAF8F3] min-h-screen pt-20">
      {/* Header */}
      <div className="bg-[#0a2e1c] py-12 relative overflow-hidden">
        <div className="absolute inset-0 arabic-pattern opacity-20" />
        <div className="relative max-w-350 mx-auto px-6 lg:px-10 flex items-center gap-5">
          <div className="w-14 h-14 bg-[#C9A227] flex items-center justify-center text-white text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {user?.fullName.at(0)?.toUpperCase()}
          </div>
          <div>
            <p className="text-white/60 text-xs tracking-widest uppercase mb-0.5" style={{ fontFamily: "var(--font-sans)" }}>Welcome back</p>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              {user?.fullName}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={`/dashboard/${tab.id === "overview" ? "" : tab.id}`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-[#0F5132] text-white"
                      : "text-[#666] hover:bg-white hover:text-[#0F5132]"
                  }`}
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d={tab.icon} />
                  </svg>
                  {tab.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-[#e8e4d8] mt-4">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[#888] hover:text-red-500 transition-colors"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <button
                    onClick={ async() => {
                      await logout()
                      dispatch(reduxLogout())
                    }}
                  >
                    Sign Out
                  </button>
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard