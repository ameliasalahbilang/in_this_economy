import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import BudgetForm from "./components/budget/BudgetForm";
import FoodCard from "./components/food/FoodCard";
import SavedDeals from "./components/food/SavedDeals";
import VendorDashboard from "./components/vendor/VendorDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import VendorForm from "./components/vendor/VendorForm";
import LoginForm from "./components/auth/LoginForm";
import { mockFoods as initialFoods } from "./data/mockData";
import { isSupabaseConfigured, supabase } from "./supabase";
import {
  calculateDistanceInKm,
  getUserCoordinates,
  UNS_COORDINATES,
} from "./utils/location";

const mapSupabaseMerchant = (row) => ({
  id: row.id,
  name: row.store_name,
  storeName: row.store_name,
  owner: row.owner_name || "",
  ownerName: row.owner_name || "",
  phone: row.phone || "",
  gmapsUrl: row.gmaps_url || "",
  category: row.category || "makan",
  isActive: row.is_active !== false,
  lat: row.lat == null ? undefined : Number(row.lat),
  lng: row.lng == null ? undefined : Number(row.lng),
  role: "umkm",
});

const mapSupabaseProduct = (row) => ({
  id: row.id,
  name: row.name,
  merchantId: row.merchant_id,
  storeName: row.store_name || "",
  category: row.category || "makan",
  originalPrice: Number(row.original_price),
  discountPrice: Number(row.discount_price ?? row.original_price),
  isLateNight: Boolean(row.is_late_night),
  promoTag: row.promo_tag || null,
  image: row.image || "",
  isActive: row.is_active !== false,
});

const getCoordinatesFromMapUrl = (mapUrl) => {
  const match = mapUrl.match(/(-?\d+(?:\.\d+)?)[,/]\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return {};
  return { lat: Number(match[1]), lng: Number(match[2]) };
};

const toSupabaseProduct = (product) => ({
  merchant_id: product.merchantId,
  store_name: product.storeName,
  name: product.name,
  category: product.category || null,
  original_price: product.originalPrice,
  discount_price: product.discountPrice,
  is_late_night: Boolean(product.isLateNight),
  promo_tag: product.promoTag || null,
  image: product.image || null,
  is_active: product.isActive !== false,
});

export default function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [products, setProducts] = useState([]);
  const [productError, setProductError] = useState("");
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setProductError(
        "Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk memuat data.",
      );
      return undefined;
    }

    let isMounted = true;
    const channel = supabase
      .channel("catalog-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === "DELETE") {
            setProducts((current) =>
              current.filter((product) => product.id !== payload.old.id),
            );
            return;
          }

          const product = mapSupabaseProduct(payload.new);
          setProducts((current) => {
            const existingIndex = current.findIndex(
              (item) => item.id === product.id,
            );
            if (existingIndex === -1) return [product, ...current];
            return current.map((item) =>
              item.id === product.id ? product : item,
            );
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "merchants" },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === "DELETE") {
            setMerchants((current) =>
              current.filter((merchant) => merchant.id !== payload.old.id),
            );
            return;
          }

          const merchant = mapSupabaseMerchant(payload.new);
          setMerchants((current) => {
            const existingIndex = current.findIndex(
              (item) => item.id === merchant.id,
            );
            if (existingIndex === -1) return [merchant, ...current];
            return current.map((item) =>
              item.id === merchant.id ? merchant : item,
            );
          });
        },
      )
      .subscribe();

    const loadCatalog = async () => {
      const [merchantsResult, productsResult] = await Promise.all([
        supabase.from("merchants").select("*"),
        supabase.from("products").select("*"),
      ]);

      if (!isMounted) return;
      if (merchantsResult.error) {
        console.error(
          "Gagal memuat merchant dari Supabase:",
          merchantsResult.error,
        );
        setProductError(
          `Gagal memuat data merchant: ${merchantsResult.error.message}`,
        );
      } else {
        setMerchants(merchantsResult.data.map(mapSupabaseMerchant));
      }

      if (productsResult.error) {
        console.error(
          "Gagal memuat produk dari Supabase:",
          productsResult.error,
        );
        setProductError(
          `Gagal memuat katalog: ${productsResult.error.message}`,
        );
      } else {
        setProducts(productsResult.data.map(mapSupabaseProduct));
        if (!merchantsResult.error) setProductError("");
      }
    };

    loadCatalog().catch((error) => {
      console.error("Gagal memuat katalog Supabase:", error);
      if (isMounted)
        setProductError("Terjadi kesalahan saat memuat data Supabase.");
    });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRegisterMerchant = async (merchant) => {
    if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
    const coordinates = getCoordinatesFromMapUrl(merchant.gmapsUrl);
    const { data, error } = await supabase
      .from("merchants")
      .insert({
        store_name: merchant.storeName,
        owner_name: merchant.ownerName,
        phone: merchant.phone,
        gmaps_url: merchant.gmapsUrl,
        category: merchant.category,
        is_active: true,
        lat: merchant.lat ?? coordinates.lat ?? null,
        lng: merchant.lng ?? coordinates.lng ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Gagal mendaftarkan merchant:", error);
      throw error;
    }

    const savedMerchant = mapSupabaseMerchant(data);
    setMerchants((current) => [
      savedMerchant,
      ...current.filter((item) => item.id !== savedMerchant.id),
    ]);
    return savedMerchant;
  };

  const handleToggleMerchantStatus = async (merchantId) => {
    if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
    const merchant = merchants.find((item) => item.id === merchantId);
    if (!merchant) throw new Error("Merchant tidak ditemukan.");
    const { data, error } = await supabase
      .from("merchants")
      .update({ is_active: merchant.isActive === false })
      .eq("id", merchantId)
      .select()
      .single();

    if (error) {
      console.error("Gagal mengubah status merchant:", error);
      throw error;
    }
    const savedMerchant = mapSupabaseMerchant(data);
    setMerchants((current) =>
      current.map((item) => (item.id === merchantId ? savedMerchant : item)),
    );
  };
  const handleToggleProductStatus = async (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) throw new Error("Produk tidak ditemukan.");
    await updateProduct({
      ...product,
      isActive: product.isActive === false,
    });
  };

  const getFoodCoordinates = (food) => {
    if (Number.isFinite(food.lat) && Number.isFinite(food.lng)) {
      return { lat: food.lat, lng: food.lng };
    }

    const merchant = merchants.find((item) => item.id === food.merchantId);
    const mapUrl = food.gmapsUrl || merchant?.gmapsUrl || "";
    const match = mapUrl.match(/(-?\d+(?:\.\d+)?)[,/]\s*(-?\d+(?:\.\d+)?)/);
    if (!match) return null;

    const lat = Number(match[1]);
    const lng = Number(match[2]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  };

  const enrichedProducts = products.map((product) => {
    const merchant =
      merchants.find((item) => item.id === product.merchantId) ||
      merchants.find((item) => item.storeName === product.storeName);
    return {
      ...product,
      merchantId: product.merchantId || merchant?.id,
      storeName: product.storeName || merchant?.storeName || "",
      ownerName: merchant?.ownerName || "",
      whatsapp: merchant?.phone || "",
      gmapsUrl: merchant?.gmapsUrl || "",
      lat: merchant?.lat,
      lng: merchant?.lng,
    };
  });

  const visibleProductsForUser = enrichedProducts.filter((product) => {
    const isProductActive = product.isActive !== false;
    const storeMerchant = merchants.find((m) => m.id === product.merchantId);
    const isStoreActive = storeMerchant
      ? storeMerchant.isActive !== false
      : true;

    return isProductActive && isStoreActive;
  });
  const handleAddProduct = async (newProduct) => {
    if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
    if (!newProduct.merchantId) throw new Error("Merchant produk tidak valid.");
    const { data, error } = await supabase
      .from("products")
      .insert(toSupabaseProduct(newProduct))
      .select()
      .single();
    if (error) {
      setProductError(`Gagal menerbitkan produk: ${error.message}`);
      throw error;
    }
    setProductError("");
    const savedProduct = mapSupabaseProduct(data);
    setProducts((current) => [
      savedProduct,
      ...current.filter((item) => item.id !== savedProduct.id),
    ]);
    return savedProduct;
  };

  const updateProduct = async (product) => {
    if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
    if (!product.merchantId) throw new Error("Merchant produk tidak valid.");
    const { data, error } = await supabase
      .from("products")
      .update(toSupabaseProduct(product))
      .eq("id", product.id)
      .select()
      .single();
    if (error) {
      setProductError(`Gagal memperbarui produk: ${error.message}`);
      throw error;
    }
    setProductError("");
    const savedProduct = mapSupabaseProduct(data);
    setProducts((current) =>
      current.map((item) =>
        item.id === savedProduct.id ? savedProduct : item,
      ),
    );
    return savedProduct;
  };

  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userLocation, setUserLocation] = useState(UNS_COORDINATES);
  const [isLiveGPS, setIsLiveGPS] = useState(false);
  const [foods, setFoods] = useState(initialFoods);

  const [calculation, setCalculation] = useState(() => {
    const savedCalc = localStorage.getItem("active_budget_session");
    return savedCalc ? JSON.parse(savedCalc) : null;
  });

  const [showLateNightOnly, setShowLateNightOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");

  const [savedDeals, setSavedDeals] = useState(() => {
    const saved = localStorage.getItem("user_saved_deals");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState("makan");

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const handleAppInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      window.alert(
        "Simulasi Install: Fitur install PWA aktif penuh setelah web di-deploy ke domain HTTPS!",
      );
      return;
    }

    const installPrompt = deferredPrompt;
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch (error) {
      console.error("Gagal memulai instalasi PWA:", error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (calculation?.allocations && calculation.allocations.length > 0) {
      if (!calculation.allocations.includes(activeCategoryTab)) {
        setActiveCategoryTab(calculation.allocations[0]);
      }
    }
  }, [calculation]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("user_saved_deals", JSON.stringify(savedDeals));
  }, [savedDeals]);

  useEffect(() => {
    getUserCoordinates(
      (coords) => {
        setUserLocation(coords);
        setIsLiveGPS(true);
      },
      (err) => {
        setUserLocation(UNS_COORDINATES);
        setIsLiveGPS(false);
        console.log("Akses GPS ditolak/gagal:", err.message);
      },
    );
  }, []);

  const handleDeleteProduct = async (id) => {
    if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      setProductError(`Gagal menghapus produk: ${error.message}`);
      throw error;
    }
    setProducts((current) => current.filter((item) => item.id !== id));
  };

  const handleToggleLateNight = async (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) throw new Error("Produk tidak ditemukan.");
    await updateProduct({ ...product, isLateNight: !product.isLateNight });
  };

  const handleBudgetCalculated = (newCalc) => {
    setCalculation(newCalc);
    localStorage.setItem("active_budget_session", JSON.stringify(newCalc));
  };

  const handleResetBudget = () => {
    setCalculation(null);
    localStorage.removeItem("active_budget_session");
  };

  const handleClaimPromo = (item) => {
    setSelectedDeal(item);
  };

  const handleToggleSave = (item) => {
    const exists = savedDeals.find((d) => d.id === item.id);
    if (exists) {
      setSavedDeals(savedDeals.filter((d) => d.id !== item.id));
    } else {
      setSavedDeals([...savedDeals, item]);
    }
  };

  const handleConfirmLogout = () => {
    setCurrentUser(null);
    setActiveTab("feed");
    setShowLogoutConfirm(false);
  };

  const confirmClaim = (type) => {
    if (!selectedDeal) return;

    if (type === "wa") {
      const targetWa = selectedDeal.whatsapp || "6281234567890";
      const text = encodeURIComponent(
        `Halo ${selectedDeal.storeName}, saya lihat promo "${selectedDeal.name}" di In This Economy. Apakah stoknya ready?`,
      );
      window.open(`https://wa.me/${targetWa}?text=${text}`, "_blank");
    } else if (type === "gmaps") {
      if (selectedDeal.gmapsUrl) {
        window.open(selectedDeal.gmapsUrl, "_blank");
      } else {
        const query = encodeURIComponent(
          `${selectedDeal.storeName} ${selectedDeal.name}`,
        );
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${query}`,
          "_blank",
        );
      }
    }

    setSelectedDeal(null);
  };

  const filteredFoods = visibleProductsForUser.filter((food) => {
    const coordinates = getFoodCoordinates(food);
    if (!coordinates) return false;

    const distance = calculateDistanceInKm(
      userLocation.lat,
      userLocation.lng,
      coordinates.lat,
      coordinates.lng,
    );
    if (distance === null || distance > 10) return false;

    if (showLateNightOnly && !food.isLateNight) return false;

    if (calculation) {
      const { dailyBudget, allocations } = calculation;
      const activeAllocations =
        allocations && allocations.length > 0 ? allocations : ["makan"];
      if (!activeAllocations.includes(food.category)) return false;
      if (food.category !== activeCategoryTab) return false;
      const budgetPerCategory = dailyBudget / activeAllocations.length;
      return food.discountPrice <= budgetPerCategory;
    }

    return true;
  });

  return (
    <div
      className={`transition-colors duration-300 ${
        currentUser?.role === "admin"
          ? "min-h-screen md:h-screen md:overflow-hidden flex flex-col"
          : "min-h-screen pb-12"
      } ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}
    >
      <header
        className={`sticky top-0 z-30 py-3 px-4 md:px-6 border-b backdrop-blur-md transition-colors ${
          darkMode
            ? "bg-slate-950/80 border-slate-800 text-slate-100"
            : "bg-white/80 border-slate-200 text-slate-800"
        }`}
      >
        <div
          className={`${
            currentUser?.role === "admin"
              ? "w-full"
              : currentUser
                ? "max-w-6xl"
                : "max-w-7xl"
          } mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
        >
          {/* BAGIAN ATAS (HP): Judul & Badges */}
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg sm:text-xl md:text-2xl text-emerald-500 tracking-tight leading-tight">
                In This Economy
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 whitespace-nowrap">
                STUDENT DEALS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {currentUser
                ? `Mode Dashboard ${currentUser.role === "admin" ? "Super Admin" : "Mitra"} (${currentUser.name})`
                : "Alokasi Budget & Smart Partner Platform"}
            </p>
          </div>

          {/* BAGIAN BAWAH (HP): Tombol Action */}
          <div className="flex items-center justify-start sm:justify-end gap-2 flex-wrap w-full sm:w-auto pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleInstallClick}
              aria-label="Install App"
              className={`inline-flex items-center gap-1.5 rounded-xl border bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-600 transition-all hover:bg-emerald-500/20 active:scale-95 dark:text-emerald-400 ${
                darkMode ? "border-emerald-500/20" : "border-emerald-200"
              }`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Install App</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
              }`}
              title="Ubah Tema"
            >
              {darkMode ? (
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              )}
            </button>

            {!currentUser ? (
              <>
                <button
                  onClick={() =>
                    setActiveTab(activeTab === "saved" ? "feed" : "saved")
                  }
                  className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                    activeTab === "saved"
                      ? "bg-amber-500 border-amber-400 text-white shadow-md"
                      : darkMode
                        ? "border-slate-800 bg-slate-900 text-slate-200"
                        : "border-slate-200 bg-slate-100 text-slate-700"
                  }`}
                >
                  <span>{activeTab === "saved" ? "← Feed" : "★ Favorit"}</span>
                  {savedDeals.length > 0 && activeTab !== "saved" && (
                    <span className="bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {savedDeals.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-xs font-extrabold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition-all shadow-md shadow-emerald-600/20"
                >
                  Daftar UMKM
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-md"
              >
                Keluar / Mode Konsumen
              </button>
            )}
          </div>
        </div>
      </header>

      <main
        className={`mt-0 ${currentUser ? "w-full px-0" : "max-w-7xl mx-auto px-3 md:px-6"}`}
      >
        {productError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-700 dark:text-amber-300"
          >
            {productError}
          </div>
        )}
        {currentUser?.role === "admin" ? (
          <AdminDashboard
            foods={products}
            merchants={merchants}
            onToggleMerchantStatus={handleToggleMerchantStatus}
            onToggleProductStatus={handleToggleProductStatus}
            onDeleteProduct={handleDeleteProduct}
            onToggleLateNight={handleToggleLateNight}
            darkMode={darkMode}
            onLogout={() => setCurrentUser(null)}
          />
        ) : currentUser?.role === "umkm" ? (
          <VendorDashboard
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={updateProduct}
            onToggleProductStatus={handleToggleProductStatus}
            currentUser={currentUser}
            userLocation={userLocation}
            foods={foods}
            onDeleteProduct={handleDeleteProduct}
            onOpenAddModal={() => setShowVendorModal(true)}
            onToggleLateNight={handleToggleLateNight}
            darkMode={darkMode}
          />
        ) : activeTab === "saved" ? (
          <SavedDeals
            savedDeals={savedDeals}
            onClaim={handleClaimPromo}
            onBookmark={handleToggleSave}
            darkMode={darkMode}
            onBackToFeed={() => setActiveTab("feed")}
            currentUser={currentUser}
            onOpenLogin={() => setShowLoginModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
            <section className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <BudgetForm
                onBudgetCalculated={handleBudgetCalculated}
                darkMode={darkMode}
                calculation={calculation}
                onResetBudget={handleResetBudget}
              />
            </section>

            <section className="lg:col-span-8 space-y-4">
              {!calculation ? (
                <div
                  className={`p-8 rounded-3xl border text-center space-y-3 shadow-sm transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-900 border-slate-800 text-slate-100"
                      : "bg-white border-slate-200/90 text-slate-900"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="w-6 h-6 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                      <path d="M9 18h6"></path>
                      <path d="M10 22h4"></path>
                    </svg>
                  </div>
                  <h3
                    className={`font-black text-base tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}
                  >
                    Mulai Atur Budget Pengeluaranmu
                  </h3>
                  <p
                    className={`text-xs max-w-md mx-auto leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600 font-medium"}`}
                  >
                    Masukkan nominal budget pada panel di sebelah kiri, tentukan
                    rentang hari, lalu klik{" "}
                    <b className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                      Hitung & Cari Mitra
                    </b>{" "}
                    untuk melihat simulasi alokasi dan rekomendasi UMKM
                    terdekat.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3 px-1 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mr-1">
                        Filter Kategori:
                      </span>
                      {[
                        {
                          id: "makan",
                          label: "Makan",
                          icon: (
                            <svg
                              className="w-3.5 h-3.5 stroke-current"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                            >
                              <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z"></path>
                              <path d="M7 8V4M12 8V4M17 8V4"></path>
                            </svg>
                          ),
                        },
                        {
                          id: "perlengkapan",
                          label: "Perlengkapan",
                          icon: (
                            <svg
                              className="w-3.5 h-3.5 stroke-current"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                            >
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                              <line x1="3" y1="6" x2="21" y2="6"></line>
                              <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                          ),
                        },
                        {
                          id: "main",
                          label: "Main",
                          icon: (
                            <svg
                              className="w-3.5 h-3.5 stroke-current"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                            >
                              <line x1="6" y1="12" x2="10" y2="12"></line>
                              <line x1="8" y1="10" x2="8" y2="14"></line>
                              <circle cx="15" cy="13" r="1"></circle>
                              <circle cx="18" cy="11" r="1"></circle>
                              <rect
                                x="2"
                                y="6"
                                width="20"
                                height="12"
                                rx="4"
                              ></rect>
                            </svg>
                          ),
                        },
                        {
                          id: "jasa",
                          label: "Jasa",
                          icon: (
                            <svg
                              className="w-3.5 h-3.5 stroke-current"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                            >
                              <rect
                                x="1"
                                y="3"
                                width="15"
                                height="13"
                                rx="2"
                              ></rect>
                              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                              <circle cx="5.5" cy="18.5" r="2.5"></circle>
                              <circle cx="18.5" cy="18.5" r="2.5"></circle>
                            </svg>
                          ),
                        },
                      ].map((cat) => {
                        const isAllocatedInCalc =
                          calculation?.allocations?.includes(cat.id);
                        const isSelected = activeCategoryTab === cat.id;

                        return (
                          <button
                            key={cat.id}
                            disabled={!isAllocatedInCalc}
                            onClick={() =>
                              isAllocatedInCalc && setActiveCategoryTab(cat.id)
                            }
                            className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 active:scale-95 select-none ${
                              !isAllocatedInCalc
                                ? "opacity-35 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                                : isSelected
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                                  : darkMode
                                    ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {cat.icon}
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowLateNightOnly(!showLateNightOnly)}
                      className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 active:scale-95 ${
                        showLateNightOnly
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25"
                          : darkMode
                            ? "bg-slate-900 border-indigo-500/30 text-indigo-400 hover:bg-indigo-950/40"
                            : "bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5 stroke-current fill-none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>

                      <span>Midnight Deals</span>
                    </button>
                  </div>

                  <div
                    className={`p-5 md:p-6 rounded-3xl border shadow-sm transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-900 border-slate-800 text-slate-100"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  >
                    <div
                      className={`flex justify-between items-center mb-5 pb-3 border-b ${
                        darkMode ? "border-slate-800" : "border-slate-100"
                      }`}
                    >
                      <h2
                        className={`font-black text-sm md:text-base tracking-tight ${
                          darkMode ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        Rekomendasi Sesuai Budget
                      </h2>
                      <span
                        className={`text-[11px] font-black px-3 py-1 rounded-full border ${
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-slate-200"
                            : "bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        {filteredFoods.length} Mitra
                      </span>
                    </div>

                    <div
                      className={`mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-4 py-3 ${
                        darkMode
                          ? "border-slate-700 bg-slate-800/70"
                          : "border-emerald-100 bg-emerald-50/80"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold leading-relaxed ${
                          darkMode ? "text-slate-200" : "text-slate-700"
                        }`}
                      >
                        Menampilkan promo &amp; UMKM hemat terdekat dalam radius
                        10 km dari lokasi kamu
                        {!isLiveGPS && " (Pusat Kampus UNS)"}
                      </p>
                      <span
                        className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-black ${
                          isLiveGPS
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                        }`}
                      >
                        {isLiveGPS ? "GPS AKTIF" : "LOKASI KAMPUS"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {filteredFoods.length > 0 ? (
                        filteredFoods.map((food) => (
                          <FoodCard
                            key={food.id}
                            item={food}
                            onClaim={handleClaimPromo}
                            onBookmark={handleToggleSave}
                            isSaved={savedDeals.some((d) => d.id === food.id)}
                            darkMode={darkMode}
                            distance={calculateDistanceInKm(
                              userLocation.lat,
                              userLocation.lng,
                              getFoodCoordinates(food).lat,
                              getFoodCoordinates(food).lng,
                            )}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12">
                          <p className="font-extrabold text-sm text-slate-400">
                            Tidak ada mitra promo yang cocok dengan budget
                            alokasi ini.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </main>

      {selectedDeal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl space-y-4 ${
              darkMode
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div
              style={{ borderBottomColor: "#cbd5e1" }}
              className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3"
            >
              <h3 className="font-black text-base">Detail Mitra UMKM</h3>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-slate-400 font-bold hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-500 uppercase">
                {selectedDeal.storeName}
              </span>
              <h4 className="font-extrabold text-sm">{selectedDeal.name}</h4>
              <p className="text-lg font-black text-emerald-500 mt-1">
                Rp {selectedDeal.discountPrice.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => confirmClaim("wa")}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-2xl transition-all shadow-md text-xs flex items-center justify-center"
              >
                Lanjutkan via WhatsApp
              </button>

              <button
                onClick={() => confirmClaim("gmaps")}
                className={`w-full font-extrabold py-3 rounded-2xl transition-all border text-xs flex items-center justify-center ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Petunjuk Rute (Google Maps)
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold z-10"
            >
              ✕
            </button>
            <LoginForm
              darkMode={darkMode}
              merchants={merchants}
              onRegister={handleRegisterMerchant}
              onLogin={(user) => {
                setCurrentUser(user);
                setShowLoginModal(false);
              }}
            />
          </div>
        </div>
      )}

      {showVendorModal && (
        <VendorForm
          darkMode={darkMode}
          userLocation={userLocation}
          onAddProduct={handleAddProduct}
          onClose={() => setShowVendorModal(false)}
        />
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-xs rounded-3xl p-6 border shadow-2xl text-center space-y-4 ${
              darkMode
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-base tracking-tight">
                Konfirmasi Keluar
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Apakah kamu yakin ingin keluar dari sesi dashboard ini?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={`w-1/2 py-2.5 rounded-xl font-extrabold text-xs border transition-all ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-slate-300"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                Batal
              </button>

              <button
                onClick={handleConfirmLogout}
                className="w-1/2 py-2.5 rounded-xl font-extrabold text-xs bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/20"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
