import React, { useState, useEffect } from "react";
import { UNS_COORDINATES } from "../../utils/location";

export default function VendorForm({
  onAddProduct,
  onUpdateProduct,
  onClose,
  darkMode,
  currentUser,
  userLocation,
  initialData,
}) {
  const isEditMode = Boolean(initialData);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [hasPromo, setHasPromo] = useState(false);
  const [discountPrice, setDiscountPrice] = useState("");
  const [promoTag, setPromoTag] = useState("PROMO MAHASISWA");
  const [category, setCategory] = useState("makan");
  const [isLateNight, setIsLateNight] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [priceError, setPriceError] = useState("");

  const formatRupiah = (value) => {
    const rawNumber = String(value).replace(/[^0-9]/g, "");
    if (!rawNumber) return "";
    return new Intl.NumberFormat("id-ID").format(rawNumber);
  };

  const parseRawNumber = (formattedValue) => {
    return parseInt(String(formattedValue).replace(/[^0-9]/g, ""), 10) || 0;
  };

  const parseNumber = (val) => Number(String(val || 0).replace(/\D/g, ""));

  const handlePriceChange = (val, isDiscount = false) => {
    const formatted = formatRupiah(val);

    let normalVal = parseNumber(price);
    let promoVal = parseNumber(discountPrice);

    if (isDiscount) {
      promoVal = parseNumber(formatted);
      setDiscountPrice(formatted);
    } else {
      normalVal = parseNumber(formatted);
      setPrice(formatted);
    }

    if (hasPromo && promoVal > 0 && normalVal > 0) {
      if (promoVal >= normalVal) {
        setPriceError("Harga promo harus lebih murah daripada harga normal!");
      } else {
        setPriceError("");
      }
    } else {
      setPriceError("");
    }
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPrice(
        initialData.originalPrice
          ? formatRupiah(String(initialData.originalPrice))
          : "",
      );

      const hasDiscount = Boolean(
        initialData.discountPrice &&
        initialData.discountPrice < initialData.originalPrice,
      );
      setHasPromo(hasDiscount);
      setDiscountPrice(
        hasDiscount ? formatRupiah(String(initialData.discountPrice)) : "",
      );

      setPromoTag(initialData.promoTag || "PROMO MAHASISWA");
      setCategory(initialData.category || "makan");
      setIsLateNight(Boolean(initialData.isLateNight));
      setImagePreview(initialData.image || "");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalNumber = parseNumber(price);
    const promoNumber = parseNumber(discountPrice);

    if (hasPromo && promoNumber >= normalNumber) {
      setPriceError("Harga promo harus lebih murah daripada harga normal!");
      return;
    }

    const originalVal = parseRawNumber(price);
    const discountVal =
      hasPromo && discountPrice ? parseRawNumber(discountPrice) : originalVal;

    const productPayload = {
      id:
        initialData?.id ||
        `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      storeName:
        currentUser?.storeName || currentUser?.name || "Wedangan Bu Amel",
      ownerName:
        currentUser?.ownerName || currentUser?.owner || "Amelia Salsabila",
      whatsapp: currentUser?.phone || currentUser?.whatsapp || "081234567890",
      gmapsUrl: currentUser?.gmapsUrl || "https://maps.google.com",
      lat: userLocation?.lat || UNS_COORDINATES.lat,
      lng: userLocation?.lng || UNS_COORDINATES.lng,
      category,
      originalPrice: originalVal,
      discountPrice: discountVal,
      isLateNight,
      promoTag: hasPromo ? promoTag || "PROMO SPECIAL" : null,
      image:
        imagePreview ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
      isActive:
        initialData?.isActive !== undefined ? initialData.isActive : true,
    };

    if (isEditMode) {
      onUpdateProduct(productPayload);
    } else {
      onAddProduct(productPayload);
    }
    onClose();
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
              Toko:{" "}
              {currentUser?.storeName ||
                currentUser?.name ||
                "Wedangan Bu Amel"}
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

          {/* HARGA NORMAL */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Harga Normal (Rp)
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
                onChange={(e) => handlePriceChange(e.target.value, false)}
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

          {/* TOGGLE & INPUT HARGA PROMO */}
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
                  Berikan potongan harga khusus mahasiswa
                </span>
              </div>
              <input
                type="checkbox"
                checked={hasPromo}
                onChange={(e) => {
                  setHasPromo(e.target.checked);
                  if (!e.target.checked) {
                    setDiscountPrice("");
                    setPromoTag("");
                    setPriceError("");
                  }
                }}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
            </label>

            {hasPromo && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                    Harga Promo (Rp)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={discountPrice}
                      onChange={(e) => handlePriceChange(e.target.value, true)}
                      placeholder="10.000"
                      className={`w-full pl-9 pr-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        priceError
                          ? "border-rose-500 bg-rose-500/5"
                          : darkMode
                            ? "bg-slate-800 border-slate-700 text-slate-100"
                            : "bg-white border-slate-200 text-slate-800"
                      }`}
                      required={hasPromo}
                    />
                  </div>

                  {/* PESAN PERINGATAN HARGA ERROR */}
                  {priceError && (
                    <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                      <span>⚠️</span> {priceError}
                    </p>
                  )}
                </div>

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
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl transition-all text-xs tracking-wide uppercase mt-2 shadow-md shadow-emerald-600/20"
          >
            {isEditMode ? "Simpan Perubahan" : "Terbitkan ke Katalog"}
          </button>
        </form>
      </div>
    </div>
  );
}
