function getAtletAbsensiSummary(atletId = null) {
    let targetAtlet = atletId ? state.atlet.filter(a => String(a.id) === String(atletId)) : state.atlet;
    return targetAtlet.map(a => {
        const records = state.absensi.filter(ab => String(ab.atletId) === String(a.id));
        const total = records.length;
        let hadir = 0, telat = 0, sakit = 0, izin = 0, alpa = 0;
        records.forEach(r => {
            if (r.status === 'Hadir') hadir++;
            else if (r.status === 'Telat') telat++;
            else if (r.status === 'Sakit') sakit++;
            else if (r.status === 'Izin') izin++;
            else if (r.status === 'Alpa') alpa++;
        });
        const persentase = total > 0 ? Math.round(((hadir + telat) / total) * 100) : 0;
        return { ...a, total, hadir, telat, sakit, izin, alpa, persentase };
    });
}

function toggleAbsensiMode(mode) {
    state.absensiInputMode = mode;
    renderContent();
}

async function submitBulkAbsensi(e) {
    e.preventDefault();
    const tanggalElem = document.getElementById('bulk-absensi-tanggal');
    const jenisElem = document.getElementById('bulk-absensi-jenis');
    const tanggal = tanggalElem ? tanggalElem.value : '';
    const jenis = jenisElem ? jenisElem.value : '';

    const newEntries = [];
    state.atlet.forEach(at => {
        const selectElem = document.getElementById(`bulk-status-${at.id}`);
        if (selectElem) {
            newEntries.push({
                id: Date.now().toString() + '_' + at.id,
                atletId: at.id,
                tanggal,
                jenis,
                status: selectElem.value
            });
        }
    });

    if (newEntries.length === 0) return;

    state.absensi = [...newEntries, ...state.absensi];
    saveStorage('absensi', state.absensi);
    if (typeof window.pushToFirebaseRT === 'function') {
        window.pushToFirebaseRT('absensi', state.absensi);
    }
    renderContent();
    showToast(`Presensi massal (${newEntries.length} atlet) berhasil disimpan!`, 'success');
}

async function submitAbsensiOptimistic(e) {
    e.preventDefault();
    const atletId = document.getElementById('absensi-atlet-id')?.value;
    const tanggal = document.getElementById('absensi-tanggal')?.value;
    const jenis = document.getElementById('absensi-jenis')?.value;
    const status = document.getElementById('absensi-status')?.value;

    const newAbsensi = { id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4), atletId, tanggal, jenis, status };
    state.absensi.unshift(newAbsensi);
    saveStorage('absensi', state.absensi);
    if (typeof window.pushToFirebaseRT === 'function') {
        window.pushToFirebaseRT('absensi', state.absensi);
    }
    renderContent();
    showToast('Presensi berhasil disimpan!', 'success');
}

function deleteAbsensiLog(id) {
    state.absensi = state.absensi.filter(a => a.id !== id);
    saveStorage('absensi', state.absensi);
    if (typeof window.pushToFirebaseRT === 'function') {
        window.pushToFirebaseRT('absensi', state.absensi);
    }
    renderContent();
    showToast('Catatan presensi berhasil dihapus', 'success');
}

function exportAbsensiCSV() {
    const summary = getAtletAbsensiSummary();
    const headers = ['Nama Atlet', 'Posisi', 'Total Sesi', 'Hadir', 'Alpa', 'Persentase Kehadiran (%)'];
    const rows = summary.map(s => [s.nama, s.posisi, s.total, s.hadir, s.alpa, `${s.persentase}%`]);
    exportToCSV('Rekap_Absensi_Floorball.csv', headers, rows);
}