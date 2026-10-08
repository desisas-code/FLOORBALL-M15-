// ========================================
// LOCAL STORAGE
// ========================================

function loadStorage(key, fallback) {
    try {
        const data = localStorage.getItem('cf_' + key);
        return data ? JSON.parse(data) : fallback;
    } catch(e) {
        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem('cf_' + key, JSON.stringify(value));
    } catch (err) {
        console.warn("Kapasitas LocalStorage penuh! Memangkas otomatis gambar Base64...");
        if (key === 'laporanValidasi' && Array.isArray(value)) {
            // Hanya pertahankan 3 gambar terakhir, sisanya diganti teks agar memori tidak jebol
            const stripped = value.map((item, idx) => ({
                ...item,
                imgSelfieUrl: idx > 2 ? '[Gambar Tersimpan di Cloud]' : item.imgSelfieUrl,
                imgStravaUrl: idx > 2 ? '[Gambar Tersimpan di Cloud]' : item.imgStravaUrl
            }));
            try {
                localStorage.setItem('cf_' + key, JSON.stringify(stripped));
            } catch (e) {
                console.error("Gagal menyimpan data lokal setelah pemangkasan:", e);
            }
        }
    }
}