import React, { useState, useEffect } from "react";

export default function VendorForm({
  onAddProduct,
  onUpdateProduct,
  onClose,
  darkMode,
  currentUser,
  initialData,
}) {
  const isEditMode = Boolean(initialData);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [hasPromo, setHasPromo] = useState(false);
  const [promoTag, setPromoTag] = useState("PROMO MAHASISWA");
  const [category, setCategory] = useState("makan");
  const [isLateNight, setIsLateNight] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const formatRupiah = (value) => {
    const rawNumber = String(value).replace(/[^0-9]/g, "");
    if (!rawNumber) return "";
    return new Intl.NumberFormat("id-ID").format(rawNumber);
  };

  const parseRawNumber = (formattedValue) => {
    return parseInt(String(formattedValue).replace(/[^0-9]/g, ""), 10) || 0;
  };

  const parseNumber = (val) => Number(String(val || 0).replace(/\D/g, ""));

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPrice(
        initialData.price ? formatRupiah(String(initialData.price)) : "",
      );

      setHasPromo(Boolean(initialData.promo_tag));
      setPromoTag(initialData.promo_tag || "PROMO MAHASISWA");
      setCategory(initialData.category || "makan");
      setIsLateNight(Boolean(initialData.is_late_night));
      setImagePreview(initialData.image_url || "");
    }
  }, [initialData]);

  // Handler Upload File Gambar Lokal
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const normalNumber = parseNumber(price);
    if (!name.trim() || normalNumber <= 0) {
      setSubmitError("Nama produk dan harga yang valid wajib diisi.");
      return;
    }

    const productPayload = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name,
      vendor_id: currentUser?.id,
      price: parseRawNumber(price),
      maps_url: currentUser?.gmaps_url || "",
      category,
      is_late_night: isLateNight,
      promo_tag: hasPromo ? promoTag || "PROMO SPECIAL" : null,
      image_url:
        imagePreview ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
      is_active:
        initialData?.is_active !== undefined ? initialData.is_active : true,
    };

    setIsSaving(true);
    try {
      if (isEditMode) {
        await onUpdateProduct(productPayload);
      } else {
        await onAddProduct(productPayload);
      }
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan produk:", error);
      setSubmitError(
        error.message || "Gagal menyimpan produk. Silakan coba lagi.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className={`w-full max-w-md rounded-3xl p-6 md:p-8 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
          darkMode
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* HEADER MODAL */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base">
              {isEditMode ? "Edit Menu / Promo" : "Tambah Menu / Promo Baru"}
            </h3>
            <p className="text-[11px] text-emerald-500 font-bold">
              Toko: {currentUser?.store_name || "Toko"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <p role="alert" className="text-xs font-bold text-rose-500">
              {submitError}
            </p>
          )}
          {/* UPLOAD FOTO (REQUIRED HANYA SAAT TAMBAH BARU) */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Foto Menu / Produk
            </label>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-14 h-14 object-cover rounded-xl border border-emerald-500 flex-shrink-0"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={`w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold ${
                  darkMode
                    ? "file:bg-slate-800 file:text-emerald-400 text-slate-400"
                    : "file:bg-emerald-50 file:text-emerald-600 text-slate-500"
                }`}
                required={!isEditMode && !imagePreview}
              />
            </div>
          </div>

          {/* NAMA MENU */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Nama Menu / Produk
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Nasi Sayur + Tahu Tempe"
              className={`w-full px-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-slate-100"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
              required
            />
          </div>

          {/* KATEGORI */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-slate-100"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="makan">Makan</option>
              <option value="perlengkapan">Perlengkapan</option>
              <option value="main">Main</option>
              <option value="transport">Transport</option>
            </select>
          </div>

          {/* HARGA PRODUK */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Harga (Rp)
            </label>
            <div className="relative flex items-center">
              <span
                className={`absolute left-3 text-xs font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(formatRupiah(e.target.value))}
                placeholder="15.000"
                className={`w-full pl-9 pr-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
                required
              />
            </div>
          </div>

          {/* TOGGLE PROMO */}
          <div
            className={`p-3.5 rounded-2xl border border-dashed transition-all space-y-3 ${
              hasPromo
                ? "border-emerald-500/50 bg-emerald-500/5"
                : darkMode
                  ? "border-slate-800 bg-slate-900/40"
                  : "border-slate-200 bg-slate-50/50"
            }`}
          >
            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold block">
                  Aktifkan Harga Promo / Diskon?
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Tandai produk ini sebagai promo khusus mahasiswa
                </span>
              </div>
              <input
                type="checkbox"
                checked={hasPromo}
                onChange={(e) => {
                  setHasPromo(e.target.checked);
                  if (!e.target.checked) {
                    setPromoTag("");
                  } else if (!promoTag) {
                    setPromoTag("PROMO MAHASISWA");
                  }
                }}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
            </label>

            {hasPromo && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Nama / Badge Promo (Opsional)
                  </label>
                  <input
                    type="text"
                    value={promoTag}
                    onChange={(e) => setPromoTag(e.target.value)}
                    placeholder="Contoh: PROMO MAHASISWA, FLASH SALE"
                    className={`w-full px-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CHECKBOX DISKON MALAM */}
          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-rose-500">
              <input
                type="checkbox"
                checked={isLateNight}
                onChange={(e) => setIsLateNight(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span>Sertakan ke Program Diskon Malam (Night Deals)</span>
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60 text-white font-extrabold py-3 rounded-xl transition-all text-xs tracking-wide uppercase mt-2 shadow-md shadow-emerald-600/20"
          >
            {isSaving
              ? "Menyimpan..."
              : isEditMode
                ? "Simpan Perubahan"
                : "Terbitkan ke Katalog"}
          </button>
        </form>
      </div>
    </div>
  );
}
