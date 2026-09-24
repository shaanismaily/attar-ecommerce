import { Link } from "react-router-dom";
import { ArrowUpRight, Package, ShoppingBag, Tags } from "lucide-react";
import useCollections from "../../hooks/useCollection";
import useProducts from "../../hooks/useProducts";

function Dashboard() {
  const { products, totalProducts, loading: productsLoading } = useProducts({ limit: 5, sortBy: "newest" });
  const { collections, loading: categoriesLoading } = useCollections();
  const inventory = products.reduce((total, product) => total + product.variants.reduce((stock, variant) => stock + variant.stock, 0), 0);

  const stats = [
    { label: "Products", value: productsLoading ? "—" : totalProducts, description: "Products in catalogue", icon: Package, href: "/admin/products" },
    { label: "Categories", value: categoriesLoading ? "—" : collections.length, description: `${collections.filter((category) => category.isActive).length} currently active`, icon: Tags, href: "/admin/categories" },
    { label: "Stock shown", value: productsLoading ? "—" : inventory, description: "Across latest products", icon: ShoppingBag, href: "/admin/products" },
  ];

  return (
    <div className="mx-auto max-w-360 px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="section-label">Store operations</p><h1 className="mt-2 text-3xl font-semibold text-[#173a28] sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>Good to see you.</h1><p className="mt-2 text-sm text-[#777]">Manage your catalogue and keep orders moving from one workspace.</p></div>
        <Link to="/admin/products" className="btn-primary w-fit px-5 py-3">Add product</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, description, icon: Icon, href }) => <Link key={label} to={href} className="group border border-[#e5e1d7] bg-white p-5 transition-shadow hover:shadow-md"><div className="mb-8 flex justify-between"><span className="grid h-10 w-10 place-items-center bg-[#0F5132]/8 text-[#0F5132]"><Icon size={19} /></span><ArrowUpRight size={17} className="text-[#bbb] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div><p className="text-3xl text-[#173a28]" style={{ fontFamily: "var(--font-display)" }}>{value}</p><p className="mt-1 text-sm font-medium text-[#444]">{label}</p><p className="mt-1 text-xs text-[#999]">{description}</p></Link>)}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="border border-[#e5e1d7] bg-white"><div className="flex items-center justify-between border-b border-[#eeeae1] px-5 py-4"><div><h2 className="text-xl text-[#173a28]" style={{ fontFamily: "var(--font-display)" }}>Recently added</h2><p className="mt-1 text-xs text-[#999]">Your latest catalogue items</p></div><Link to="/admin/products" className="text-xs font-medium uppercase tracking-[0.12em] text-[#0F5132] hover:text-[#c9a227]">View all</Link></div><div className="divide-y divide-[#f0ede6]">{products.length ? products.map((product) => <div key={product._id} className="flex items-center gap-3 px-5 py-3.5"><div className="h-11 w-10 overflow-hidden bg-[#f3f0e8]">{product.images[0] && <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{product.name}</p><p className="mt-0.5 text-xs text-[#999]">{product.category.name} · {product.gender}</p></div><span className={product.isPublished ? "bg-emerald-50 px-2 py-1 text-[0.63rem] font-medium text-[#0F5132]" : "bg-[#f5f2eb] px-2 py-1 text-[0.63rem] font-medium text-[#888]"}>{product.isPublished ? "Published" : "Draft"}</span></div>) : <p className="px-5 py-10 text-center text-sm text-[#888]">No products yet. Add your first fragrance to begin.</p>}</div></section>
        <section className="border border-[#e5e1d7] bg-[#173a28] p-6 text-white"><p className="text-[0.65rem] tracking-[0.18em] text-[#c9a227]">QUICK START</p><h2 className="mt-3 text-2xl" style={{ fontFamily: "var(--font-display)" }}>Set up your catalogue</h2><p className="mt-3 text-sm leading-6 text-white/65">Create a category first, then add its products with images, bottle sizes, price, stock, and fragrance notes.</p><div className="mt-7 space-y-3"><Link to="/admin/categories" className="flex items-center justify-between border border-white/15 px-4 py-3 text-sm hover:border-[#c9a227]"><span>1. Create categories</span><ArrowUpRight size={16} /></Link><Link to="/admin/products" className="flex items-center justify-between border border-white/15 px-4 py-3 text-sm hover:border-[#c9a227]"><span>2. Add products</span><ArrowUpRight size={16} /></Link></div></section>
      </div>
    </div>
  );
}

export default Dashboard;
