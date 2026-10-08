function calculateAtletACWR(atletId, customLogs = null) {
    const logs = customLogs || (state.rpeLogs ? state.rpeLogs.filter(r => String(r.atletId) === String(atletId)) : []);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let acuteLoad = 0;   
    let chronicSum = 0;  

    logs.forEach(log => {
        if (!log.tanggal) return;

        const logDate = new Date(log.tanggal);
        logDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
        const loadVal = parseFloat(
            log.sRPE || 
            log.srpe || 
            (log.rpeVal * log.durasi) || 
            0
        );

        if (diffDays >= 0 && diffDays < 7) {
            acuteLoad += loadVal;
        }
        if (diffDays >= 0 && diffDays < 28) {
            chronicSum += loadVal;
        }
    });

    const chronicLoad = Math.round(chronicSum / 4);

    let acwrRatio = chronicLoad > 0 
        ? parseFloat((acuteLoad / chronicLoad).toFixed(2)) 
        : 0;

    let statusRisk = "Underloading";
    let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";

    if (acwrRatio >= 0.8 && acwrRatio <= 1.3) {
        statusRisk = "Sweet Spot (Aman)";
        badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
    } else if (acwrRatio > 1.3 && acwrRatio <= 1.5) {
        statusRisk = "High Risk (Waspada)";
        badgeClass = "bg-amber-100 text-amber-800 border-amber-300";
    } else if (acwrRatio > 1.5) {
        statusRisk = "Danger Zone (Sangat Rawan)";
        badgeClass = "bg-rose-100 text-rose-800 border-rose-300";
    }

    return { 
        acuteLoad, 
        chronicLoad, 
        acwrRatio, 
        statusRisk, 
        badgeClass, 
        totalLogs: logs.length 
    };
}

// 3. FUNGSI KALKULASI RASIO BEBAN LATIHAN (ACWR ALERT)
function getACWRStatus(atlet) {
    const ac = calculateAtletACWR(atlet.id);

    if (ac.totalLogs === 0) {
        return { ratio: '0.00', label: 'No Data', color: 'bg-slate-100 text-slate-600 border-slate-300' };
    }

    if (ac.acwrRatio < 0.8) 
        return { 
            ratio: ac.acwrRatio, 
            label: 'Under', 
            color: 'bg-blue-50 text-blue-700 border-blue-200' 
        };

    if (ac.acwrRatio <= 1.3) 
        return { 
            ratio: ac.acwrRatio, 
            label: 'Optimal', 
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        };
        
    if (ac.acwrRatio <= 1.5) 
        return { 
            ratio: ac.acwrRatio, 
            label: 'Caution', 
            color: 'bg-amber-50 text-amber-700 border-amber-200' 
        };

    return { 
        ratio: ac.acwrRatio, 
        label: 'High Risk', 
        color: 'bg-rose-50 text-rose-700 border-rose-200' 
    };
}

function updateRealtimeSRPE() {
    const rpeVal = parseInt(document.getElementById('rpe-scale')?.value || 0);
    const durasi = parseInt(document.getElementById('rpe-durasi')?.value || 0);
    const displaySRPE = document.getElementById('rpe-srpe-display');
    if (displaySRPE) {
        const sRPE = rpeVal * durasi;
        displaySRPE.value = `${sRPE} AU`;
    }
}

async function submitAtletRPE(e) {
    e.preventDefault();
    const atlet = state.activeAtlet;
    if (!atlet) return;

    const tanggal = document.getElementById('rpe-tanggal')?.value || new Date().toISOString().split('T')[0];
    const rpeVal = parseInt(document.getElementById('rpe-scale')?.value || 5);
    const durasi = parseInt(document.getElementById('rpe-durasi')?.value || 90);
    const hrMax = parseInt(document.getElementById('rpe-hrmax')?.value) || 0;
    const sRPE = rpeVal * durasi;

    const newRpe = {
        id: 'rpe_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        atletId: String(atlet.id),
        namaAtlet: atlet.nama,
        tanggal: tanggal,
        rpeVal: rpeVal,
        durasi: durasi,
        hrMax: hrMax,
        sRPE: sRPE,
        status: 'Disetujui'
    };

    // 1. Simpan langsung ke memori lokal HP atlet
    if (!state.rpeLogs) state.rpeLogs = [];
    state.rpeLogs.unshift(newRpe);
    saveStorage('rpeLogs', state.rpeLogs);
	if (typeof window.pushToFirebaseRT === 'function') {
        window.pushToFirebaseRT('rpeLogs', state.rpeLogs);
    }
    const toast = showToast('Mengirim laporan RPE ke Google Sheet...', 'loading');

    // 2. Kirim dengan format yang cocok persis dengan Apps Script kamu
    try {
        await apiPost({
            action: "APPEND_RPE",
            data: newRpe
        });
        if (toast) toast.remove();
        showToast('Laporan RPE berhasil tersimpan ke Google Sheet!', 'success');
    } catch (err) {
        if (toast) toast.remove();
        showToast('Tersimpan di HP (offline). Akan sinkron otomatis saat online.', 'error');
    }

    renderSidebar();
    renderContent();
}

function deleteRpeLog(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan laporan RPE ini?")) return;

    state.rpeLogs = (state.rpeLogs || []).filter(r => String(r.id) !== String(id));
    saveStorage('rpeLogs', state.rpeLogs);

    if (typeof syncDataToSpreadsheet === 'function') {
        syncDataToSpreadsheet();
    }

    renderSidebar();
    renderContent();
    showToast("Laporan RPE berhasil dihapus!", "success");
}

function exportAcwrRpeCSV() {
    const headers = ['Tanggal Log', 'Nama Atlet', 'Posisi', 'Skala RPE', 'Durasi (Mnt)', 'Max HR (BPM)', 'sRPE (AU)', 'Acute Load (7hr)', 'Chronic Load (28hr)', 'Rasio ACWR', 'Status Risiko'];
    
    const rows = [];
    
    if (state.rpeLogs.length === 0) {
        state.atlet.forEach(at => {
            const ac = calculateAtletACWR(at.id);
            rows.push(['-', at.nama, at.posisi, '-', '-', '-', 0, ac.acuteLoad, ac.chronicLoad, ac.acwrRatio, ac.statusRisk]);
        });
    } else {
        state.rpeLogs.forEach(r => {
            const at = state.atlet.find(a => String(a.id) === String(r.atletId)) || { nama: 'Unknown', posisi: '-' };
            const ac = calculateAtletACWR(r.atletId);
            rows.push([
                r.tanggal || '-',
                at.nama,
                at.posisi,
                r.rpeVal,
                r.durasi,
                r.hrMax || '-',
                r.sRPE,
                ac.acuteLoad,
                ac.chronicLoad,
                ac.acwrRatio,
                ac.statusRisk
            ]);
        });
    }

    exportToCSV('Rekap_ACWR_dan_RPE_Floorball.csv', headers, rows);
    showToast('File CSV ACWR & RPE berhasil diunduh!', 'success');
}