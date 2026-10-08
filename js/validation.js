async function setStatusLaporanValidasi(id, statusTarget) {
    const idx = state.laporanValidasi.findIndex(l => String(l.id) === String(id));
    if (idx !== -1) {
        // 1. Update status di memori lokal
        state.laporanValidasi[idx].status = statusTarget;
        saveStorage('laporanValidasi', state.laporanValidasi);
		if (typeof window.pushToFirebaseRT === 'function') {
            window.pushToFirebaseRT('laporanValidasi', state.laporanValidasi);
        }
  
        renderSidebar();
        renderContent();
        showToast(`Laporan berhasil diubah ke status: ${statusTarget}`, 'success');

        // 4. Minta server Google Spreadsheet melakukan backup seketika
        if (typeof syncDataToSpreadsheet === 'function') {
            await syncDataToSpreadsheet();
        }
    }
}

function deleteRiwayatValidasi(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus riwayat validasi ini?")) return;

    // 1. Hapus dari state
    state.laporanValidasi = (state.laporanValidasi || []).filter(item => String(item.id) !== String(id));

    // 2. Simpan ke LocalStorage sesuai key sistem
    saveStorage('laporanValidasi', state.laporanValidasi);

    // 3. Backup otomatis ke Google Spreadsheet
    if (typeof syncDataToSpreadsheet === 'function') {
        syncDataToSpreadsheet();
    }

    // 4. Render ulang UI
    renderSidebar();
    renderContent();
    showToast("Riwayat validasi berhasil dihapus!", "success");
}