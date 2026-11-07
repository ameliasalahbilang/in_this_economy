export const generateId = () => {
  return `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
};

// 1. umkm
export const mockMerchants = [
  {
    id: "m-1",
    store_name: "Wedangan Bu Amel",
    ownerName: "Amelia Salsabila",
    phone: "081234567890",
    gmapsUrl: "https://maps.google.com/?q=-7.558,110.856",
    category: "makan",
    isActive: true,
    lat: -7.558,
    lng: 110.856,
  },
  {
    id: "m-2",
    store_name: "Salsa Copy & Print",
    ownerName: "Salsabila",
    phone: "089876543210",
    gmapsUrl: "https://maps.google.com/?q=-7.559,110.857",
    category: "jasa",
    isActive: true,
    lat: -7.559,
    lng: 110.857,
  },
  {
    id: "m-3",
    store_name: "Soto Sapi Pak Min Boyolali",
    storeName: "Soto Sapi Pak Min Boyolali",
    ownerName: "Pak Min",
    phone: "085712345678",
    gmapsUrl: "https://maps.google.com/?q=-7.558,110.856",
    category: "makan",
    isActive: true,
    lat: -7.558,
    lng: 110.856,
  },
];

// 2. produk
export const mockFoods = [
  {
    id: "prod-101",
    name: "Nasi Sayur + Tahu Tempe",
    store_name: "Wedangan Bu Amel",
    storeName: "Wedangan Bu Amel",
    category: "makan",
    originalPrice: 12000,
    discountPrice: 8000,
    isLateNight: true,
    promoTag: "PROMO MAHASISWA",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "prod-102",
    name: "Es Teh Solo Jumbo",
    store_name: "Wedangan Bu Amel",
    category: "makan",
    originalPrice: 5000,
    discountPrice: 3000,
    isLateNight: false,
    promoTag: "PAKET HEMAT",
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "prod-103",
    name: "Paket Print Skripsi 50 Hlm",
    store_name: "Arkana Copy & Print",
    category: "jasa",
    originalPrice: 25000,
    discountPrice: 18000,
    isLateNight: true,
    promoTag: "DISKON TUGAS AKHIR",
    image:
      "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "prod-104",
    name: "Soto Sapi Boyolali Spesial",
    store_name: "Soto Sapi Pak Min Boyolali",
    category: "makan",
    originalPrice: 15000,
    discountPrice: 12000,
    isLateNight: false,
    promoTag: "PROMO BOYOLALI",
    image:
      "https://images.unsplash.com/photo-1547496592-1b9d4ee69254?w=500&auto=format&fit=crop&q=60",
  },
];
