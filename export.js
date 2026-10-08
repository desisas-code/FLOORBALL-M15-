function exportToCSV(filename, headers, rows) {
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function backupDataJSON() {
    const backupData = {
        atlet: state.atlet,
        absensi: state.absensi,
        tesFisik: state.tesFisik,
        tesTeknik: state.tesTeknik,
        rpeLogs: state.rpeLogs,
        joggingLogs: state.joggingLogs,
        masLogs: state.masLogs,
        laporanValidasi: state.laporanValidasi,
        exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_Floorball_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("File backup JSON berhasil diunduh!", "success");
}

function restoreDataJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.atlet) { state.atlet = data.atlet; saveStorage('atlet', state.atlet); }
            if (data.absensi) { state.absensi = data.absensi; saveStorage('absensi', state.absensi); }
            if (data.tesFisik) { state.tesFisik = data.tesFisik; saveStorage('tesFisik', state.tesFisik); }
            if (data.tesTeknik) { state.tesTeknik = data.tesTeknik; saveStorage('tesTeknik', state.tesTeknik); }
            if (data.rpeLogs) { state.rpeLogs = data.rpeLogs; saveStorage('rpeLogs', state.rpeLogs); }
            if (data.joggingLogs) { state.joggingLogs = data.joggingLogs; saveStorage('joggingLogs', state.joggingLogs); }
            if (data.masLogs) { state.masLogs = data.masLogs; saveStorage('masLogs', state.masLogs); }
            if (data.laporanValidasi) { state.laporanValidasi = data.laporanValidasi; saveStorage('laporanValidasi', state.laporanValidasi); }

            renderSidebar();
            renderContent();
            showToast("Database berhasil dipulihkan dari file JSON!", "success");
        } catch (err) {
            showToast("Gagal memulihkan: Format file JSON tidak valid!", "error");
        }
    };
    reader.readAsText(file);
}

function exportPDFCustom(elementId, filenamePrefix) {
    const target = document.getElementById(elementId) || document.getElementById('main-container');
    if (!target) {
        showToast('Area data tidak ditemukan!', 'error');
        return;
    }

    const toast = showToast('Menyiapkan dokumen cetak PDF...', 'loading');

    // 1. Ambil salinan konten tabel dan data
    const contentHtml = target.innerHTML;

    // 2. Buat jendela cetak mandiri agar bebas dari batasan CSS layar HP/Laptop
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        if (toast) toast.remove();
        showToast('Izinkan pop-up browser untuk mengunduh PDF!', 'error');
        return;
    }

    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>${filenamePrefix}_${new Date().toISOString().split('T')[0]}</title>
            <script src="https://cdn.tailwindcss.com"><\/script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                @page {
                    size: A4 landscape;
                    margin: 10mm;
                }
                body {
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    font-family: sans-serif;
                    padding: 10px;
                }
                /* Pastikan tabel terbuka penuh */
                * {
                    overflow: visible !important;
                    max-height: none !important;
                }
                table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                }
                tr, .bg-white {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                /* Hilangkan tombol & elemen yang tidak perlu dicetak */
                button, input, select, .no-print, #toast-container {
                    display: none !important;
                }
            </style>
        </head>
        <body>
            <div class="mb-4 pb-2 border-b border-slate-300 flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-black text-slate-900">COACH FLOORBALL PRO SYSTEM</h2>
                    <p class="text-xs text-slate-500 font-bold">Laporan Resmi Skuad & Data Pelatihan</p>
                </div>
                <div class="text-right text-xs font-mono font-bold text-slate-500">
                    Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>

            <div>
                ${contentHtml}
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    }, 500);
                };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();

    if (toast) toast.remove();
    showToast('Jendela PDF terbuka. Pilih "Simpan sebagai PDF"!', 'success');
}	

