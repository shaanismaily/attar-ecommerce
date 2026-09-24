import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Boxes,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Tags,
  X,
} from "lucide-react";
import { logout as logoutRequest } from "../api/auth";
import { logout } from "../store/authSlice";
import type { RootState } from "../store/store";

const navigation = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const signOut = async () => {
    try {
      await logoutRequest();
    } finally {
      dispatch(logout());
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#222]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e7e3da] bg-white px-4 lg:hidden">
        <button onClick={() => setMenuOpen(true)} className="rounded p-2 text-[#0F5132]" aria-label="Open admin menu">
          <Menu size={21} />
        </button>
        <span className="font-semibold tracking-[0.18em] text-[#0F5132]" style={{ fontFamily: "var(--font-display)" }}>ATTAR / ADMIN</span>
        <NavLink to="/" aria-label="View storefront" className="rounded p-2 text-[#777]"><ChevronLeft size={21} /></NavLink>
      </header>

      {menuOpen && <button onClick={() => setMenuOpen(false)} aria-label="Close admin menu" className="fixed inset-0 z-40 bg-[#082f1c]/35 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-70 flex-col bg-[#0b3522] p-5 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-10 flex items-center justify-between px-2">
          <NavLink to="/admin" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="grid h-9 w-9 place-items-center border border-[#c9a227] text-[#c9a227]"><Boxes size={19} /></span>
            <span className="text-lg tracking-[0.12em]" style={{ fontFamily: "var(--font-display)" }}>ATTAR</span>
          </NavLink>
          <button onClick={() => setMenuOpen(false)} className="p-1 text-white/70 lg:hidden" aria-label="Close menu"><X size={21} /></button>
        </div>

        <p className="mb-3 px-3 text-[0.63rem] font-medium tracking-[0.18em] text-white/40">ADMINISTRATION</p>
        <nav className="space-y-1">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-3 text-sm transition-colors ${isActive ? "bg-[#c9a227] text-[#0b3522]" : "text-white/70 hover:bg-white/8 hover:text-white"}`}>
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-5">
          <div className="mb-4 flex items-center gap-3 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c9a227] text-sm font-semibold text-[#0b3522]">{user?.fullName?.charAt(0).toUpperCase()}</span>
            <div className="min-w-0"><p className="truncate text-sm">{user?.fullName}</p><p className="text-xs text-white/45">Administrator</p></div>
          </div>
          <NavLink to="/" className="mb-1 flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white"><ChevronLeft size={17} /> View storefront</NavLink>
          <button onClick={() => void signOut()} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-white/60 hover:text-white"><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-70"><Outlet /></main>
    </div>
  );
}

export default AdminLayout;
