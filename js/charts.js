function destroyAllCharts() {
    Object.keys(chartRegistry).forEach(key => {
        if (chartRegistry[key]) {
            chartRegistry[key].destroy(); // Hapus event listener internal Chart.js
            delete chartRegistry[key];
        }
    });
}

function destroySingleChart(chartKey) {
    if (chartRegistry[chartKey]) {
        chartRegistry[chartKey].destroy();
        delete chartRegistry[chartKey];
    }
}

function renderChartsForMenu(menuId) {
    destroyAllCharts();

    // 1. Menu 1: Komposisi Posisi Pemain (Doughnut Chart)
    if (menuId === 'menu-1') {
        const canvasPos = document.getElementById('chart-posisi-atlet');
        if (canvasPos) {
            const counts = { DL: 0, DR: 0, FL: 0, FR: 0, C: 0, GK: 0 };
            state.atlet.forEach(a => { if (counts[a.posisi] !== undefined) counts[a.posisi]++; });

            chartInstances['posisi'] = new Chart(canvasPos.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        data: Object.values(counts),
                        backgroundColor: ['#38BDF8', '#0284C7', '#3B82F6', '#1D4ED8', '#6366F1', '#F59E0B'],
                        borderWidth: 3,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } }
                        }
                    }
                }
            });
        }
    }

    // 2. Menu 2: Persentase Kehadiran Skuad (Bar Chart)
    else if (menuId === 'menu-2') {
        const ctx = document.getElementById('chart-absensi-overview')?.getContext('2d');
        if (ctx) {
            const summary = getAtletAbsensiSummary();
            const labels = summary.map(s => s.nama.split(' ')[0]);
            const dataHadir = summary.map(s => s.persentase);

            chartInstances['absensi'] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Kehadiran (%)',
                        data: dataHadir,
                        backgroundColor: dataHadir.map(v => v >= 80 ? '#10B981' : (v >= 60 ? '#F59E0B' : '#EF4444')),
                        borderRadius: 6
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    plugins: { legend: { display: false } },
                    scales: { 
                        x: { ticks: { font: { size: 9, weight: 'bold' }, maxRotation: 45, minRotation: 45 } },
                        y: { min: 0, max: 100, ticks: { callback: v => v + '%' } } 
                    } 
                }
            });
        }
    }

    // 3. Menu 3: Radar Kebugaran Skuad (Radar Chart)
    else if (menuId === 'menu-3') {
        const ctxRadar = document.getElementById('chart-radar-fisik')?.getContext('2d');
        if (ctxRadar) {
            chartInstances['radarFisik'] = new Chart(ctxRadar, {
                type: 'radar',
                data: {
                    labels: ['Vo2Max', 'Flexibility', 'Strength', 'Power', 'Agility', 'Speed'],
                    datasets: [{
                        label: 'Rerata Skuad',
                        data: [75, 68, 72, 80, 70, 74],
                        backgroundColor: 'rgba(56, 189, 248, 0.25)',
                        borderColor: '#0284c7'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }

    // 4. Menu 4: Kurva Periodisasi Bompa (Line Chart)
    else if (menuId === 'menu-4') {
        const ctxBompa = document.getElementById('chart-periodisasi-bompa')?.getContext('2d');
        if (ctxBompa) {
            const list = generateDynamicPeriodisasi(state.periodisasiConfig.startDate, state.periodisasiConfig.totalWeeks);
            chartInstances['bompa'] = new Chart(ctxBompa, {
                type: 'line',
                data: {
                    labels: list.map(m => `W${m.mingguKe}`),
                    datasets: [
                        { label: 'Volume (%)', data: list.map(m => m.volumePct), borderColor: '#3b82f6', tension: 0.3 },
                        { label: 'Intensitas (%)', data: list.map(m => m.intensitasPct), borderColor: '#ef4444', tension: 0.3 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }

    // 5. Menu 5: Distribusi Target Intensitas RPE Mingguan (Bar Chart)
    else if (menuId === 'menu-5') {
        const ctxProg = document.getElementById('chart-program-rpe')?.getContext('2d');
        if (ctxProg) {
            chartInstances['progRpe'] = new Chart(ctxProg, {
                type: 'bar',
                data: {
                    labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
                    datasets: [{
                        label: 'Target RPE (1-10)',
                        data: [5, 4, 6, 2, 6, 7, 1],
                        backgroundColor: ['#38bdf8', '#0284c7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { min: 0, max: 10, ticks: { stepSize: 1 } } }
                }
            });
        }
    }

    // 6. Menu 7: Monitoring Volume & Pace Jogging (Line Chart)
    else if (menuId === 'menu-7') {
        const ctxJog = document.getElementById('chart-jogging-mas')?.getContext('2d');
        if (ctxJog) {
            const logs = (state.joggingLogs || []).slice().reverse();
            chartInstances['jogMas'] = new Chart(ctxJog, {
                type: 'line',
                data: {
                    labels: logs.length > 0 ? logs.map((_, i) => `Sesi ${i+1}`) : ['Sesi 1'],
                    datasets: [{
                        label: 'Jarak (KM)',
                        data: logs.length > 0 ? logs.map(j => parseFloat(j.jarak) || 0) : [0],
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }

    // 7. Menu 8: Distribusi Status Validasi (Pie/Doughnut Chart)
    else if (menuId === 'menu-8') {
        const ctxVal = document.getElementById('chart-validasi-status')?.getContext('2d');
        if (ctxVal) {
            const reports = state.laporanValidasi || [];
            const p = reports.filter(l => !l.status || l.status.toLowerCase() === 'menunggu').length;
            const a = reports.filter(l => l.status && l.status.toLowerCase() === 'disetujui').length;
            const r = reports.filter(l => l.status && l.status.toLowerCase() === 'ditolak').length;

            chartInstances['validasiStatus'] = new Chart(ctxVal, {
                type: 'doughnut',
                data: {
                    labels: ['Menunggu', 'Disetujui', 'Ditolak'],
                    datasets: [{
                        data: [p, a, r],
                        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
    }

    // 8. Menu 9: Tren sRPE & Bar Rasio ACWR
    else if (menuId === 'menu-9') {
        const ctxTrend = document.getElementById('chart-srpe-trend')?.getContext('2d');
        if (ctxTrend) {
            chartInstances['srpeTrend'] = new Chart(ctxTrend, {
                type: 'line',
                data: {
                    labels: ['W-5', 'W-4', 'W-3', 'W-2', 'W-1', 'Minggu Ini'],
                    datasets: [{
                        label: 'Rerata Load (AU)',
                        data: [1400, 1650, 1500, 1800, 1600, 1750],
                        borderColor: '#3b82f6',
                        tension: 0.35,
                        fill: false
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        const ctxAcwr = document.getElementById('chart-acwr-bar')?.getContext('2d');
        if (ctxAcwr) {
            const summary = state.atlet.slice(0, 8);
            const labels = summary.map(a => a.nama.split(' ')[0]);
            const dataRatio = summary.map(a => calculateAtletACWR(a.id).acwrRatio);

            chartInstances['acwrBar'] = new Chart(ctxAcwr, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Rasio ACWR',
                        data: dataRatio,
                        backgroundColor: dataRatio.map(r => r > 1.5 ? '#ef4444' : (r > 1.3 ? '#f59e0b' : '#10b981')),
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { min: 0, max: 2.5 } }
                }
            });
        }
    }
}