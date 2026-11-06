import React, { useState } from 'react';

export default function LoginForm({ onLogin, onRegister, merchants = [], darkMode }) {
  const [isRegister, setIsRegister] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gmapsUrl, setGmapsUrl] = useState('');
  const [category, setCategory] = useState('makan');

  // State Alert Pesan Error di Dalam Modal
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Cek Kredensial Super Admin Platform
    if (!isRegister && (phone === '08000000' || phone === 'admin') && password === 'admin123') {
      onLogin({
        id: 'admin-super',
        name: 'Super Admin',
        owner: 'System Administrator',
        phone: '080000000000',
        role: 'admin'
      });
      return;
    }

    if (isRegister) {
      if (!storeName || !ownerName || !phone || !password || !gmapsUrl) {
        setErrorMessage("Mohon lengkapi seluruh data pendaftaran toko.");
        return;
      }

      const existingMerchant = merchants.find((merchant) => merchant.phone === phone);
      if (existingMerchant) {
        setErrorMessage("Nomor WhatsApp ini sudah terdaftar! Silakan pindah ke menu Masuk.");
        return;
      }

      setIsSubmitting(true);
      try {
        const savedMerchant = await onRegister({
          storeName,
          ownerName,
          phone,
          gmapsUrl,
          category,
        });
        const credentials = JSON.parse(localStorage.getItem('app_merchant_credentials') || '{}');
        localStorage.setItem(
          'app_merchant_credentials',
          JSON.stringify({ ...credentials, [phone]: password }),
        );
        onLogin({ ...savedMerchant, role: 'umkm' });
      } catch (error) {
        console.error('Gagal mendaftarkan mitra:', error);
        setErrorMessage(error.message || 'Pendaftaran gagal. Silakan coba lagi.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!phone || !password) {
        setErrorMessage("Masukkan Nomor WhatsApp dan Password toko kamu.");
        return;
      }

      const merchant = merchants.find((item) => item.phone === phone);
      let credentials = {};
      try {
        credentials = JSON.parse(
          localStorage.getItem('app_merchant_credentials') || '{}',
        );
      } catch (error) {
        console.error('Gagal membaca kredensial lokal:', error);
        setErrorMessage('Data login lokal rusak. Silakan daftar kembali.');
        return;
      }
      const storedPassword = credentials[phone];

      if (merchant && storedPassword === password) {
        onLogin({ ...merchant, role: 'umkm' });
      } else {
        setErrorMessage(
          "Nomor WhatsApp atau Password salah, atau toko belum tersedia di database. Klik 'Daftar Toko Baru' untuk mendaftar.",
        );
      }
    }
  };

  return (
    <div className={`w-full max-h-[85vh] overflow-y-auto p-5 md:p-6 rounded-3xl border shadow-2xl transition-all scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header Modal */}
      <div className="text-center mb-4 space-y-1">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
          <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <h2 className="text-base md:text-lg font-black tracking-tight">
          {isRegister ? 'Daftar Mitra UMKM Baru' : 'Masuk Dashboard UMKM'}
        </h2>
        <p className="text-[11px] text-slate-400 font-medium">
          {isRegister 
            ? 'Daftarkan usahamu untuk menjangkau mahasiswa sesuai budget.' 
            : 'Masuk untuk mengelola katalog menu & promo tokomu.'}
        </p>
      </div>

      {/* ALERT ERROR MERAH DI DALAM MODAL */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-start gap-2.5">
          <svg className="w-4 h-4 stroke-current flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div className="flex-1 leading-snug">
            {errorMessage}
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage('')}
            className="text-rose-400 hover:text-rose-600 font-black text-sm leading-none"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Field Khusus Registrasi */}
        {isRegister && (
          <>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Nama Usaha / Toko
              </label>
              <input 
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Contoh: Warung Makan Berkah"
                className={`w-full px-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Nama Pemilik 
              </label>
              <input 
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Contoh: Pak Budi"
                className={`w-full px-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
                required
              />
            </div>
          </>
        )}

        {/* Input No. WhatsApp */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            Nomor WhatsApp Toko
          </label>
          <input 
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 081234567890"
            className={`w-full px-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
            required
          />
        </div>

        {/* Input Password dengan Toggle Mata */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            Password Akun Toko
          </label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full pl-3.5 pr-9 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
            >
              {showPassword ? (
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Field Tambahan Registrasi Baru */}
        {isRegister && (
          <>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Link Google Maps Lokasi Toko
              </label>
              <input 
                type="url"
                value={gmapsUrl}
                onChange={(e) => setGmapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className={`w-full px-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Kategori Utama Usaha
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="makan">Makan & Minum</option>
                <option value="perlengkapan">Perlengkapan</option>
                <option value="main">Hangout & Main</option>
                <option value="jasa">Jasa</option>
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60 active:scale-98 text-white font-extrabold py-3 rounded-xl transition-all text-xs tracking-wide uppercase mt-1 shadow-md shadow-emerald-600/20"
        >
          {isSubmitting
            ? 'Mendaftarkan...'
            : isRegister
              ? 'Selesaikan Pendaftaran'
              : 'Masuk Dashboard UMKM'}
        </button>
      </form>

      <div className=" pt-3 text-center">
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setErrorMessage('');
            setPhone('');
            setPassword('');
          }}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum jadi mitra? Daftar Toko Baru'}
        </button>
      </div>
    </div>
  );
}