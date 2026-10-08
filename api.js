// ========================================
// API / GOOGLE APPS SCRIPT
// ========================================

async function apiGet(url = GOOGLE_SHEET_WEB_APP_URL, options = {}) {
    return fetch(url, {
        method: 'GET',
        redirect: 'follow',
        ...options
    });
}

async function apiPost(payload, options = {}) {
    return fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload),
        ...options
    });
}

// AUTO SYNC & EXACT MIRRORING DARI GOOGLE SPREADSHEET KE WEB
async function autoFetchFromSpreadsheet() {
    if (isSavingData) return;
    
    try {
        const res = await apiGet(`${SCRIPT_URL}?_t=${new Date().getTime()}`);
        const data = await res.json();
        
        if (data && data.status === "success") {
            let hasChanges = false;

            // 1. Sinkron Data Atlet
            if (Array.isArray(data.atlet) && data.atlet.length > 0) {
                state.atlet = data.atlet;
                saveStorage("atlet", data.atlet);
                hasChanges = true;
            }

            // 2. SINKRON DATA TES FISIK (WAJIB DITAMBAHKAN)
            if (Array.isArray(data.tesFisik) && data.tesFisik.length > 0) {
                state.tesFisik = data.tesFisik;
                saveStorage("tesFisik", data.tesFisik);
                hasChanges = true;
            }

            // 3. Sinkron Data Presensi
            if (Array.isArray(data.absensi) && data.absensi.length > 0) {
                state.absensi = data.absensi;
                saveStorage("absensi", data.absensi);
                hasChanges = true;
            }

            if (Array.isArray(data.joggingLogs) && data.joggingLogs.length > 0) {
                state.joggingLogs = data.joggingLogs;
                saveStorage("joggingLogs", data.joggingLogs);
                hasChanges = true;
            }

            if (Array.isArray(data.rpeLogs) && data.rpeLogs.length > 0) {
                state.rpeLogs = data.rpeLogs;
                saveStorage("rpeLogs", data.rpeLogs);
                hasChanges = true;
            }

            if (Array.isArray(data.laporanValidasi) && data.laporanValidasi.length > 0) {
                state.laporanValidasi = data.laporanValidasi;
                saveStorage("laporanValidasi", data.laporanValidasi);
                hasChanges = true;
            }
                
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            const isTyping = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
            
            const isTrackingActive = (typeof liveTrackingWatchId !== 'undefined' && liveTrackingWatchId !== null);

            if (!isTyping && hasChanges && !isTrackingActive) {
                if (typeof renderSidebar === 'function') renderSidebar();
                if (typeof renderContent === 'function') renderContent();
            }
        }
    } catch (e) {
            console.log("Sinkronisasi otomatis menunggu koneksi aktif...");
    }
}

function queueFailedSync(payload) {
    let pendingQueue = loadStorage('pendingSyncQueue', []);
    pendingQueue.push({
        timestamp: new Date().toISOString(),
        payload: payload
    });
    saveStorage('pendingSyncQueue', pendingQueue);
}

async function processPendingSyncQueue() {
    const pendingQueue = loadStorage('pendingSyncQueue', []);
    if (pendingQueue.length === 0) return;

    const remainingQueue = [];

    for (const item of pendingQueue) {
        let timeoutId = null;

        try {
            const controller = new AbortController();
            
            timeoutId = setTimeout(() => {
                controller.abort();
            }, 8000);

            await apiPost(item.payload, {
                signal: controller.signal
            });

        } catch (err) {
            console.error("Gagal memproses pending sync:", err);
            remainingQueue.push(item);
        } finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    }

    saveStorage('pendingSyncQueue', remainingQueue);

    if (remainingQueue.length === 0) {
        showToast(
            "Data offline berhasil terintegrasi!", 
            "success"
        );
    }
}

async function loadAtletFromSheet() {

    // CEK URL GOOGLE APPS SCRIPT
    if (
        !GOOGLE_SHEET_WEB_APP_URL || 
        GOOGLE_SHEET_WEB_APP_URL.includes("PASTE_URL_HERE")
    ) {
        console.warn(
            "URL Google Apps Script belum dikonfigurasi."
        );
        return;
    }

     // LOADING
    const loadingToast = showToast(
    "Menarik data atlet dari Spreadsheet...", 
    "loading"
    );

    const controller = new AbortController();

    // Timeout 30 detik
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 120000);

    try {
    
    console.log("Memanggil Google Sheet...");
    let response = await fetch(
        `${GOOGLE_SHEET_WEB_APP_URL}?_t=${Date.now()}`,
        {
            method: 'GET',
            redirect: 'follow',
            cache: 'no-store',
            signal: controller.signal
        }
    );

    // Request berhasil, hentikan timer timeout
    clearTimeout(timeoutId);

    console.log(
        "Response:", 
        response.status, 
        response.url
    );

     // CEK HTTP RESPONSE
    if (!response.ok) {
        throw new Error(
            `HTTP Error ${response.status}`
        );
    }

    // BACA JSON
    const result = await response.json();

    console.log(
        "Data Google Sheet:", 
        result
    );
    
    if (loadingToast) {
        loadingToast.remove();
    }

    // FIX: Ambil array dari result.atlet jika result berbentuk objek
    const atletData = Array.isArray(result) 
        ? result 
        : (
            result && 
            Array.isArray(result.atlet)
                ? result.atlet
                : []
        );

     // JIKA DATA ATLET ADA    

    if (atletData.length > 0) {
        state.atlet = atletData; 
        saveStorage(
            'atlet', 
            state.atlet
        );
        initMatchPlayerStats();

        showToast(
            `Data ${state.atlet.length} atlet berhasil disinkronkan!`, 
            "success"
        );

        // Render ulang dropdown login
        selectLoginRole(
            state.loginRole
        ); 
        renderContent();
    } else {
         // SERVER BERHASIL DIAKSES TAPI DATA KOSONG
        const localData = loadStorage(
            'atlet', 
            []
        );
        state.atlet = localData; 

        saveStorage(
            'atlet', 
            state.atlet
        );

        selectLoginRole(
            state.loginRole
        );

        showToast(
            `Data server kosong. Memuat ${state.atlet.length} atlet dari data lokal.`, 
            "error"
        );
    }
} catch (err) {
     // PASTIKAN TIMEOUT DIBERSIHKAN
    clearTimeout(timeoutId);

    if (loadingToast) {
        loadingToast.remove();
    }
    
     // FALLBACK KE DATA LOKAL
    const localData = loadStorage(
        'atlet', 
        []
    );

    state.atlet = localData; 

    saveStorage(
        'atlet', 
        state.atlet
    );

    selectLoginRole(
        state.loginRole
    );

    // ERROR TIMEOUT
    if (err.name === "AbortError") {
        console.error(
            "Request Google Sheet dibatalkan karena timeout.",
            err
        );

        showToast(
            `Server Spreadsheet terlalu lama merespons. Memuat ${state.atlet.length} atlet dari data lokal.`,
            "error"
        );
    } else {
        console.error(
            "Error Fetch:", 
            err
        );

        showToast(
            `Gagal terhubung. Memuat ${state.atlet.length} atlet dari data lokal.`,
            "error"
        );
    }
}
}

async function syncDataToSpreadsheet() {
    const toast = showToast("Menyinkronkan seluruh menu ke Spreadsheet...", "loading");

    const dynamicPeriodisasiList = (typeof generateDynamicPeriodisasi === 'function' && state.periodisasiConfig) 
        ? generateDynamicPeriodisasi(state.periodisasiConfig.startDate, state.periodisasiConfig.totalWeeks) 
        : [];

    const payload = {
        atlet: state.atlet || [],
        absensi: state.absensi || [],
        tesFisik: state.tesFisik || [],
        tesTeknik: state.tesTeknik || [],
        periodisasiConfig: state.periodisasiConfig || null,
        periodisasiList: dynamicPeriodisasiList,
        programLatihan: state.programLatihan || [],
        matchLive: state.matchLive || {},
        joggingLogs: state.joggingLogs || [],
        masLogs: state.masLogs || [],
        laporanValidasi: state.laporanValidasi || [],
        rpeLogs: state.rpeLogs || [],
        gymLogs: state.gymLogs || [],
        lastSynced: new Date().toISOString()
    };

    try {
        await apiPost(payload);
        if (toast) toast.remove();
        showToast("Seluruh 11 Menu berhasil di-backup ke Spreadsheet!", "success");
    } catch (err) {
        if (toast) toast.remove();
        showToast("Gagal menyinkronkan. Tersimpan di cache lokal.", "error");
    }
}

function startAutoSync(intervalMinutes = 5) {
    if (autoSyncIntervalId) clearInterval(autoSyncIntervalId);
    
    autoSyncIntervalId = setInterval(async () => {
        const appScreen = document.getElementById('app-screen');
        if (appScreen && !appScreen.classList.contains('hidden')) {
            await syncDataToSpreadsheet();
        }
    }, intervalMinutes * 60 * 1000);
}

function stopAutoSync() {
    if (autoSyncIntervalId) {
        clearInterval(autoSyncIntervalId);
        autoSyncIntervalId = null;
    }
}