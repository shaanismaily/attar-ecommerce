import { useState, type FormEvent } from "react";
import { ImagePlus, Plus, Power, Trash2, X } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "../../api/collections";
import useCollections from "../../hooks/useCollection";

function Categories() {
  const { collections, loading, error, refetch } = useCollections();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => { setName(""); setDescription(""); setImage(null); setIsActive(true); setOpen(false); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!image) { setMessage("Please choose an image for the category."); return; }
    setSaving(true); setMessage(null);
    try { await createCategory({ name: name.trim(), description: description.trim(), isActive, image }); await refetch(); resetForm(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not create category."); }
    finally { setSaving(false); }
  };
  const changeActive = async (id: string, active: boolean) => { setMessage(null); try { await updateCategory(id, { isActive: !active }); await refetch(); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update category."); } };
  const remove = async (id: string, categoryName: string, productCount: number) => { if (!window.confirm(`Delete “${categoryName}”?${productCount ? " It is assigned to existing products, so review those first." : ""}`)) return; setMessage(null); try { await deleteCategory(id); await refetch(); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete category."); } };

  return <div className="mx-auto max-w-360 px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-label">Catalogue structure</p><h1 className="mt-2 text-3xl text-[#173a28] sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>Categories</h1><p className="mt-2 text-sm text-[#777]">Group your fragrances into collections shoppers can browse.</p></div><button onClick={() => setOpen((value) => !value)} className="btn-primary flex w-fit items-center gap-2 px-5 py-3"><Plus size={16} /> {open ? "Close form" : "Add category"}</button></div>
    {open && <form onSubmit={(event) => void submit(event)} className="mb-7 border border-[#e5e1d7] bg-white p-5 sm:p-7"><div className="flex items-start justify-between"><div><h2 className="text-2xl text-[#173a28]" style={{ fontFamily: "var(--font-display)" }}>New category</h2><p className="mt-1 text-sm text-[#777]">Use a clear name and a strong image to make collections easier to shop.</p></div><button type="button" onClick={resetForm} className="text-[#888]" aria-label="Close category form"><X size={20} /></button></div><div className="mt-6 grid gap-5 md:grid-cols-2"><label><span className="mb-2 block text-[0.68rem] tracking-[0.15em] text-[#777]">CATEGORY NAME</span><input required value={name} onChange={(event) => setName(event.target.value)} className="input-luxury" placeholder="e.g. Traditional Attars" /></label><label><span className="mb-2 block text-[0.68rem] tracking-[0.15em] text-[#777]">CATEGORY IMAGE</span><span className="flex min-h-11 cursor-pointer items-center gap-2 border border-dashed border-[#d7d1c5] px-3 text-sm text-[#777]"><ImagePlus size={17} /><span className="truncate">{image?.name ?? "Choose image"}</span><input required type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="sr-only" /></span></label><label className="md:col-span-2"><span className="mb-2 block text-[0.68rem] tracking-[0.15em] text-[#777]">DESCRIPTION</span><textarea required value={description} onChange={(event) => setDescription(event.target.value)} className="input-luxury min-h-25" placeholder="A short introduction to this collection" /></label><label className="flex items-center gap-3 text-sm text-[#444]"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 accent-[#0F5132]" /> Make this category visible to customers</label></div><div className="mt-6 flex gap-3"><button disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Creating…" : "Create category"}</button><button type="button" onClick={resetForm} className="btn-outline">Cancel</button></div></form>}
    {message && <p role="alert" className="mb-5 border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{message}</p>}{error && <p className="mb-5 border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    {loading ? <p className="py-12 text-center text-sm text-[#888]">Loading categories…</p> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{collections.map((category) => <article key={category._id} className="overflow-hidden border border-[#e5e1d7] bg-white"><div className="h-35 bg-[#f3f0e8]">{category.image && <img src={category.image} alt="" className="h-full w-full object-cover" />}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl text-[#173a28]" style={{ fontFamily: "var(--font-display)" }}>{category.name}</h2><p className="mt-1 text-xs text-[#999]">{category.productCount} {category.productCount === 1 ? "product" : "products"}</p></div><span className={category.isActive ? "bg-emerald-50 px-2 py-1 text-[0.63rem] text-[#0F5132]" : "bg-[#f3f0e9] px-2 py-1 text-[0.63rem] text-[#777]"}>{category.isActive ? "Active" : "Hidden"}</span></div><p className="mt-4 min-h-10 text-sm leading-5 text-[#777]">{category.description}</p><div className="mt-5 flex border-t border-[#f0ede6] pt-4"><button onClick={() => void changeActive(category._id, category.isActive)} className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[#0F5132] hover:text-[#c9a227]"><Power size={14} /> {category.isActive ? "Hide" : "Activate"}</button><button onClick={() => void remove(category._id, category.name, category.productCount)} className="ml-auto flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[#999] hover:text-red-600"><Trash2 size={14} /> Delete</button></div></div></article>)}{!collections.length && <div className="col-span-full border border-dashed border-[#d7d1c5] py-14 text-center text-sm text-[#888]">No categories yet. Create a category before adding products.</div>}</div>}
  </div>;
}

export default Categories;
