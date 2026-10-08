function exportDataAtletCSV() {
    const headers = ['Nama', 'Posisi', 'Gender', 'Usia', 'Tinggi (cm)', 'Berat (kg)', 'PIN', 'Cedera'];
    const rows = state.atlet.map(a => [a.nama, a.posisi, a.gender, a.usia, a.tb, a.bb, a.pin, a.cedera]);
    exportToCSV('Data_Atlet_Floorball.csv', headers, rows);
}

function exportAbsensiCSV() {
    const summary = getAtletAbsensiSummary();
    const headers = ['Nama Atlet', 'Posisi', 'Total Sesi', 'Hadir', 'Alpa', 'Persentase Kehadiran (%)'];
    const rows = summary.map(s => [s.nama, s.posisi, s.total, s.hadir, s.alpa, `${s.persentase}%`]);
    exportToCSV('Rekap_Absensi_Floorball.csv', headers, rows);
}

function exportAbsensiCSV() {
    const summary = getAtletAbsensiSummary();
    const headers = ['Nama Atlet', 'Posisi', 'Total Sesi', 'Hadir', 'Alpa', 'Persentase Kehadiran (%)'];
    const rows = summary.map(s => [s.nama, s.posisi, s.total, s.hadir, s.alpa, `${s.persentase}%`]);
    exportToCSV('Rekap_Absensi_Floorball.csv', headers, rows);
}

function exportGymLogsCSV() {
    const listGym = loadStorage('gymLogs', state.gymLogs || []);
    const headers = ['Tanggal', 'Nama Atlet', 'Kategori', 'Gerakan', 'Target Beban', 'Set & Reps'];
    const rows = listGym.map(g => {
        const pObj = state.atlet.find(a => String(a.id) === String(g.atletId));
        const nama = g.atletId === 'semua' ? 'Semua Atlet Skuad' : (pObj ? pObj.nama : 'Unknown');
        return [g.tanggal || '-', nama, g.kategori || '-', g.gerakan || '-', g.beban || '-', g.setRep || '-'];
    });

    exportToCSV('Rekap_Preskripsi_Gym_Floorball.csv', headers, rows);
    showToast('File CSV Riwayat Gym berhasil diunduh!', 'success');
}