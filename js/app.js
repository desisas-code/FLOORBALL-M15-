function renderSidebar() {
    const menuContainer = document.getElementById('sidebar-menu');
    if(!menuContainer) return;
    const currentRoleMenus = menus[state.currentRole];
    
    const pendingValidasiCount = state.laporanValidasi.filter(l => l.status === 'Menunggu').length;
    const rpeCount = state.rpeLogs.length;

    const listHtml = currentRoleMenus.map(menu => {
        const isActive = menu.id === state.currentMenu;
        
        const activeClass = isActive 
            ? 'bg-gradient-to-r from-sky-400 via-blue-400 to-sky-500 text-white font-black shadow-lg shadow-sky-400/40 border-l-4 border-blue-200' 
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 font-extrabold hover:translate-x-1';
        
        const textHideClass = state.sidebarCollapsed ? 'hidden' : '';

        let badgeHtml = '';
        if (!state.sidebarCollapsed) {
            if (menu.badgeKey === 'validasi' && pendingValidasiCount > 0) {
                badgeHtml = `<span class="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce shadow-sm">${pendingValidasiCount}</span>`;
            } else if (menu.badgeKey === 'acwr' && rpeCount > 0) {
                badgeHtml = `<span class="bg-cyan-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">${rpeCount}</span>`;
            }
        }

        return `
            <button onclick="navigate('${menu.id}')" class="w-full flex items-center justify-between px-3.5 py-3.5 rounded-2xl transition-all duration-200 text-xs ${activeClass} overflow-hidden whitespace-nowrap group" title="${menu.name}">
                <div class="flex items-center gap-3">
                    <i class="fa-solid ${menu.icon} text-base w-5 text-center shrink-0 transition-transform group-hover:scale-110"></i>
                    <span class="sidebar-text truncate ${textHideClass}">${menu.name}</span>
                </div>
                ${badgeHtml}
            </button>
        `;
    }).join('');

    // Tombol Logout selalu dipasang di paling bawah menu
    const logoutBtnHtml = `
        <div class="pt-3 mt-3 border-t border-slate-800">
            <button onclick="logout()" class="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl text-xs font-black text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all border border-rose-900/30">
                <i class="fa-solid fa-right-from-bracket text-base w-5 text-center shrink-0"></i>
                <span class="sidebar-text truncate ${state.sidebarCollapsed ? 'hidden' : ''}">Keluar / Ganti Akun</span>
            </button>
        </div>
    `;

    menuContainer.innerHTML = listHtml + logoutBtnHtml;
}

function toggleSidebarDesktop() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    const sidebar = document.getElementById('main-sidebar');
    const icon = document.getElementById('toggle-sidebar-icon');
    const texts = document.querySelectorAll('.sidebar-text');

    if (state.sidebarCollapsed) {
        sidebar.classList.remove('md:w-72');
        sidebar.classList.add('md:w-20');
        if(icon) icon.className = 'fa-solid fa-chevron-right text-xs';
        texts.forEach(el => el.classList.add('hidden'));
    } else {
        sidebar.classList.remove('md:w-20');
        sidebar.classList.add('md:w-72');
        if(icon) icon.className = 'fa-solid fa-chevron-left text-xs';
        texts.forEach(el => el.classList.remove('hidden'));
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('sidebar-menu');
    if (menu) menu.classList.toggle('hidden');
}

function navigate(menuId) {
    // Hentikan dan bersihkan Three.js & Peta jika meninggalkan menu
    cleanupThreeJS();
    cleanupMaps();

    // Hentikan Dribble Timer jika berjalan
    if (state.matchLive.dribbleTimer && state.matchLive.dribbleTimer.intervalId) {
        clearInterval(state.matchLive.dribbleTimer.intervalId);
        state.matchLive.dribbleTimer.isRunning = false;
        state.matchLive.dribbleTimer.elapsedSec = 0;
    }
    // Simpan state timer utama tanpa mematikan elapsed time
    if (state.matchLive.matchTimer && state.matchLive.matchTimer.intervalId) {
        clearInterval(state.matchLive.matchTimer.intervalId);
        state.matchLive.matchTimer.isRunning = false;
    }
    
    state.currentMenu = menuId;
    const menu = document.getElementById('sidebar-menu');
    if (menu && window.innerWidth < 768) {
        menu.classList.add('hidden');
    }
    renderSidebar();
    renderContent();
}

function setFilterTahapFisik(tahap) {
    state.filterTahapFisik = tahap;
    renderContent();
}

function renderContent() {
const container = document.getElementById('main-container');
const pageTitle = document.getElementById('page-title');
if (!container || !pageTitle) return;

    if (state.currentMenu === 'menu-1') {
pageTitle.innerText = "Data Atlet & Autentikasi PIN";

const filteredAtlet = state.atlet.filter(a => 
a.nama.toLowerCase().includes(state.searchQueryAtlet) ||
a.posisi.toLowerCase().includes(state.searchQueryAtlet)
);

container.innerHTML = `
<!-- 1. KARTU STATISTIK UTAMA (UPGRADED WITH HOVER & GLOW) -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
    <div class="bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-4 group">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-users"></i>
        </div>
        <div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Skuad</p>
            <h4 class="text-3xl font-black text-slate-900 font-display">${state.atlet.length} <span class="text-sm font-bold text-slate-500">Atlet</span></h4>
        </div>
    </div>

    <div class="bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-4 group">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-shield-halved"></i>
        </div>
        <div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">PIN Akses Aktif</p>
            <h4 class="text-3xl font-black text-slate-900 font-display">${state.atlet.length} <span class="text-sm font-bold text-emerald-600">Verified</span></h4>
        </div>
    </div>

    <div class="bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-4 group">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform relative">
            <i class="fa-solid fa-notes-medical"></i>
            ${state.atlet.filter(a => a.cedera !== 'Tidak ada').length > 0 ? '<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-ping"></span>' : ''}
        </div>
        <div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Pantauan Medis</p>
            <h4 class="text-3xl font-black text-slate-900 font-display">${state.atlet.filter(a => a.cedera !== 'Tidak ada').length} <span class="text-sm font-bold text-rose-500">Cedera</span></h4>
        </div>
    </div>
</div>

<!-- 2. CHART POSISI DENGAN LEGENDA INTERAKTIF & METRIK DEMOGRAFI -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
    <!-- DIAGRAM DOUGHNUT CHART -->
    <div class="lg:col-span-5 bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
            <h4 class="font-black text-slate-800 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
                <i class="fa-solid fa-chart-pie text-blue-900 text-sm"></i> Komposisi Posisi Pemain
            </h4>
            <span class="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">6 Posisi</span>
        </div>
        <div class="h-52 w-full relative flex items-center justify-center">
            <canvas id="chart-posisi-atlet"></canvas>
        </div>
    </div>

    <!-- RINGKASAN DEMOGRAFI SKUAD -->
    <div class="lg:col-span-7 bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <h4 class="font-black text-slate-800 text-xs mb-4 flex items-center gap-2 font-display uppercase tracking-wider">
            <i class="fa-solid fa-layer-group text-blue-900 text-sm"></i> Demografi & Komposisi Skuad
        </h4>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div class="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl hover:border-blue-300 transition-colors">
                <span class="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Putra</span>
                <span class="text-xl font-black text-slate-800 font-mono mt-1 block">
                    ${state.atlet.filter(a => a.gender === 'Putra').length} <span class="text-xs font-bold text-slate-500">Atlet</span>
                </span>
            </div>
            <div class="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl hover:border-blue-300 transition-colors">
                <span class="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Putri</span>
                <span class="text-xl font-black text-slate-800 font-mono mt-1 block">
                    ${state.atlet.filter(a => a.gender === 'Putri').length} <span class="text-xs font-bold text-slate-500">Atlet</span>
                </span>
            </div>
            <div class="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl hover:border-blue-400 transition-colors">
                <span class="block text-[10px] font-black text-blue-800 uppercase tracking-wider">Kiper (GK)</span>
                <span class="text-xl font-black text-blue-950 font-mono mt-1 block">
                    ${state.atlet.filter(a => a.posisi === 'GK').length} <span class="text-xs font-bold text-blue-700">Pemain</span>
                </span>
            </div>
            <div class="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl hover:border-amber-400 transition-colors">
                <span class="block text-[10px] font-black text-amber-800 uppercase tracking-wider">Rerata Usia</span>
                <span class="text-xl font-black text-amber-950 font-mono mt-1 block">
                    ${(state.atlet.reduce((acc, a) => acc + (parseInt(a.usia) || 0), 0) / (state.atlet.length || 1)).toFixed(1)} <span class="text-xs font-bold text-amber-700">Thn</span>
                </span>
            </div>
            <div class="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl hover:border-emerald-400 transition-colors">
                <span class="block text-[10px] font-black text-emerald-800 uppercase tracking-wider">Rerata TB</span>
                <span class="text-xl font-black text-emerald-950 font-mono mt-1 block">
                    ${Math.round(state.atlet.reduce((acc, a) => acc + (parseInt(a.tb) || 0), 0) / (state.atlet.length || 1))} <span class="text-xs font-bold text-emerald-700">cm</span>
                </span>
            </div>
            <div class="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl hover:border-purple-400 transition-colors">
                <span class="block text-[10px] font-black text-purple-800 uppercase tracking-wider">Rerata BB</span>
                <span class="text-xl font-black text-purple-950 font-mono mt-1 block">
                    ${Math.round(state.atlet.reduce((acc, a) => acc + (parseInt(a.bb) || 0), 0) / (state.atlet.length || 1))} <span class="text-xs font-bold text-purple-700">kg</span>
                </span>
            </div>
        </div>
    </div>
</div>

<!-- TABEL SKUAD & PROFIL ATLET MODERN -->
<div class="bg-white/90 backdrop-blur-md rounded-[32px] border border-slate-200/80 shadow-lg overflow-hidden">
<div class="p-6 border-b border-slate-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
<div>
    <h3 class="text-lg font-black text-slate-900 font-display flex items-center gap-2">
        <i class="fa-solid fa-users-gear text-blue-900"></i> Daftar Skuad & Profil Atlet
    </h3>
    <p class="text-xs font-semibold text-slate-400 mt-0.5">Kelola data antropometri, autentikasi PIN, dan catatan medis skuad.</p>
</div>
<div class="flex items-center gap-2.5 w-full sm:w-auto">
    <div class="relative w-full sm:w-64">
        <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input type="text" oninput="filterSearchAtlet(this.value)" value="${escapeHTML(state.searchQueryAtlet)}" placeholder="Cari nama atau posisi..." class="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200/90 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white">
    </div>
    <button onclick="exportDataAtletCSV()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"><i class="fa-solid fa-file-excel"></i> Ekspor CSV</button>
    <button onclick="openModalAtlet()" class="bg-blue-900 hover:bg-blue-950 text-white px-5 py-2.5 rounded-2xl font-extrabold text-xs shadow-md shadow-blue-900/20 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"><i class="fa-solid fa-plus"></i> Atlet Baru</button>
</div>
</div>

<div class="overflow-x-auto">
<table class="w-full text-left border-collapse min-w-[800px]">
    <thead class="bg-slate-900 text-slate-300 text-[10px] font-black uppercase tracking-wider">
        <tr>
            <th class="py-4 px-5 text-left">Profil Atlet</th>
            <th class="py-4 px-4 text-center">Posisi</th>
            <th class="py-4 px-4 text-center">Antropometri</th>
            <th class="py-4 px-4 text-center">HR Max</th>
            <th class="py-4 px-4 text-center">Akses PIN</th>
            <th class="py-4 px-4 text-center">Status Medis</th>
            <th class="py-4 px-5 text-center">Aksi</th>
        </tr>
    </thead>
    <tbody class="divide-y divide-slate-100/90 text-xs font-semibold">
        ${filteredAtlet.map(a => {
            const inisial = a.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const hrMaxEst = 220 - (parseInt(a.usia) || 20);
            const isCedera = a.cedera !== 'Tidak ada';

            // Color Coding Posisi
            let posColor = 'bg-blue-50 text-blue-900 border-blue-200';
            if (a.posisi === 'GK') posColor = 'bg-amber-500/10 text-amber-800 border-amber-300/80';
            else if (a.posisi === 'C') posColor = 'bg-indigo-500/10 text-indigo-900 border-indigo-300/80';
            else if (['FL','FR'].includes(a.posisi)) posColor = 'bg-cyan-500/10 text-cyan-900 border-cyan-300/80';

            const cederaBadge = isCedera 
                ? `<span class="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 w-fit mx-auto shadow-sm"><i class="fa-solid fa-notes-medical"></i> ${escapeHTML(a.cedera)}</span>` 
                : `<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 w-fit mx-auto shadow-sm"><i class="fa-solid fa-shield-heart"></i> Bugar</span>`;
            const acwrStatus = getACWRStatus(a);
            
            return `
            <tr class="hover:bg-blue-50/40 transition-all duration-200 group hover:scale-[1.002]">
                <td class="py-4 px-5">
                    <div class="flex items-center gap-3.5">
                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-900 via-indigo-800 to-cyan-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-900/20 shrink-0 font-display ring-2 ring-white">
                            ${inisial}
                        </div>
                        <div>
                            <p onclick="openAtletRadarModal('${a.id}')" class="font-black text-slate-900 text-sm tracking-tight hover:text-amber-500 cursor-pointer transition">${escapeHTML(a.nama)}</p>
                            <p class="text-[10px] text-slate-400 font-extrabold mt-0.5">${a.usia} Thn • ${escapeHTML(a.gender)}</p>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
                    <span class="${posColor} font-black px-3 py-1.5 rounded-xl border shadow-sm text-[10px] inline-block min-w-[42px]">
                        ${escapeHTML(a.posisi)}
                    </span>
                </td>
                <td class="py-4 px-4 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <div class="bg-slate-50 px-2 py-1 rounded-xl border border-slate-200/80 shadow-sm text-center min-w-[40px]">
                            <span class="block text-[8px] text-slate-400 font-black uppercase">TB</span>
                            <span class="font-black text-slate-800 text-xs">${a.tb}</span>
                        </div>
                        <div class="bg-slate-50 px-2 py-1 rounded-xl border border-slate-200/80 shadow-sm text-center min-w-[40px]">
                            <span class="block text-[8px] text-slate-400 font-black uppercase">BB</span>
                            <span class="font-black text-slate-800 text-xs">${a.bb}</span>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
                    <div class="bg-rose-50/80 px-2.5 py-1 rounded-xl border border-rose-200/80 w-fit mx-auto shadow-sm">
                        <span class="font-mono font-black text-rose-700 text-xs">${hrMaxEst}</span>
                        <span class="text-[8px] font-black text-rose-500 block -mt-0.5">BPM</span>
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
                    <div class="bg-slate-950 text-slate-100 px-3 py-1.5 rounded-xl border border-slate-800 w-fit mx-auto shadow-inner flex items-center gap-1.5 font-mono font-black text-xs">
                        <i class="fa-solid fa-key text-[9px] text-cyan-400"></i>
                        <span>${escapeHTML(a.pin)}</span>
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
<div class="flex items-center justify-center gap-1.5 flex-wrap">
${cederaBadge}
<span class="${acwrStatus.color} border px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-block">
    ACWR: ${acwrStatus.label} (${acwrStatus.ratio})
</span>
</div>
</td>
                <td class="py-4 px-5 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="openModalAtlet('${a.id}')" class="text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white w-8 h-8 rounded-xl transition-all shadow-sm border border-blue-100 active:scale-90 flex items-center justify-center" title="Edit Data"><i class="fa-solid fa-pen-to-square text-xs"></i></button>
                        <button onclick="deleteAtletOptimistic('${a.id}')" class="text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white w-8 h-8 rounded-xl transition-all shadow-sm border border-rose-100 active:scale-90 flex items-center justify-center" title="Hapus Atlet"><i class="fa-solid fa-trash-can text-xs"></i></button>
                    </div>
                </td>
            </tr>
            `;
        }).join('')}
    </tbody>
</table>
</div>
</div>
`;

    } else if (state.currentMenu === 'menu-2') {
        pageTitle.innerText = "Absensi & Kehadiran Latihan";
        const today = new Date().toISOString().split('T')[0];
        const summaryPerAtlet = getAtletAbsensiSummary();
        
        let totalHadirOverall = 0, totalAlpaOverall = 0, totalSesiOverall = 0;
        summaryPerAtlet.forEach(at => {
            totalHadirOverall += at.hadir;
            totalAlpaOverall += at.alpa;
            totalSesiOverall += at.total;
        });
        const rerataTeamPct = totalSesiOverall > 0 ? Math.round((totalHadirOverall / totalSesiOverall) * 100) : 0;
        const optionsAtlet = state.atlet.map(a => `<option value="${a.id}">${escapeHTML(a.nama)} (${escapeHTML(a.posisi)})</option>`).join('');

        container.innerHTML = `
            <!-- 1. DIAGRAM BATANG PRESENSI SKUAD -->
            <div class="bg-white/90 backdrop-blur-md p-6 rounded-[32px] border border-slate-200/80 shadow-lg mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-black text-slate-900 text-xs font-display flex items-center gap-2 uppercase tracking-wider">
                        <i class="fa-solid fa-chart-column text-blue-900 text-sm"></i> Diagram Persentase Kehadiran Per Atlet
                    </h4>
                    <span class="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">Total ${state.atlet.length} Atlet Skuad</span>
                </div>
                <div class="h-52 w-full relative">
                    <canvas id="chart-absensi-overview"></canvas>
                </div>
            </div>

            <!-- 2. KARTU STATISTIK RINGKAS -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <div class="bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-4 group">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-900 via-indigo-800 to-cyan-500 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
                        <i class="fa-solid fa-chart-line"></i>
                    </div>
                    <div>
                        <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Tingkat Kehadiran Tim</p>
                        <h4 class="text-3xl font-black text-slate-900 font-display">${rerataTeamPct}%</h4>
                        <span class="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">Rerata Keseluruhan</span>
                    </div>
                </div>

                <div class="bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-4 group">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        <i class="fa-solid fa-user-check"></i>
                    </div>
                    <div>
                        <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Log Hadir</p>
                        <h4 class="text-3xl font-black text-slate-900 font-display">${totalHadirOverall} <span class="text-sm font-bold text-slate-500">Sesi</span></h4>
                        <span class="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">Tercatat di Sistem</span>
                    </div>
                </div>

                <div class="bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-4 group">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                        <i class="fa-solid fa-user-xmark"></i>
                    </div>
                    <div>
                        <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Alpa / Tanpa Ket.</p>
                        <h4 class="text-3xl font-black text-slate-900 font-display">${totalAlpaOverall} <span class="text-sm font-bold text-rose-500">Sesi</span></h4>
                        <span class="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">Perlu Perhatian</span>
                    </div>
                </div>
            </div>

            <!-- MODUL INPUT PRESENSI LATIHAN (PRO SPORTS UI) -->
<div class="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-xl mb-6 relative overflow-hidden">
<!-- Header Modul & Segmented Toggle Switch -->
<div class="flex items-center justify-between flex-wrap gap-4 mb-6 pb-5 border-b border-slate-200/70">
<div>
    <div class="flex items-center gap-2">
        <span class="p-2 rounded-xl bg-blue-900/10 text-blue-900 font-black text-sm">
            <i class="fa-solid fa-pen-to-square"></i>
        </span>
        <h3 class="text-lg font-black text-slate-900 font-display">Modul Input Presensi Latihan</h3>
    </div>
    <p class="text-xs font-semibold text-slate-400 mt-1 pl-9">Catat kehadiran harian atlet per individu atau sekaligus seluruh skuad.</p>
</div>

<!-- Segmented Toggle Switch dengan Glow -->
<div class="bg-slate-200/60 p-1.5 rounded-2xl flex gap-1 border border-slate-300/60 shadow-inner">
    <button onclick="toggleAbsensiMode('single')" class="px-5 py-2.5 rounded-xl font-black text-xs transition-all duration-300 flex items-center gap-2 ${state.absensiInputMode === 'single' ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md shadow-blue-900/30' : 'text-slate-600 hover:text-slate-900'}">
        <i class="fa-solid fa-user text-xs"></i> Per Atlet
    </button>
    <button onclick="toggleAbsensiMode('bulk')" class="px-5 py-2.5 rounded-xl font-black text-xs transition-all duration-300 flex items-center gap-2 ${state.absensiInputMode === 'bulk' ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md shadow-blue-900/30' : 'text-slate-600 hover:text-slate-900'}">
        <i class="fa-solid fa-users text-xs"></i> Massal Skuad
    </button>
</div>
</div>

${state.absensiInputMode === 'single' ? `
<!-- FORM PER ATLET DENGAN IKON & FOCUS GLOW -->
<form onsubmit="submitAbsensiOptimistic(event)" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
    <!-- FIELD 1: PILIH ATLET -->
    <div class="space-y-1.5">
        <label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-user-check text-blue-900"></i> Pilih Atlet
        </label>
        <div class="relative">
            <select id="absensi-atlet-id" required class="w-full px-4 py-3.5 rounded-2xl border border-slate-200/90 text-sm font-extrabold bg-white/90 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer shadow-sm appearance-none">
                ${optionsAtlet}
            </select>
            <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
        </div>
    </div>

    <!-- FIELD 2: TANGGAL -->
    <div class="space-y-1.5">
        <label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-calendar-day text-blue-900"></i> Tanggal
        </label>
        <input type="date" id="absensi-tanggal" required value="${today}" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200/90 text-sm font-extrabold bg-white/90 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm">
    </div>

    <!-- FIELD 3: JENIS LATIHAN -->
    <div class="space-y-1.5">
        <label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-dumbbell text-blue-900"></i> Jenis Latihan
        </label>
        <div class="relative">
            <select id="absensi-jenis" required class="w-full px-4 py-3.5 rounded-2xl border border-slate-200/90 text-sm font-extrabold bg-white/90 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer shadow-sm appearance-none">
                <option value="Latihan Fisik">Latihan Fisik</option>
                <option value="Latihan Teknik">Latihan Teknik</option>
                <option value="Simulasi Match">Simulasi Match</option>
            </select>
            <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
        </div>
    </div>

    <!-- FIELD 4: STATUS PRESENSI -->
    <div class="space-y-1.5">
        <label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-circle-check text-emerald-600"></i> Status Presensi
        </label>
        <div class="relative">
            <select id="absensi-status" required class="w-full px-4 py-3.5 rounded-2xl border border-slate-200/90 text-sm font-extrabold bg-white/90 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer shadow-sm appearance-none">
                <option value="Hadir">Hadir</option>
                <option value="Telat">Telat</option>
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin</option>
                <option value="Alpa">Alpa</option>
            </select>
            <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
        </div>
    </div>

    <!-- FIELD 5: TOMBOL SUBMIT GLOW -->
    <div class="flex items-end">
        <button type="submit" class="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-900 text-white py-3.5 px-6 rounded-2xl font-black text-xs shadow-xl shadow-blue-900/30 hover:shadow-blue-900/50 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
            <i class="fa-solid fa-plus text-cyan-400 text-sm"></i> Simpan Presensi
        </button>
    </div>
</form>
` : `
<!-- FORM MASSAL SKUAD -->
<form onsubmit="submitBulkAbsensi(event)" class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-slate-200/70">
        <div class="space-y-1.5">
            <label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Tanggal Sesi</label>
            <input type="date" id="bulk-absensi-tanggal" required value="${today}" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200/90 text-sm font-extrabold bg-white focus:outline-none focus:border-blue-600 shadow-sm">
        </div>
        <div class="space-y-1.5">
            <label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Jenis Sesi Latihan</label>
            <select id="bulk-absensi-jenis" required class="w-full px-4 py-3.5 rounded-2xl border border-slate-200/90 text-sm font-extrabold bg-white focus:outline-none focus:border-blue-600 shadow-sm">
                <option value="Latihan Fisik">Latihan Fisik</option>
                <option value="Latihan Teknik">Latihan Teknik</option>
                <option value="Simulasi Match">Simulasi Match</option>
            </select>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        ${state.atlet.map(at => `
            <div class="p-4 bg-white/90 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-300 hover:shadow-md transition-all">
                <div>
                    <p class="font-black text-xs text-slate-900">${escapeHTML(at.nama)}</p>
                    <span class="text-[9px] bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md font-black mt-1 inline-block">${escapeHTML(at.posisi)}</span>
                </div>
                <select id="bulk-status-${at.id}" class="text-xs font-black p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600">
                    <option value="Hadir" selected>Hadir</option>
                    <option value="Telat">Telat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpa">Alpa</option>
                </select>
            </div>
        `).join('')}
    </div>

    <div class="flex justify-end pt-2">
        <button type="submit" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 px-8 rounded-2xl text-xs shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-2">
            <i class="fa-solid fa-floppy-disk text-sm"></i> Simpan Presensi Seluruh Skuad
        </button>
    </div>
</form>
`}
</div>

            <!-- TABEL REKAP PERSENTASE KEHADIRAN SKUAD (PRO UI) -->
<div class="lg:col-span-7 bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden flex flex-col justify-between">
<!-- Header Tabel & Tombol Ekspor -->
<div class="p-6 border-b border-slate-100/90 bg-slate-50/50 flex justify-between items-center gap-4 flex-wrap">
<div>
    <h4 class="font-black text-slate-900 text-sm font-display flex items-center gap-2">
        <i class="fa-solid fa-chart-pie text-blue-900"></i> Persentase Kehadiran Skuad
    </h4>
    <p class="text-xs font-semibold text-slate-400 mt-0.5">Rekapitulasi rasio kehadiran atlet dari seluruh sesi latihan.</p>
</div>
<button onclick="exportAbsensiCSV()" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/20 transition-all shrink-0 active:scale-95 flex items-center gap-2">
    <i class="fa-solid fa-file-excel text-sm"></i> Ekspor CSV
</button>
</div>

<!-- Tabel Data Atlet -->
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse min-w-[550px]">
    <thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
        <tr>
            <th class="py-4 px-5">Nama Atlet</th>
            <th class="py-4 px-3 text-center">Posisi</th>
            <th class="py-4 px-3 text-center">Total</th>
            <th class="py-4 px-3 text-center">Hadir</th>
            <th class="py-4 px-3 text-center">Alpa</th>
            <th class="py-4 px-5 text-center min-w-[140px]">Tingkat Kehadiran</th>
        </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 text-xs font-semibold">
        ${summaryPerAtlet.length > 0 ? summaryPerAtlet.map(at => {
            const inisial = at.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            
            // Dynamic Color Bar & Text based on Percentage
            let pctColor = 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50';
            let textColor = 'text-emerald-600';
            if (at.persentase < 60) { 
                pctColor = 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-sm shadow-rose-500/50'; 
                textColor = 'text-rose-600'; 
            } else if (at.persentase < 80) { 
                pctColor = 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-sm shadow-amber-400/50'; 
                textColor = 'text-amber-600'; 
            }

            // Posisi Color-Coding
            let posColor = 'bg-blue-50 text-blue-900 border-blue-200';
            if (at.posisi === 'GK') posColor = 'bg-amber-500/10 text-amber-800 border-amber-300/80';
            else if (at.posisi === 'C') posColor = 'bg-indigo-500/10 text-indigo-900 border-indigo-300/80';
            else if (['FL','FR'].includes(at.posisi)) posColor = 'bg-cyan-500/10 text-cyan-900 border-cyan-300/80';

            return `
            <tr class="hover:bg-blue-50/40 transition-colors group">
                <!-- NAMA ATLET & AVATAR -->
                <td class="py-3.5 px-5">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-900 via-indigo-800 to-cyan-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-900/20 shrink-0 font-display ring-2 ring-white">
                            ${inisial}
                        </div>
                        <div class="font-black text-slate-900 text-sm tracking-tight">${escapeHTML(at.nama)}</div>
                    </div>
                </td>

                <!-- POSISI -->
                <td class="py-3.5 px-3 text-center">
                    <span class="${posColor} font-black px-2.5 py-1 rounded-xl border text-[10px] inline-block min-w-[38px] shadow-sm">
                        ${escapeHTML(at.posisi)}
                    </span>
                </td>

                <!-- TOTAL SESI -->
                <td class="py-3.5 px-3 text-center font-mono font-black text-slate-700">
                    <span class="bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/80 inline-block">${at.total}</span>
                </td>

                <!-- HADIR -->
                <td class="py-3.5 px-3 text-center font-mono font-black text-emerald-700">
                    <span class="bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80 inline-block">${at.hadir}</span>
                </td>

                <!-- ALPA -->
                <td class="py-3.5 px-3 text-center font-mono font-black text-rose-600">
                    <span class="bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80 inline-block">${at.alpa}</span>
                </td>

                <!-- TINGKAT KEHADIRAN (PROGRESS BAR) -->
                <td class="py-3.5 px-5 text-center align-middle">
                    <div class="flex flex-col gap-1.5 items-center justify-center">
                        <span class="font-mono font-black text-xs ${textColor}">${at.persentase}%</span>
                        <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-200/60">
                            <div class="h-full rounded-full transition-all duration-500 ${pctColor}" style="width: ${at.persentase}%;"></div>
                        </div>
                    </div>
                </td>
            </tr>`;
        }).join('') : `
            <tr>
                <td colspan="6" class="p-8 text-center text-slate-400 italic font-semibold">Belum ada data rekap presensi.</td>
            </tr>
        `}
    </tbody>
</table>
</div>
</div>

                <!-- LOG PRESENSI TERAKHIR -->
                <div class="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-[32px] border border-slate-200/80 shadow-lg overflow-hidden flex flex-col h-[520px]">
                    <div class="p-5 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h4 class="font-black text-xs text-slate-900 flex items-center gap-2"><i class="fa-solid fa-clock-rotate-left text-blue-900"></i> Log Presensi Terakhir</h4>
                            <p class="text-[10px] font-semibold text-slate-400 mt-0.5">Catatan aktivitas masuk terdeteksi.</p>
                        </div>
                        <span class="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-[10px] font-black border border-blue-200">${state.absensi.length} Log</span>
                    </div>
                    <div class="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                        ${state.absensi.length > 0 ? state.absensi.map(ab => {
                            const pObj = state.atlet.find(a => String(a.id) === String(ab.atletId));
                            let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                            let icon = 'fa-check-circle text-emerald-500';
                            if (ab.status === 'Telat') { badgeColor = 'bg-amber-100 text-amber-800 border-amber-300'; icon = 'fa-clock text-amber-500'; }
                            if (ab.status === 'Izin' || ab.status === 'Sakit') { badgeColor = 'bg-blue-100 text-blue-800 border-blue-200'; icon = 'fa-bed-pulse text-blue-500'; }
                            if (ab.status === 'Alpa') { badgeColor = 'bg-rose-100 text-rose-800 border-rose-200'; icon = 'fa-triangle-exclamation text-rose-500'; }

                            return `
                                <div class="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs shadow-sm hover:border-blue-200 transition-all">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0"><i class="fa-solid ${icon} text-base"></i></div>
                                        <div>
                                            <span class="font-black text-slate-900 block">${pObj ? escapeHTML(pObj.nama) : 'Atlet'}</span>
                                            <div class="flex items-center gap-1.5 mt-0.5">
                                                <span class="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">${ab.tanggal}</span>
                                                <span class="text-[9px] text-slate-500 font-extrabold">${escapeHTML(ab.jenis)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="border px-3 py-1 rounded-xl text-[10px] font-black ${badgeColor}">${escapeHTML(ab.status)}</span>
                                        <button onclick="deleteAbsensiLog('${ab.id}')" class="w-8 h-8 flex items-center justify-center rounded-xl text-rose-400 hover:text-white hover:bg-rose-500 transition-all active:scale-90" title="Hapus Log"><i class="fa-solid fa-trash-can text-xs"></i></button>
                                    </div>
                                </div>
                            `;
                        }).join('') : `<p class="text-xs text-slate-400 text-center py-12 italic font-semibold">Belum ada riwayat presensi.</p>`}
                    </div>
                </div>
            </div>
        `;

    } else if (state.currentMenu === 'menu-3') {
        pageTitle.innerText = "Tes Kondisi Fisik & Teknik dengan Norma";
        const today = new Date().toISOString().split('T')[0];
        const optionsAtlet = state.atlet.map(a => `<option value="${a.id}">${escapeHTML(a.nama)} (${escapeHTML(a.posisi)} - ${escapeHTML(a.gender)})</option>`).join('');

        let countSB = 0, countB = 0, countS = 0, countK = 0, countSK = 0;
        state.tesFisik.forEach(t => {
            const at = state.atlet.find(a => String(a.id) === String(t.atletId));
            const kat = hitungKategoriNorma(t.keyTes, t.skor, at?.gender, at?.posisi);
            if (kat === 'SB') countSB++;
            else if (kat === 'B') countB++;
            else if (kat === 'S') countS++;
            else if (kat === 'K') countK++;
            else if (kat === 'SK') countSK++;
        });

        container.innerHTML = `
            <!-- 1. KPI & RADAR CHART -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                <div class="lg:col-span-5 bg-white/90 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/80 shadow-md flex flex-col justify-between hover:shadow-xl transition-all">
                    <div class="flex items-center justify-between mb-2 pb-3 border-b border-slate-100">
                        <h4 class="font-black text-slate-900 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
                            <i class="fa-solid fa-chart-radar text-blue-900 text-sm"></i> Radar Kebugaran Rerata Skuad
                        </h4>
                        <span class="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">6 Core Metrics</span>
                    </div>
                    <div class="h-60 w-full relative flex items-center justify-center p-2">
                        <canvas id="chart-radar-fisik"></canvas>
                    </div>
                </div>

                <div class="lg:col-span-7 bg-white/90 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/80 shadow-md flex flex-col justify-between hover:shadow-xl transition-all">
                    <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <h4 class="font-black text-slate-900 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
                            <i class="fa-solid fa-heart-pulse text-rose-500 text-sm"></i> Ringkasan Evaluasi Norma Skuad
                        </h4>
                        <span class="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            Total ${state.tesFisik.length} Hasil Tes
                        </span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                        <div class="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl">
                            <span class="text-[10px] font-black text-emerald-800 uppercase tracking-wider block mb-1">Sangat Baik (SB)</span>
                            <span class="text-2xl font-black text-emerald-950 font-display block">${countSB}</span>
                        </div>
                        <div class="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl">
                            <span class="text-[10px] font-black text-blue-800 uppercase tracking-wider block mb-1">Baik (B)</span>
                            <span class="text-2xl font-black text-blue-950 font-display block">${countB}</span>
                        </div>
                        <div class="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
                            <span class="text-[10px] font-black text-amber-800 uppercase tracking-wider block mb-1">Sedang (S)</span>
                            <span class="text-2xl font-black text-amber-950 font-display block">${countS}</span>
                        </div>
                        <div class="p-4 bg-orange-50/80 border border-orange-200/80 rounded-2xl">
                            <span class="text-[10px] font-black text-orange-800 uppercase tracking-wider block mb-1">Kurang (K)</span>
                            <span class="text-2xl font-black text-orange-950 font-display block">${countK}</span>
                        </div>
                        <div class="p-4 bg-rose-50/80 border border-rose-200/80 rounded-2xl">
                            <span class="text-[10px] font-black text-rose-800 uppercase tracking-wider block mb-1">Sangat Kurang (SK)</span>
                            <span class="text-2xl font-black text-rose-950 font-display block">${countSK}</span>
                        </div>
                        <div class="p-4 bg-slate-100/80 border border-slate-200/80 rounded-2xl">
                            <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Total Entri</span>
                            <span class="text-2xl font-black text-slate-800 font-display block">${state.tesFisik.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. FORM INPUT MULTI-TES FISIK (DITAMBAHKAN KEMBALI) -->
            <div class="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-xl mb-8">
                <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h3 class="text-base sm:text-lg font-black text-slate-900 font-display flex items-center gap-2">
                            <i class="fa-solid fa-file-pen text-blue-900"></i> Input Hasil Tes Kondisi Fisik Atlet
                        </h3>
                        <p class="text-xs font-semibold text-slate-400 mt-0.5">Pilih nama atlet dan masukkan hasil pengukuran 14 parameter fisik.</p>
                    </div>
                    <span class="bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-black px-3.5 py-1.5 rounded-xl">Form Entry</span>
                </div>

                <form onsubmit="submitMultiTesFisikOptimistic(event)" class="space-y-6">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
<div class="space-y-1.5">
<label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Pilih Atlet Skuad <span class="text-rose-500">*</span></label>
<select id="multi-tes-atlet-id" onchange="loadExistingTesFisikForm(this.value)" required class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold bg-white text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm">
    <option value="">-- Pilih Atlet --</option>
    ${optionsAtlet}
</select>
</div>
<div class="space-y-1.5">
<label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Tahap Tes <span class="text-rose-500">*</span></label>
<select id="multi-tes-tahap" required class="w-full px-4 py-3.5 rounded-2xl border border-blue-200 text-sm font-black bg-blue-50/50 text-blue-900 focus:outline-none focus:border-blue-600 shadow-sm">
    <option value="Pre">1. Pre-Test (Awal Siklus)</option>
    <option value="Mid">2. Mid-Test (Tengah Siklus)</option>
    <option value="Post">3. Post-Test (Akhir / Pra-Kompetisi)</option>
</select>
</div>
<div class="space-y-1.5">
<label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Tanggal Pengambilan Tes <span class="text-rose-500">*</span></label>
<input type="date" id="multi-tes-tanggal" required value="${today}" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold bg-white focus:outline-none focus:border-blue-600 shadow-sm">
</div>
</div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${listFieldTes.map(f => `
                            <div class="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1.5">
                                <label class="block text-[10px] font-black text-slate-600 uppercase truncate" title="${escapeHTML(f.label)}">${escapeHTML(f.label)}</label>
                                <div class="flex items-center gap-2">
                                    <input type="number" step="0.01" id="field-${f.key}" placeholder="Skor" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 bg-white focus:outline-none focus:border-blue-600">
                                    <span class="text-[10px] font-bold text-slate-400 shrink-0 w-10">${f.satuan}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex justify-end pt-2">
                        <button type="submit" class="bg-blue-900 hover:bg-blue-950 text-white font-black px-8 py-3.5 rounded-2xl text-xs shadow-xl shadow-blue-900/30 active:scale-95 transition-all flex items-center gap-2">
                            <i class="fa-solid fa-floppy-disk text-cyan-400"></i> Simpan Hasil Tes Fisik
                        </button>
                    </div>
                </form>
            </div>

            <!-- 3. MATRIKS HEAT MAP KONDISI FISIK SKUAD -->
            <div class="bg-white/90 backdrop-blur-xl rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden mb-8">
                <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-2">
                    <div>
                        <h4 class="font-black text-slate-900 text-sm font-display flex items-center gap-2">
                            <i class="fa-solid fa-table-cells text-blue-900"></i> Matriks Heat Map Kondisi Fisik Skuad
                        </h4>
                        <p class="text-xs font-semibold text-slate-400 mt-0.5">Pemetaan norma kebugaran fisik seluruh pemain skuad secara real-time.</p>
                    </div>
                    <span class="bg-blue-50 text-blue-900 border border-blue-200 font-black px-3.5 py-1.5 rounded-xl text-xs shadow-sm">
                        14 Parameter Fisik
                    </span>
                </div>
                <!-- TOMBOL FILTER TAHAP -->
<div class="flex items-center gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-300/60 mb-4 w-fit">
<button type="button" onclick="setFilterTahapFisik('Pre')" 
class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${(!state.filterTahapFisik || state.filterTahapFisik === 'Pre') ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
1. Pre-Test
</button>
<button type="button" onclick="setFilterTahapFisik('Mid')" 
class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${state.filterTahapFisik === 'Mid' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
2. Mid-Test
</button>
<button type="button" onclick="setFilterTahapFisik('Post')" 
class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${state.filterTahapFisik === 'Post' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
3. Post-Test
</button>
<button type="button" onclick="setFilterTahapFisik('Semua')" 
class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${state.filterTahapFisik === 'Semua' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
Semua Tahap
</button>
</div>

<div class="overflow-x-auto relative">
<table class="w-full text-left border-collapse min-w-[1200px]">
<thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
    <tr>
        <th class="p-4 sticky left-0 bg-slate-950 z-20 border-r border-slate-800 min-w-[160px]">Profil Atlet</th>
        <th class="p-3 border-r border-slate-800 text-center w-20">Tahap</th>
        <th class="p-4 border-r border-slate-800 text-center">Tgl Tes</th>
        ${listFieldTes.map(f => `<th class="p-3 text-center border-r border-slate-800 min-w-[70px]">${escapeHTML(f.shortLabel)}</th>`).join('')}
    </tr>
</thead>
<tbody class="divide-y divide-slate-100 text-xs font-semibold">
${state.atlet.map(at => {
const allRecords = state.tesFisik.filter(t => String(t.atletId || '').trim().toLowerCase() === String(at.id || '').trim().toLowerCase());
const targetTahap = state.filterTahapFisik || 'Pre';
const tahapList = targetTahap === 'Semua' ? ['Pre', 'Mid', 'Post'] : [targetTahap];

return tahapList.map(tahapAktif => {
const recordsTahap = allRecords.filter(t => (t.tahap || 'Pre') === tahapAktif);
const lastDate = recordsTahap.length > 0 ? recordsTahap[0].tanggal : '-';

if (targetTahap === 'Semua' && recordsTahap.length === 0) return '';

let badgeTahap = 'bg-purple-100 text-purple-800 border-purple-200';
if (tahapAktif === 'Pre') badgeTahap = 'bg-sky-100 text-sky-800 border-sky-200';
else if (tahapAktif === 'Mid') badgeTahap = 'bg-amber-100 text-amber-800 border-amber-200';

const barisSkor = listFieldTes.map(f => {
    const item = recordsTahap.find(t => t.keyTes === f.key);
    if (!item) {
        return '<td class="p-2 text-center border-r align-middle"><div class="py-2 bg-slate-50 border rounded-xl text-slate-300 font-black text-xs">-</div></td>';
    }

    const kat = hitungKategoriNorma(f.key, item.skor, at.gender, at.posisi);
    let pillColor = 'bg-slate-100 text-slate-400 border-slate-200';
    if (kat === 'SB') pillColor = 'bg-emerald-500 text-white border-emerald-600';
    else if (kat === 'B') pillColor = 'bg-blue-500 text-white border-blue-600';
    else if (kat === 'S') pillColor = 'bg-amber-400 text-amber-950 border-amber-500';
    else if (kat === 'K') pillColor = 'bg-orange-500 text-white border-orange-600';
    else if (kat === 'SK') pillColor = 'bg-rose-500 text-white border-rose-600';

    return '<td class="p-2 text-center border-r align-middle">' +
        '<div class="flex flex-col items-center justify-center py-2 px-1 rounded-xl border ' + pillColor + ' w-full shadow-xs">' +
            '<span class="font-mono font-black text-xs leading-none">' + item.skor + '</span>' +
            '<div class="flex items-center gap-1 mt-1">' +
                '<span class="text-[8px] font-extrabold uppercase">' + kat + '</span>' +
                '<span class="text-[7px] font-mono px-1 rounded bg-black/25 text-white font-bold">' + (item.tahap || 'Pre') + '</span>' +
            '</div>' +
        '</div>' +
    '</td>';
}).join('');

return '<tr class="hover:bg-blue-50/40 transition-colors">' +
    '<td class="p-3 font-black text-slate-800 sticky left-0 bg-white border-r z-10">' +
        '<div class="truncate max-w-[120px]">' + escapeHTML(at.nama) + '</div>' +
        '<span class="text-[9px] bg-blue-50 text-blue-900 border px-2 py-0.5 rounded-md mt-0.5 inline-block">' + escapeHTML(at.posisi) + '</span>' +
    '</td>' +
    '<td class="p-2.5 font-bold border-r text-center align-middle">' +
        '<span class="px-2 py-1 rounded-lg text-[10px] font-black font-mono ' + badgeTahap + '">' +
            tahapAktif +
        '</span>' +
    '</td>' +
    '<td class="p-3 font-mono border-r text-slate-400 text-[10px] text-center align-middle">' + lastDate + '</td>' +
    barisSkor +
'</tr>';
}).join('');
}).join('')}
</tbody>
                    </table>
                </div>
            </div>

            <!-- 4. FORM INPUT TES TEKNIK (DUAL GATE & SLALOM SHOOTING) -->
            <div class="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-xl mb-8">
                <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h3 class="text-base sm:text-lg font-black text-slate-900 font-display flex items-center gap-2">
                            <i class="fa-solid fa-bullseye text-blue-900"></i> Tes Keterampilan Teknik (Dual-Gate & Slalom Shoot)
                        </h3>
                        <p class="text-xs font-semibold text-slate-400 mt-0.5">Catat akurasi passing-receiving dan kecepatan dribble slalom shoot.</p>
                    </div>
                    <span class="bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-black px-3.5 py-1.5 rounded-xl">Skill Assessment</span>
                </div>

                <form onsubmit="submitTesTeknikOptimistic(event)" class="space-y-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                        <div class="space-y-1.5">
                            <label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Pilih Atlet <span class="text-rose-500">*</span></label>
                            <select id="teknik-atlet-id" required class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold bg-white text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm">
                                <option value="">-- Pilih Atlet --</option>
                                ${optionsAtlet}
                            </select>
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Tanggal Sesi <span class="text-rose-500">*</span></label>
                            <input type="date" id="teknik-tanggal" required value="${today}" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold bg-white focus:outline-none focus:border-blue-600 shadow-sm">
                        </div>
                    </div>

                    <!-- DUAL GATE DRILL -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="p-5 bg-blue-50/60 rounded-3xl border border-blue-200/80 space-y-3">
                            <h5 class="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fa-solid fa-arrows-left-right-to-line text-blue-700"></i> Dual-Gate Passing Sesi 1
                            </h5>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 mb-1">Total Rep (Akurasi)</label>
                                    <input type="number" id="dual-rep-1" placeholder="Contoh: 12" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 mb-1">Waktu (detik)</label>
                                    <input type="number" step="0.01" id="dual-waktu-1" placeholder="Contoh: 30" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white">
                                </div>
                            </div>
                        </div>

                        <div class="p-5 bg-blue-50/60 rounded-3xl border border-blue-200/80 space-y-3">
                            <h5 class="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fa-solid fa-arrows-left-right-to-line text-blue-700"></i> Dual-Gate Passing Sesi 2
                            </h5>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 mb-1">Total Rep (Akurasi)</label>
                                    <input type="number" id="dual-rep-2" placeholder="Contoh: 15" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 mb-1">Waktu (detik)</label>
                                    <input type="number" step="0.01" id="dual-waktu-2" placeholder="Contoh: 30" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SLALOM DRILL 5M, 7M, 9M -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                            <span class="text-[11px] font-black text-slate-800 uppercase block">Slalom Shoot 5M</span>
                            <input type="number" step="0.01" id="slalom-5m-waktu" placeholder="Waktu (detik)" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white">
                        </div>
                        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                            <span class="text-[11px] font-black text-slate-800 uppercase block">Slalom Shoot 7M</span>
                            <input type="number" step="0.01" id="slalom-7m-waktu" placeholder="Waktu (detik)" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white">
                        </div>
                        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                            <span class="text-[11px] font-black text-slate-800 uppercase block">Slalom Shoot 9M</span>
                            <input type="number" step="0.01" id="slalom-9m-waktu" placeholder="Waktu (detik)" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white">
                        </div>
                    </div>

                    <div class="flex justify-end pt-2">
                        <button type="submit" class="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-900 text-white font-black px-8 py-3.5 rounded-2xl text-xs shadow-xl active:scale-95 transition-all flex items-center gap-2">
                            <i class="fa-solid fa-floppy-disk text-cyan-400"></i> Simpan Hasil Tes Teknik
                        </button>
                    </div>
                </form>
            </div>

            <!-- 5. HISTORI TES TEKNIK TERSIMPAN -->
            <div class="bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden">
                <div class="p-5 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                    <h4 class="font-black text-xs text-slate-800 font-display flex items-center gap-2">
                        <i class="fa-solid fa-clock-rotate-left text-blue-900"></i> Histori Catatan Tes Teknik Skuad
                    </h4>
                    <span class="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black">${state.tesTeknik.length} Log</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[650px]">
                        <thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
                            <tr>
                                <th class="p-3.5">Tanggal</th>
                                <th class="p-3.5">Nama Atlet</th>
                                <th class="p-3.5 text-center">Dual-Gate (S1 / S2)</th>
                                <th class="p-3.5 text-center">Slalom (5m / 7m / 9m)</th>
                                <th class="p-3.5 text-center w-16">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs font-semibold">
                            ${state.tesTeknik.length > 0 ? state.tesTeknik.map(tk => {
                                const pObj = state.atlet.find(a => String(a.id) === String(tk.atletId));
                                return `
                                    <tr class="hover:bg-blue-50/40 transition-colors">
                                        <td class="p-3.5 font-mono font-bold text-slate-500">${tk.tanggal || '-'}</td>
                                        <td class="p-3.5 font-black text-slate-800">${pObj ? escapeHTML(pObj.nama) : 'Atlet'}</td>
                                        <td class="p-3.5 text-center font-mono font-black text-blue-900">
                                        ${tk.dualGate?.sesi1?.rep || 0} rep (${tk.dualGate?.sesi1?.waktu || 0}s) / ${tk.dualGate?.sesi2?.rep || 0} rep (${tk.dualGate?.sesi2?.waktu || 0}s)
                                    </td>
                                        <td class="p-3.5 text-center font-mono font-black text-emerald-700">
                                        ${tk.slalomShoot?.s5m?.waktu || 0}s / ${tk.slalomShoot?.s7m?.waktu || 0}s / ${tk.slalomShoot?.s9m?.waktu || 0}s
                                        </td>
                                        <td class="p-3.5 text-center">
                                            <button onclick="deleteTesTeknikLog('${tk.id}')" class="text-rose-500 bg-rose-50 w-7 h-7 inline-flex items-center justify-center hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm border border-rose-100" title="Hapus Log">
                                                <i class="fa-solid fa-trash-can text-xs"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr><td colspan="5" class="p-8 text-center text-slate-400 italic">Belum ada riwayat tes teknik tersimpan.</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
    } else if (state.currentMenu === 'menu-4') {
pageTitle.innerText = "Periodisasi Latihan & Makrosiklus (Bompa Model)";
const dynamicList = generateDynamicPeriodisasi(state.periodisasiConfig.startDate, state.periodisasiConfig.totalWeeks);

// Hitung ringkasan statistik makrosiklus saat ini
const totalW = state.periodisasiConfig.totalWeeks || 12;
const currentW = Math.min(totalW, 1); // Minggu berjalan
const progressPct = Math.round((currentW / totalW) * 100);

container.innerHTML = `
<!-- 1. KARTU STATISTIK/KPI MAKROSIKLUS -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
    <div class="bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-800 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-calendar-days"></i>
        </div>
        <div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Durasi Makro</p>
            <h4 class="text-2xl font-black text-slate-900 font-display">${totalW} <span class="text-xs font-bold text-slate-500">Minggu</span></h4>
            <span class="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">Siklus Latihan</span>
        </div>
    </div>

    <div class="bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-arrows-spin"></i>
        </div>
        <div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Progres Siklus</p>
            <h4 class="text-2xl font-black text-slate-900 font-display">${progressPct}%</h4>
            <span class="text-[10px] font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">Berjalan (W-${currentW})</span>
        </div>
    </div>

    <div class="bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-layer-group"></i>
        </div>
        <div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Fase Dominan</p>
            <h4 class="text-base font-black text-slate-900 font-display truncate max-w-[120px]" title="${dynamicList[0]?.fase || 'TPU'}">${dynamicList[0]?.fase || 'TPU'}</h4>
            <span class="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">Persiapan Awal</span>
        </div>
    </div>

    <div class="bg-white/90 backdrop-blur-md p-6 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-heart-circle-bolt"></i>
        </div>
        <div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Target HR Maksimal</p>
            <h4 class="text-xl font-black text-slate-900 font-display">130-150 <span class="text-xs font-bold text-rose-500">BPM</span></h4>
            <span class="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">Zona Aerobik</span>
        </div>
    </div>
</div>

<!-- 2. GRAFIK KURVA PERIODISASI BOMPA MODERN -->
<div class="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-lg mb-6 relative overflow-hidden">
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100/80 flex-wrap gap-3">
        <div>
            <div class="flex items-center gap-2">
                <span class="p-2 rounded-xl bg-blue-900/10 text-blue-900 font-black text-sm">
                    <i class="fa-solid fa-chart-area"></i>
                </span>
                <h4 class="font-black text-slate-900 text-base font-display">Kurva Dynamic Periodization (Bompa Model)</h4>
            </div>
            <p class="text-xs font-semibold text-slate-400 mt-1 pl-9">Fluktuasi rasio Volume vs Intensitas selama siklus pelatihan.</p>
        </div>
        <div class="flex items-center gap-4 text-xs font-black">
            <div class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-md bg-blue-500 shadow-sm shadow-blue-500/50"></span> Volume (%)</div>
            <div class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-sm shadow-rose-500/50"></span> Intensitas (%)</div>
        </div>
    </div>
    
    <div class="h-72 w-full relative">
        <canvas id="chart-periodisasi-bompa"></canvas>
    </div>
</div>

<!-- 3. PANEL KONTROL KONFIGURASI SIKLUS (FLOATING GLASS CARD) -->
<div class="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-xl p-6 rounded-[28px] border border-slate-200/80 shadow-md mb-8">
    <form onsubmit="updatePeriodisasiConfig(event)" class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
        <div class="sm:col-span-5 space-y-1.5">
            <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-calendar-day text-blue-900"></i> Tanggal Mulai Latihan <span class="text-rose-500">*</span>
            </label>
            <input type="date" id="periodisasi-start-date" required value="${state.periodisasiConfig.startDate}" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm">
        </div>

        <div class="sm:col-span-4 space-y-1.5">
            <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-hourglass-half text-blue-900"></i> Durasi Siklus (Minggu) <span class="text-rose-500">*</span>
            </label>
            <input type="number" min="1" max="52" id="periodisasi-total-weeks" required value="${state.periodisasiConfig.totalWeeks}" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm">
        </div>

        <div class="sm:col-span-3">
            <button type="submit" class="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-900 text-white font-black py-3.5 px-6 rounded-2xl text-xs shadow-xl shadow-blue-900/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                <i class="fa-solid fa-arrows-rotate text-cyan-400"></i> Update Siklus
            </button>
        </div>
    </form>
</div>

<!-- 4. TABEL MATRIKS MAKROSIKLUS LATIHAN -->
<div class="bg-white/90 backdrop-blur-xl rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden">
    <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-3">
        <div>
            <h3 class="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <i class="fa-solid fa-table-list text-blue-900"></i> Matriks Makrosiklus & Mikrosiklus Latihan
            </h3>
            <p class="text-xs font-semibold text-slate-400 mt-0.5">Rincian parameter beban latihan mingguan untuk seluruh skuad.</p>
        </div>
        <span class="bg-blue-50 text-blue-900 border border-blue-200 font-black px-3.5 py-1.5 rounded-xl text-xs shadow-sm">
            ${dynamicList.length} Mikrosiklus Terjadwal
        </span>
    </div>

    <div class="overflow-x-auto">
<table class="w-full text-left border-collapse min-w-[1100px]">
<thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
    <tr>
        <th class="py-4 px-3 text-center w-16">Mikro</th>
        <th class="py-4 px-4 w-36">Rentang Tanggal</th>
        <th class="py-4 px-4 w-60">Fase & Subfase (Bompa)</th>
        <th class="py-4 px-4 min-w-[320px]">Rincian Program (Fisik, Teknik, Taktik)</th>
        <th class="py-4 px-4 w-40">Volume</th>
        <th class="py-4 px-4 w-40">Intensitas</th>
        <th class="py-4 px-3 text-center w-28">Target HR</th>
    </tr>
</thead>
<tbody class="divide-y divide-slate-100 text-xs font-semibold">
    ${dynamicList.map((p) => `
        <tr class="hover:bg-blue-50/40 transition-colors group align-top">
            <td class="py-4 px-3 text-center">
                <div class="bg-slate-100 group-hover:bg-blue-900 group-hover:text-white text-slate-800 font-black font-mono w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200/80 mx-auto shadow-sm transition-all text-xs">
                    W${p.mingguKe}
                </div>
            </td>
            <td class="py-4 px-4 font-mono text-slate-600 font-bold text-[11px] whitespace-nowrap">
                <i class="fa-regular fa-calendar text-slate-400 mr-1.5"></i>${p.rentangTanggal}
            </td>
            <td class="py-4 px-4">
                <div class="flex flex-col gap-1 items-start">
                    <span class="${p.badgeBg} border px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                        ${p.faseBadge}
                    </span>
                    <span class="text-xs font-extrabold text-slate-800 leading-tight">
                        ${p.subFase}
                    </span>
                    <span class="text-[10px] font-bold text-slate-400">
                        ${p.faseUtama}
                    </span>
                </div>
            </td>
            <td class="py-4 px-4 space-y-2 text-[11px]">
                <div class="flex items-start gap-1.5">
                    <span class="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[9px] font-black shrink-0">FISIK</span>
                    <span class="text-slate-600 leading-snug">${p.fokusFisik}</span>
                </div>
                <div class="flex items-start gap-1.5">
                    <span class="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded text-[9px] font-black shrink-0">TEKNIK</span>
                    <span class="text-slate-600 leading-snug">${p.fokusTeknik}</span>
                </div>
                <div class="flex items-start gap-1.5">
                    <span class="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-black shrink-0">TAKTIK</span>
                    <span class="text-slate-600 leading-snug">${p.fokusTaktik}</span>
                </div>
            </td>
            <td class="py-4 px-4 align-middle">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-black text-[9px] uppercase text-slate-400">${p.volumeLabel}</span>
                    <span class="text-[10px] font-mono font-black text-blue-700">${p.volumePct}%</span>
                </div>
                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                    <div class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" style="width: ${p.volumePct}%"></div>
                </div>
            </td>
            <td class="py-4 px-4 align-middle">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-black text-[9px] uppercase text-slate-400">${p.intensitasLabel}</span>
                    <span class="text-[10px] font-mono font-black text-rose-600">${p.intensitasPct}%</span>
                </div>
                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                    <div class="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style="width: ${p.intensitasPct}%"></div>
                </div>
            </td>
            <td class="py-4 px-3 text-center align-middle">
                <span class="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-xl font-mono font-black text-[10px] inline-block shadow-sm whitespace-nowrap">
                    ${p.hrTarget}
                </span>
            </td>
        </tr>
    `).join('')}
</tbody>
</table>
</div>
</div>
`;
    } else if (state.currentMenu === 'menu-5') {
pageTitle.innerText = "Program Latihan Individual Atlet (Bompa Model)";
if (!state.selectedProgramAtlet && state.atlet.length > 0) state.selectedProgramAtlet = String(state.atlet[0].id);
const optionsAtlet = state.atlet.map(a => `<option value="${a.id}" ${String(a.id) === String(state.selectedProgramAtlet) ? 'selected' : ''}>${escapeHTML(a.nama)} (${escapeHTML(a.posisi)})</option>`).join('');
const listMikro = generateDynamicPeriodisasi(state.periodisasiConfig.startDate, state.periodisasiConfig.totalWeeks);
const optionsMikro = listMikro.map(m => `<option value="${m.mingguKe}" ${m.mingguKe == state.selectedProgramWeek ? 'selected' : ''}>Mikrosiklus W-${m.mingguKe} : ${escapeHTML(m.fase)}</option>`).join('');

container.innerHTML = `
<!-- 1. GRAFIK RPE MINGGUAN (PRO GLASS CARD) -->
<div class="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/80 shadow-lg mb-6 no-print">
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h4 class="font-black text-slate-900 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
            <i class="fa-solid fa-chart-column text-amber-500 text-sm"></i> Distribusi Target Intensitas RPE Mingguan
        </h4>
        <span class="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Borg Scale (1-10)
        </span>
    </div>
    <div class="h-48 w-full relative">
        <canvas id="chart-program-rpe"></canvas>
    </div>
</div>

<!-- 2. PANEL FILTER SELECTOR & AKSI (MODERN FLOATING CARD) -->
<div class="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-xl p-6 rounded-[28px] border border-slate-200/80 shadow-md mb-6 no-print">
    <div class="flex flex-col md:flex-row items-end justify-between gap-4">
        <div class="w-full md:w-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- FILTER 1: PILIH ATLET -->
            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-user-gear text-blue-900"></i> Target Atlet Skuad
                </label>
                <div class="relative">
                    <select id="prog-atlet" onchange="changeProgramAtlet(this.value)" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer shadow-sm appearance-none">
                        ${optionsAtlet}
                    </select>
                    <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                </div>
            </div>

            <!-- FILTER 2: PILIH MIKROSIKLUS -->
            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-calendar-week text-blue-900"></i> Fase Mikrosiklus
                </label>
                <div class="relative">
                    <select id="prog-mikro" onchange="changeProgramWeek(this.value)" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer shadow-sm appearance-none">
                        ${optionsMikro}
                    </select>
                    <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                </div>
            </div>
        </div>

        <!-- TOMBOL PRINT LAPORAN -->
        <div class="w-full md:w-auto shrink-0">
            <button onclick="window.print()" class="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-3.5 px-6 rounded-2xl text-xs shadow-xl shadow-amber-500/25 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                <i class="fa-solid fa-file-pdf text-sm"></i> Cetak Preskripsi PDF
            </button>
        </div>
    </div>
</div>

<!-- 3. AREA HASIL PRESKRIPSI PROGRAM INDIVIDUAL -->
<div id="program-result-area"></div>
`;

updateProgramLatihanUI();

    } else if (state.currentMenu === 'menu-6') {
        pageTitle.innerText = "Analisis Match Live Interaktif";
        renderMatchLiveUI();

    } else if (state.currentMenu === 'menu-7') {
pageTitle.innerText = "Monitoring Jogging & Sesi Interval MAS";
const today = new Date().toISOString().split('T')[0];
const optionsAtlet = state.atlet.map(a => `<option value="${a.id}">${escapeHTML(a.nama)} (${escapeHTML(a.posisi)})</option>`).join('');

container.innerHTML = `
<!-- 1. GRID CHART & RINGKASAN AKUMULASI AEROBIK -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
    <!-- GRAFIK MONITORING VOLUME & PACE -->
    <div class="lg:col-span-7 bg-white/95 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/80 shadow-md flex flex-col justify-between hover:shadow-xl transition-all">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h4 class="font-black text-slate-900 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
                <i class="fa-solid fa-person-running text-blue-900 text-sm"></i> Monitoring Volume & Pace Jogging Skuad
            </h4>
            <span class="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-sm">Volume Trend</span>
        </div>
        <div class="h-56 w-full relative">
            <canvas id="chart-jogging-mas"></canvas>
        </div>
    </div>

    <!-- AKUMULASI SESI AEROBIK -->
    <div class="lg:col-span-5 bg-white/95 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/80 shadow-md flex flex-col justify-between hover:shadow-xl transition-all">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h4 class="font-black text-slate-900 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
                <i class="fa-solid fa-stopwatch text-blue-900 text-sm"></i> Akumulasi Sesi Aerobik Skuad
            </h4>
            <span class="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Statistik</span>
        </div>
        
        <div class="grid grid-cols-2 gap-3.5 mb-3">
            <div class="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl shadow-sm hover:scale-[1.02] transition-transform">
                <span class="block text-[10px] font-black text-blue-800 uppercase tracking-wider mb-0.5">Total Distansi</span>
                <span class="text-xl font-black text-blue-950 font-mono">
                    ${(state.joggingLogs ? state.joggingLogs.reduce((acc, j) => acc + (parseFloat(j.jarak) || 0), 0) : 0).toFixed(1)} <span class="text-xs font-extrabold text-blue-700">KM</span>
                </span>
            </div>
            <div class="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl shadow-sm hover:scale-[1.02] transition-transform">
                <span class="block text-[10px] font-black text-emerald-800 uppercase tracking-wider mb-0.5">Total Durasi</span>
                <span class="text-xl font-black text-emerald-950 font-mono">
                    ${state.joggingLogs ? state.joggingLogs.reduce((acc, j) => acc + (parseInt(j.waktu) || 0), 0) : 0} <span class="text-xs font-extrabold text-emerald-700">Mnt</span>
                </span>
            </div>
            <div class="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl shadow-sm hover:scale-[1.02] transition-transform">
                <span class="block text-[10px] font-black text-amber-800 uppercase tracking-wider mb-0.5">Sesi MAS Logged</span>
                <span class="text-xl font-black text-amber-950 font-mono">
                    ${state.masLogs ? state.masLogs.length : 0} <span class="text-xs font-extrabold text-amber-700">Sesi</span>
                </span>
            </div>
            <div class="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl shadow-sm hover:scale-[1.02] transition-transform">
                <span class="block text-[10px] font-black text-purple-800 uppercase tracking-wider mb-0.5">Log Jogging</span>
                <span class="text-xl font-black text-purple-950 font-mono">
                    ${state.joggingLogs ? state.joggingLogs.length : 0} <span class="text-xs font-extrabold text-purple-700">Input</span>
                </span>
            </div>
        </div>

        <div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs shadow-inner">
            <span class="font-extrabold text-slate-500 text-[10px] uppercase tracking-wider">Rerata Pace Jogging:</span>
            <span class="font-mono font-black text-slate-900 text-sm">
                ${state.joggingLogs && state.joggingLogs.length > 0 
                    ? (state.joggingLogs.reduce((acc, j) => acc + (parseFloat(j.waktu) / (parseFloat(j.jarak) || 1)), 0) / state.joggingLogs.length).toFixed(2) 
                    : '0.00'} <span class="text-xs text-slate-500 font-bold">Min/Km</span>
            </span>
        </div>
    </div>
</div>

<!-- 2. FORM CATAT SESI LATIHAN JOGGING (NEW MODERN UI) -->
<div class="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-xl mb-6">
    <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-blue-900/10 text-blue-900 font-black text-sm">
                <i class="fa-solid fa-person-running"></i>
            </span>
            <h3 class="text-lg font-black text-slate-900 font-display">Catat Sesi Latihan Jogging</h3>
        </div>
        <span class="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-sm">Aerobic Base</span>
    </div>

    <form onsubmit="submitJoggingLog(event)" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <!-- PILIH ATLET -->
            <div class="sm:col-span-2 space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    Pilih Atlet <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                    <select id="jogging-atlet-id" onchange="autoFillJoggingVO2(this.value)" required class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer shadow-sm appearance-none">
<option value="semua">-- SEMUA ATLET (${state.atlet.length} ATLET) --</option>
${optionsAtlet}
</select>
                    <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                </div>
            </div>

            <!-- VO2MAX BASELINE -->
            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider">VO2Max Baseline</label>
                <input type="text" id="jogging-vo2-display" readonly placeholder="Otomatis" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-mono font-black bg-slate-100/80 text-slate-700 shadow-inner">
            </div>

            <!-- ZONA LATIHAN -->
            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    Zona Latihan <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                    <select id="jogging-zona" onchange="autoFillJoggingVO2(document.getElementById('jogging-atlet-id').value)" required class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-xs font-extrabold bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer shadow-sm appearance-none">
                        <option value="0.60">Zone 1 (60% MAS)</option>
                        <option value="0.75" selected>Zone 2: Aerobic Base (75% MAS)</option>
                        <option value="0.80">Zone 3 (80% MAS)</option>
                        <option value="0.90">Zone 4 (90% MAS)</option>
                        <option value="1.00">Zone 5 (100% MAS)</option>
                    </select>
                    <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                </div>
            </div>

            <!-- TANGGAL -->
            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    Tanggal <span class="text-rose-500">*</span>
                </label>
                <input type="date" id="jogging-tanggal" required value="${today}" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm">
            </div>

            <!-- WAKTU (MENIT) -->
            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    Waktu (Menit) <span class="text-rose-500">*</span>
                </label>
                <input type="number" step="1" id="jogging-waktu" oninput="calculateRealtimePace()" required value="30" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-black text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm">
            </div>

            <!-- PACE REALTIME -->
            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider">Pace Realtime</label>
                <input type="text" id="jogging-pace-display" readonly placeholder="Pace Min/Km" class="w-full px-4 py-3.5 rounded-2xl border border-blue-200/90 text-sm font-mono bg-blue-50/70 text-blue-950 font-black shadow-inner">
            </div>

            <!-- JARAK LATIHAN (KM) -->
            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    Jarak Latihan (KM) <span class="text-rose-500">*</span>
                </label>
                <input type="number" step="0.01" id="jogging-jarak" oninput="calculateRealtimePace()" required placeholder="Jarak (km)" class="w-full px-4 py-3.5 rounded-2xl border border-emerald-200/90 text-sm font-black bg-emerald-50/70 text-emerald-950 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm">
            </div>
        </div>

        <!-- SUBMIT BUTTON -->
<div class="flex justify-end pt-2">
<button type="button" onclick="generateJoggingSkuad(event)" class="w-full sm:w-auto bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
<i class="fa-solid fa-plus text-cyan-400"></i> Simpan Sesi Jogging
</button>
</div>
</form>
</div>

<!-- 3. FORM PRESKRIPSI & RECORD INTERVAL MAS INDIVIDUAL -->
<div class="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-xl mb-8">
    <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-purple-900/10 text-purple-900 font-black text-sm">
                <i class="fa-solid fa-gauge-high"></i>
            </span>
            <h3 class="text-lg font-black text-slate-900 font-display">Preskripsi & Record Interval MAS Individual</h3>
        </div>
        <span class="text-[10px] font-extrabold text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">Max Aerobic Speed</span>
    </div>

    <form onsubmit="submitMASLog(event)" class="space-y-6">
        <!-- PILIH ATLET, VO2MAX, TANGGAL & REPETISI -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider">Pilih Atlet <span class="text-rose-500">*</span></label>
                <div class="relative">
                    <select id="mas-atlet-id" onchange="autoFillMASVO2(this.value)" required class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-800 bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all cursor-pointer shadow-sm appearance-none">
                        ${optionsAtlet}
                    </select>
                    <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                </div>
            </div>

            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider">VO2Max Baseline</label>
                <input type="text" id="mas-vo2-display" readonly placeholder="Otomatis" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-mono font-black bg-slate-100 text-slate-700 shadow-inner">
            </div>

            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider">Tanggal <span class="text-rose-500">*</span></label>
                <input type="date" id="mas-tanggal" required value="${today}" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-800 bg-white focus:outline-none focus:border-purple-600 shadow-sm">
            </div>

            <div class="space-y-1.5">
                <label class="block text-[11px] font-black uppercase text-slate-500 tracking-wider">Total Repetisi (Set) <span class="text-rose-500">*</span></label>
                <input type="number" id="mas-rep" required value="10" class="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-black text-slate-800 bg-white focus:outline-none focus:border-purple-600 shadow-sm">
            </div>
        </div>

        <!-- CARDS INTERVAL MAS WORK/REST -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- SPRINT (WORK) -->
            <div class="p-5 bg-rose-50/70 border border-rose-200/80 rounded-3xl space-y-3 shadow-sm hover:border-rose-300 transition-all">
                <div class="flex justify-between items-center border-b border-rose-200/70 pb-2.5">
                    <span class="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-bolt text-rose-500"></i> Sprint (Work)
                    </span>
                    <input type="text" id="mas-sprint-dist-display" readonly placeholder="0 Meter" class="w-24 text-right font-mono font-black text-xs text-rose-800 bg-transparent focus:outline-none">
                </div>
                <div class="flex items-center gap-2">
                    <input type="number" id="mas-sprint-sec" oninput="calculateMASDistances()" required value="15" min="1" class="w-full px-4 py-3 rounded-2xl border border-rose-200 text-sm font-black text-slate-800 bg-white focus:outline-none focus:border-rose-500 shadow-sm">
                    <span class="text-xs font-black text-rose-600">Detik</span>
                </div>
            </div>

            <!-- JOGGING -->
            <div class="p-5 bg-blue-50/70 border border-blue-200/80 rounded-3xl space-y-3 shadow-sm hover:border-blue-300 transition-all">
                <div class="flex justify-between items-center border-b border-blue-200/70 pb-2.5">
                    <span class="text-xs font-black text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-person-running text-blue-600"></i> Jogging
                    </span>
                    <input type="text" id="mas-jog-dist-display" readonly placeholder="0 Meter" class="w-24 text-right font-mono font-black text-xs text-blue-900 bg-transparent focus:outline-none">
                </div>
                <div class="flex items-center gap-2">
                    <input type="number" id="mas-jog-sec" oninput="calculateMASDistances()" required value="15" min="1" class="w-full px-4 py-3 rounded-2xl border border-blue-200 text-sm font-black text-slate-800 bg-white focus:outline-none focus:border-blue-600 shadow-sm">
                    <span class="text-xs font-black text-blue-700">Detik</span>
                </div>
            </div>

            <!-- JALAN (REST) -->
            <div class="p-5 bg-slate-100/80 border border-slate-200/90 rounded-3xl space-y-3 shadow-sm hover:border-slate-300 transition-all">
                <div class="flex justify-between items-center border-b border-slate-200 pb-2.5">
                    <span class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-person-walking text-slate-500"></i> Jalan (Rest)
                    </span>
                    <input type="text" id="mas-walk-dist-display" readonly placeholder="0 Meter" class="w-24 text-right font-mono font-black text-xs text-slate-800 bg-transparent focus:outline-none">
                </div>
                <div class="flex items-center gap-2">
                    <input type="number" id="mas-walk-sec" oninput="calculateMASDistances()" required value="15" min="1" class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-black text-slate-800 bg-white focus:outline-none focus:border-slate-500 shadow-sm">
                    <span class="text-xs font-black text-slate-500">Detik</span>
                </div>
            </div>
        </div>

        <div class="flex justify-end pt-2">
            <button type="submit" class="w-full sm:w-auto bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 hover:from-purple-800 hover:to-indigo-900 text-white font-black py-4 px-8 rounded-2xl text-xs shadow-xl shadow-purple-900/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                <i class="fa-solid fa-floppy-disk text-purple-300"></i> Simpan Preskripsi MAS
            </button>
        </div>
    </form>
</div>

<!-- 4. HISTORI TABEL REKAP JOGGING & MAS -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <!-- HISTORI JOGGING -->
    <div class="bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/80 overflow-hidden shadow-md">
        <div class="p-5 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
            <h4 class="font-black text-xs text-slate-800 font-display flex items-center gap-2">
                <i class="fa-solid fa-clock-rotate-left text-blue-900"></i> Histori Jogging Skuad
            </h4>
            <span class="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black">${state.joggingLogs.length} Log</span>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[500px]">
                <thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
                    <tr>
                        <th class="p-3.5">Atlet</th>
                        <th class="p-3.5">Tanggal</th>
                        <th class="p-3.5 text-center">Zona</th>
                        <th class="p-3.5 text-center">Jarak</th>
                        <th class="p-3.5 text-center">Waktu</th>
                        <th class="p-3.5 text-center">Pace</th>
                        <th class="p-3.5 text-center w-16">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs font-semibold">
                    ${state.joggingLogs.length > 0 ? state.joggingLogs.map(j => { 
                        const pObj = state.atlet.find(a => String(a.id) === String(j.atletId)); 
                        const pct = Math.round(parseFloat(j.zona || '0.75') * 100); 
                        return `
                            <tr class="hover:bg-blue-50/40 transition-colors">
                                <td class="p-3.5 font-black text-slate-800">${pObj ? escapeHTML(pObj.nama) : escapeHTML(j.namaAtlet || j.nama || 'Atlet')}</td>
                                <td class="p-3.5 font-mono text-slate-500 font-bold">${j.tanggal}</td>
                                <td class="p-3.5 text-center font-bold"><span class="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-md text-[10px] font-black">${pct}% MAS</span></td>
                                <td class="p-3.5 text-center text-blue-900 font-mono font-black">${j.jarak} km</td>
                                <td class="p-3.5 text-center font-mono font-bold text-slate-600">${j.waktu} mnt</td>
                                <td class="p-3.5 text-center font-mono font-black text-emerald-700">${escapeHTML(j.pace)}</td>
                                <td class="p-3.5 text-center">
                                    <button onclick="deleteJoggingLog('${j.id}')" class="text-rose-500 bg-rose-50 w-7 h-7 inline-flex items-center justify-center hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm border border-rose-100"><i class="fa-solid fa-trash-can text-xs"></i></button>
                                </td>
                            </tr>`; 
                    }).join('') : `<tr><td colspan="7" class="p-8 text-center text-slate-400 italic">Belum ada riwayat jogging.</td></tr>`}
                </tbody>
            </table>
        </div>
    </div>

    <!-- HISTORI MAS -->
    <div class="bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/80 overflow-hidden shadow-md">
        <div class="p-5 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
            <h4 class="font-black text-xs text-slate-800 font-display flex items-center gap-2">
                <i class="fa-solid fa-clock-rotate-left text-purple-900"></i> Histori Preskripsi MAS
            </h4>
            <span class="bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1 rounded-full text-[10px] font-black">${state.masLogs.length} Log</span>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[500px]">
                <thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
                    <tr>
                        <th class="p-3.5">Atlet</th>
                        <th class="p-3.5">Tanggal</th>
                        <th class="p-3.5 text-center">Target (S / J / W)</th>
                        <th class="p-3.5 text-center">Repetisi</th>
                        <th class="p-3.5 text-center w-16">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs font-semibold">
                    ${state.masLogs.length > 0 ? state.masLogs.map(m => { 
                        const pObj = state.atlet.find(a => String(a.id) === String(m.atletId)); 
                        return `
                            <tr class="hover:bg-purple-50/40 transition-colors">
                                <td class="p-3.5 font-black text-slate-800">${pObj ? escapeHTML(pObj.nama) : escapeHTML(m.namaAtlet || m.nama || 'Atlet')}</td>
                                <td class="p-3.5 font-mono text-slate-500 font-bold">${m.tanggal}</td>
                                <td class="p-3.5 text-center font-mono font-black">
                                    <span class="text-rose-600">${m.sprintDist || 0}m</span> / 
                                    <span class="text-blue-600">${m.jogDist || 0}m</span> / 
                                    <span class="text-slate-500">${m.walkDist || 0}m</span>
                                </td>
                                <td class="p-3.5 text-center font-black text-slate-700">${m.rep} Set</td>
                                <td class="p-3.5 text-center">
                                    <button onclick="deleteMASLog('${m.id}')" class="text-rose-500 bg-rose-50 w-7 h-7 inline-flex items-center justify-center hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm border border-rose-100"><i class="fa-solid fa-trash-can text-xs"></i></button>
                                </td>
                            </tr>`; 
                    }).join('') : `<tr><td colspan="5" class="p-8 text-center text-slate-400 italic">Belum ada riwayat MAS.</td></tr>`}
                </tbody>
            </table>
        </div>
    </div>
</div>
`;

setTimeout(initMenu7AutoFill, 50);
    } else if (state.currentMenu === 'menu-8') {
pageTitle.innerText = "Validasi Laporan Bukti Jogging (GPS & PAP)";

// 1. Ambil seluruh laporan dari state atau memori lokal
const allReports = state.laporanValidasi || loadStorage("laporanValidasi") || [];

// 2. Filter laporan berdasarkan status (Aman dari null/undefined)
const pendingLogs = allReports.filter(l => l && (!l.status || l.status.toLowerCase() === 'menunggu' || l.status.toLowerCase() === 'pending'));
const approvedLogs = allReports.filter(l => l && l.status && l.status.toLowerCase() === 'disetujui');
const rejectedLogs = allReports.filter(l => l && l.status && l.status.toLowerCase() === 'ditolak');

const totalLogs = allReports.length;
const accPct = totalLogs > 0 ? Math.round((approvedLogs.length / totalLogs) * 100) : 0;

container.innerHTML = `
<!-- 1. GRID CHART & METRIK SUMMARY -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
    
    <!-- CHART DONUT/PIE (LEFT PANEL) -->
    <div class="lg:col-span-5 bg-white/95 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/80 shadow-md flex flex-col justify-between hover:shadow-xl transition-all">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h4 class="font-black text-slate-900 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
                <i class="fa-solid fa-chart-pie text-blue-900 text-sm"></i> Distribusi Status Validasi
            </h4>
            <span class="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-sm">Realtime Chart</span>
        </div>
        <div class="h-52 w-full relative flex items-center justify-center p-2">
            <canvas id="chart-validasi-status"></canvas>
        </div>
    </div>

    <!-- AUDIT & STATISTIK REKAP (RIGHT PANEL) -->
    <div class="lg:col-span-7 bg-white/95 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/80 shadow-md flex flex-col justify-between hover:shadow-xl transition-all">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h4 class="font-black text-slate-900 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
                <i class="fa-solid fa-shield-halved text-blue-900 text-sm"></i> Audit Bukti GPS & Laporan Lari
            </h4>
            <span class="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Total ${totalLogs} Laporan
            </span>
        </div>

        <div class="grid grid-cols-3 gap-3.5 mb-3">
            <div class="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl hover:scale-[1.02] transition-transform">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] font-black text-amber-800 uppercase tracking-wider">Menunggu</span>
                    <i class="fa-solid fa-clock-rotate-left text-amber-500 text-xs"></i>
                </div>
                <span class="text-2xl font-black text-amber-950 font-display block">${pendingLogs.length} <span class="text-xs font-bold text-amber-700">Antrean</span></span>
            </div>

            <div class="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl hover:scale-[1.02] transition-transform">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Disetujui</span>
                    <i class="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                </div>
                <span class="text-2xl font-black text-emerald-950 font-display block">${approvedLogs.length} <span class="text-xs font-bold text-emerald-700">Valid</span></span>
            </div>

            <div class="p-4 bg-rose-50/80 border border-rose-200/80 rounded-2xl hover:scale-[1.02] transition-transform">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] font-black text-rose-800 uppercase tracking-wider">Ditolak</span>
                    <i class="fa-solid fa-circle-xmark text-rose-500 text-xs"></i>
                </div>
                <span class="text-2xl font-black text-rose-950 font-display block">${rejectedLogs.length} <span class="text-xs font-bold text-rose-700">Gagal</span></span>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3.5">
            <div class="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center justify-between">
                <span class="text-[10px] font-black text-blue-900 uppercase tracking-wider">Tingkat Persetujuan (ACC):</span>
                <span class="font-mono font-black text-blue-950 text-base">${accPct}%</span>
            </div>
            <div class="p-3.5 bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <span class="text-[10px] font-black text-slate-600 uppercase tracking-wider">Perlu Tindakan:</span>
                <span class="font-mono font-black text-slate-900 text-base">${pendingLogs.length} Item</span>
            </div>
        </div>
    </div>

</div>

<!-- 2. ANTREAN VERIFIKASI BUKTI LAPORAN JOGGING -->
<div class="bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden mb-8">
    <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-2">
        <div>
            <h3 class="text-base font-black text-slate-900 font-display flex items-center gap-2">
                <i class="fa-solid fa-shield-check text-blue-900"></i> Verifikasi Bukti Laporan Jogging
            </h3>
            <p class="text-xs font-semibold text-slate-400 mt-0.5">Periksa keabsahan GPS, foto selfie, dan bukti Strava atlet.</p>
        </div>
        <span class="bg-amber-100 text-amber-900 border border-amber-300 font-black px-3.5 py-1.5 rounded-xl text-xs shadow-sm">
            ${pendingLogs.length} Antrean Perlu Tindakan
        </span>
    </div>

    <div class="p-6 space-y-6">
        ${pendingLogs.length > 0 ? pendingLogs.map(l => {
            const pObj = state.atlet.find(a => String(a.id) === String(l.atletId));
            const inisial = pObj ? pObj.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';

            return `
                <div class="p-6 rounded-[28px] border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-blue-200 transition-all shadow-sm space-y-5">
                    <div class="flex flex-wrap lg:flex-nowrap gap-4 items-center justify-between border-b border-slate-200/80 pb-4">
                        <div class="flex items-center gap-3.5">
                            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white flex items-center justify-center font-black text-sm shadow-md font-display shrink-0">
                                ${inisial}
                            </div>
                            <div>
                                <h5 class="font-black text-slate-900 text-base font-display">${pObj ? escapeHTML(pObj.nama) : 'Atlet Skuad'}</h5>
                                <div class="flex items-center gap-2 mt-1 flex-wrap">
                                    <span class="bg-blue-50 text-blue-900 font-black px-2.5 py-0.5 rounded-md border border-blue-200 text-[10px]">${pObj ? escapeHTML(pObj.posisi) : '-'}</span>
                                    <span class="text-[11px] font-extrabold text-slate-500"><i class="fa-solid fa-calendar-day text-slate-400 mr-1"></i>${l.tanggal || '-'}</span>
                                    <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"><i class="fa-solid fa-location-dot mr-1"></i>${escapeHTML(l.gpsLoc || 'GPS Aktif')}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2.5 w-full lg:w-auto justify-end">
                            <button onclick="setStatusLaporanValidasi('${l.id}', 'Disetujui')" class="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                                <i class="fa-solid fa-check text-sm"></i> Setujui
                            </button>
                            <button onclick="setStatusLaporanValidasi('${l.id}', 'Ditolak')" class="flex-1 lg:flex-none bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                                <i class="fa-solid fa-xmark text-sm"></i> Tolak
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        <div class="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                            <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Jarak</span>
                                <span class="font-black text-blue-900 text-sm">${l.jarak || 0} km</span>
                            </div>
                            <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Durasi</span>
                                <span class="font-black text-slate-800 text-sm">${l.waktu || 0} mnt</span>
                            </div>
                            <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Speed</span>
                                <span class="font-black text-emerald-700 text-sm">${l.speedKmh || 0} km/h</span>
                            </div>
                            <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Kalori</span>
                                <span class="font-black text-purple-700 text-sm">${l.kalori || 0} kcal</span>
                            </div>
                        </div>

                        <div class="md:col-span-5 flex items-center justify-end gap-3">
                            ${l.imgSelfieUrl ? `
                                <a href="${l.imgSelfieUrl}" target="_blank" class="group relative block rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-sm hover:scale-105 transition-transform">
                                    <img src="${l.imgSelfieUrl}" class="w-16 h-16 sm:w-20 sm:h-20 object-cover">
                                    <span class="absolute bottom-0 inset-x-0 bg-emerald-950/80 text-white text-[8px] font-black text-center py-0.5">Selfie</span>
                                </a>
                            ` : ''}
                            ${l.imgStravaUrl ? `
                                <a href="${l.imgStravaUrl}" target="_blank" class="group relative block rounded-2xl overflow-hidden border-2 border-blue-300 shadow-sm hover:scale-105 transition-transform">
                                    <img src="${l.imgStravaUrl}" class="w-16 h-16 sm:w-20 sm:h-20 object-cover">
                                    <span class="absolute bottom-0 inset-x-0 bg-blue-950/80 text-white text-[8px] font-black text-center py-0.5">Bukti Strava</span>
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('') : `
            <div class="text-center py-12 bg-slate-50/80 rounded-3xl border border-dashed border-slate-200">
                <i class="fa-solid fa-circle-check text-emerald-500 text-4xl mb-3"></i>
                <p class="text-sm font-black text-slate-800">Semua Laporan Lari Sudah Diverifikasi!</p>
                <p class="text-xs font-semibold text-slate-400 mt-1">Tidak ada antrean laporan baru dari atlet saat ini.</p>
            </div>
        `}
    </div>
</div>

<!-- 3. TABEL RIWAYAT KEPUTUSAN VALIDASI LENGKAP -->
<div class="bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden mt-6">
<div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-3">
<div>
    <h4 class="font-black text-slate-900 text-sm font-display flex items-center gap-2">
        <i class="fa-solid fa-clock-rotate-left text-blue-900"></i> Histori Keputusan Validasi Skuad (Disetujui & Ditolak)
    </h4>
    <p class="text-xs font-semibold text-slate-400 mt-0.5">Arsip seluruh laporan lari atlet yang telah diverifikasi oleh Pelatih Kepala.</p>
</div>
<div class="flex items-center gap-2">
    <span class="bg-emerald-50 text-emerald-800 border border-emerald-200 font-black px-3 py-1.5 rounded-xl text-xs shadow-sm">
        <i class="fa-solid fa-check-double mr-1"></i>${allReports.filter(l => l && l.status && l.status !== 'Menunggu').length} Histori Tersimpan
    </span>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse min-w-[700px]">
    <thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
        <tr>
            <th class="p-4">Tanggal</th>
            <th class="p-4">Nama Atlet</th>
            <th class="p-4 text-center">Jarak</th>
            <th class="p-4 text-center">Durasi</th>
            <th class="p-4 text-center">Kecepatan</th>
            <th class="p-4 text-center">Status Validasi</th>
            <th class="p-4 text-center w-20">Aksi</th>
        </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 text-xs font-semibold">
        ${allReports.filter(l => l && l.status && l.status !== 'Menunggu').length > 0 ? 
            allReports.filter(l => l && l.status && l.status !== 'Menunggu').map(l => {
                const pObj = state.atlet.find(a => String(a.id) === String(l.atletId));
                const isApproved = l.status === 'Disetujui';

                return `
                <tr class="hover:bg-blue-50/40 transition-colors">
                    <td class="p-4 font-mono font-bold text-slate-500">${l.tanggal || '-'}</td>
                    <td class="p-4 font-black text-slate-800">${pObj ? escapeHTML(pObj.nama) : (l.namaAtlet ? escapeHTML(l.namaAtlet) : 'Atlet Skuad')}</td>
                    <td class="p-4 text-center font-mono font-black text-blue-900">${l.jarak || 0} km</td>
                    <td class="p-4 text-center font-mono font-bold text-slate-600">${l.waktu || 0} mnt</td>
                    <td class="p-4 text-center font-mono font-bold text-emerald-700">${l.speedKmh || 0} km/h</td>
                    <td class="p-4 text-center">
                        <span class="px-3 py-1.5 rounded-xl text-[10px] font-black border inline-flex items-center gap-1.5 ${isApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}">
                            <i class="fa-solid ${isApproved ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-rose-600'}"></i>
                            ${l.status}
                        </span>
                    </td>
                    <td class="p-4 text-center">
                        <button onclick="deleteRiwayatValidasi('${l.id}')" class="text-rose-500 bg-rose-50 w-8 h-8 inline-flex items-center justify-center hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm border border-rose-100" title="Hapus Permanen">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </td>
                </tr>
                `;
            }).join('') : `
                <tr>
                    <td colspan="7" class="p-8 text-center text-slate-400 italic font-semibold">Belum ada riwayat keputusan validasi tersimpan.</td>
                </tr>
            `
        }
    </tbody>
</table>
</div>
</div>
`;
    } else if (state.currentMenu === 'menu-9') {
pageTitle.innerText = "Dashboard Monitoring ACWR & Beban RPE Skuad";

// 1. Pastikan selalu memuat data terbaru dari rpeLogs
state.rpeLogs = loadStorage('rpeLogs', state.rpeLogs || []);
const validReports = state.rpeLogs || [];

let countSweet = 0, countRisk = 0, countDanger = 0, countUnder = 0;
let totalAcute = 0;

const athleteAcwrList = state.atlet.map(at => {
const ac = calculateAtletACWR(at.id, validReports);
totalAcute += ac.acuteLoad;
if (ac.acwrRatio >= 0.8 && ac.acwrRatio <= 1.3) countSweet++;
else if (ac.acwrRatio > 1.3 && ac.acwrRatio <= 1.5) countRisk++;
else if (ac.acwrRatio > 1.5) countDanger++;
else countUnder++;
return { atlet: at, acwr: ac };
});

const avgAcute = state.atlet.length > 0 ? Math.round(totalAcute / state.atlet.length) : 0;

container.innerHTML = `
<!-- 1. KARTU RINGKASAN METRIK KPI ACWR SKUAD -->
<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mb-6">
    <div class="bg-white/95 backdrop-blur-xl p-5 rounded-[28px] border border-slate-200/80 shadow-md flex items-center gap-4 hover:shadow-xl transition-all">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl shrink-0">
            <i class="fa-solid fa-shield-heart"></i>
        </div>
        <div>
            <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Sweet Spot</p>
            <h4 class="text-xl font-black text-slate-900 font-display">${countSweet} <span class="text-xs font-bold text-emerald-600">Atlet</span></h4>
        </div>
    </div>

    <div class="bg-white/95 backdrop-blur-xl p-5 rounded-[28px] border border-slate-200/80 shadow-md flex items-center gap-4 hover:shadow-xl transition-all">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl shrink-0">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div>
            <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">High Risk</p>
            <h4 class="text-xl font-black text-slate-900 font-display">${countRisk} <span class="text-xs font-bold text-amber-600">Atlet</span></h4>
        </div>
    </div>

    <div class="bg-white/95 backdrop-blur-xl p-5 rounded-[28px] border border-slate-200/80 shadow-md flex items-center gap-4 hover:shadow-xl transition-all">
        <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center font-black text-xl shrink-0">
            <i class="fa-solid fa-biohazard"></i>
        </div>
        <div>
            <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Danger Zone</p>
            <h4 class="text-xl font-black text-slate-900 font-display">${countDanger} <span class="text-xs font-bold text-rose-600">Atlet</span></h4>
        </div>
    </div>

    <div class="bg-white/95 backdrop-blur-xl p-5 rounded-[28px] border border-slate-200/80 shadow-md flex items-center gap-4 hover:shadow-xl transition-all">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center font-black text-xl shrink-0">
            <i class="fa-solid fa-bolt"></i>
        </div>
        <div>
            <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Rerata Akut</p>
            <h4 class="text-xl font-black text-slate-900 font-display">${avgAcute} <span class="text-xs font-bold text-blue-800">AU</span></h4>
        </div>
    </div>
</div>

<!-- 2. GRID DIAGRAM TREN BEBAN & PARAMETER AMBANG -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
    <!-- GRAFIK TREN SRPE MINGGUAN (LEFT PANEL) -->
    <div class="lg:col-span-7 bg-white/95 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/80 shadow-md flex flex-col justify-between hover:shadow-xl transition-all">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h4 class="font-black text-slate-900 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
                <i class="fa-solid fa-chart-line text-blue-900 text-sm"></i> Tren Perkembangan Beban Latihan (sRPE) Skuad
            </h4>
            <span class="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-sm">6 Minggu</span>
        </div>
        <div class="h-56 w-full relative">
            <canvas id="chart-srpe-trend"></canvas>
        </div>
    </div>

    <!-- PARAMETER AMBANG ACWR (RIGHT PANEL) -->
    <div class="lg:col-span-5 bg-white/95 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/80 shadow-md flex flex-col justify-between hover:shadow-xl transition-all">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h4 class="font-black text-slate-900 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
                <i class="fa-solid fa-gauge-high text-blue-900 text-sm"></i> Parameter Ambang ACWR
            </h4>
            <span class="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Garis Panduan</span>
        </div>
        
        <div class="space-y-3">
            <div class="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                    <span class="block text-[10px] font-black text-emerald-800 uppercase tracking-wider">SWEET SPOT (0.8 - 1.3)</span>
                    <span class="text-[10px] font-bold text-emerald-600">Beban Ideal & Minim Risiko</span>
                </div>
                <span class="text-base font-black text-emerald-950 font-mono">${countSweet} <span class="text-xs font-bold text-emerald-700">Atlet</span></span>
            </div>

            <div class="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                    <span class="block text-[10px] font-black text-amber-800 uppercase tracking-wider">HIGH RISK (1.3 - 1.5)</span>
                    <span class="text-[10px] font-bold text-amber-600">Perlu Pengawasan Load</span>
                </div>
                <span class="text-base font-black text-amber-950 font-mono">${countRisk} <span class="text-xs font-bold text-amber-700">Atlet</span></span>
            </div>

            <div class="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                    <span class="block text-[10px] font-black text-rose-800 uppercase tracking-wider">DANGER ZONE (> 1.5)</span>
                    <span class="text-[10px] font-bold text-rose-600">Rentan Overuse / Cedera</span>
                </div>
                <span class="text-base font-black text-rose-950 font-mono">${countDanger} <span class="text-xs font-bold text-rose-700">Atlet</span></span>
            </div>
        </div>
    </div>
</div>

<!-- 3. GRAFIK BATANG BEBAN KERJA ACWR PER ATLET -->
<div class="bg-white/95 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/80 shadow-xl mb-6">
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h4 class="font-black text-slate-900 text-xs flex items-center gap-2 font-display uppercase tracking-wider">
            <i class="fa-solid fa-chart-column text-blue-900 text-sm"></i> Diagram Rasio Beban Kerja (ACWR) Per Atlet
        </h4>
        <span class="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Individual Ratio
        </span>
    </div>
    <div class="h-56 w-full relative">
        <canvas id="chart-acwr-bar"></canvas>
    </div>
</div>

<!-- 4. LOG MASUK LAPORAN RPE & HEART RATE SKUAD -->
<div class="bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden">
    <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-2">
        <div>
            <h4 class="font-black text-slate-900 text-sm font-display flex items-center gap-2">
                <i class="fa-solid fa-list-check text-blue-900"></i> Log Masuk Laporan RPE & Heart Rate Atlet
            </h4>
            <p class="text-xs font-semibold text-slate-400 mt-0.5">Catatan riwayat beban latihan subjektif yang dikirim oleh masing-masing atlet.</p>
        </div>
        <button onclick="exportAcwrRpeCSV()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5">
            <i class="fa-solid fa-file-excel"></i> Ekspor Rekap CSV
        </button>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[750px]">
            <thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
                <tr>
                    <th class="p-4">Tanggal</th>
                    <th class="p-4">Nama Atlet</th>
                    <th class="p-4 text-center">Skala RPE</th>
                    <th class="p-4 text-center">Durasi</th>
                    <th class="p-4 text-center">Max HR</th>
                    <th class="p-4 text-center">Session Load</th>
                    <th class="p-4 text-center w-20">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-semibold">
                ${(() => {
                    const listRpe = loadStorage('rpeLogs', state.rpeLogs || []);
                    if (!listRpe || listRpe.length === 0) {
                        return `<tr><td colspan="7" class="p-8 text-center text-slate-400 italic font-semibold">Belum ada laporan RPE yang masuk dari atlet.</td></tr>`;
                    }
                    return listRpe.map(r => {
                        const pObj = state.atlet.find(a => String(a.id) === String(r.atletId));
                        let namaBersih = pObj ? pObj.nama : r.namaAtlet;
                        if (!namaBersih || String(namaBersih).includes("GMT") || String(namaBersih).includes("2026")) {
                            namaBersih = pObj ? pObj.nama : "Atlet Skuad";
                        }
                        const namaTampil = escapeHTML(namaBersih);
                        const loadVal = r.sRPE || (parseFloat(r.rpeVal || 0) * parseFloat(r.durasi || 0)) || 0;

                        // Format Tanggal Rapi (YYYY-MM-DD)
                        let displayDate = '-';
                        if (r.tanggal) {
                            const d = new Date(r.tanggal);
                            displayDate = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : String(r.tanggal).substring(0, 10);
                        }

                        return `
                        <tr class="hover:bg-blue-50/40 transition-colors">
                            <td class="p-4 font-mono font-bold text-slate-600 whitespace-nowrap">${displayDate}</td>
                            <td class="p-4 font-black text-slate-800">${namaTampil}</td>
                            <td class="p-4 text-center font-bold text-amber-700">
                                <span class="bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80">RPE ${r.rpeVal || 0}/10</span>
                            </td>
                            <td class="p-4 text-center font-mono font-bold text-slate-600">${r.durasi || 0} mnt</td>
                            <td class="p-4 text-center font-mono text-rose-600 font-bold">${r.hrMax ? r.hrMax + ' BPM' : '-'}</td>
                            <td class="p-4 text-center font-black text-blue-900 font-mono">${loadVal} AU</td>
                            <td class="p-4 text-center">
                                <button onclick="deleteRpeLog('${r.id}')" class="text-rose-500 bg-rose-50 w-8 h-8 inline-flex items-center justify-center hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm border border-rose-100" title="Hapus Laporan">
                                    <i class="fa-solid fa-trash-can text-xs"></i>
                                </button>
                            </td>
                        </tr>
                        `;
                    }).join('');
                })()}
            </tbody>
        </table>
    </div>
</div>
`;
} else if (state.currentMenu === 'menu-10') {
pageTitle.innerText = "Preskripsi, Program & Log Latihan Gym";
const today = new Date().toISOString().split('T')[0];
const optionsAtlet = state.atlet.map(a => `<option value="${a.id}">${escapeHTML(a.nama)} (${escapeHTML(a.posisi)})</option>`).join('');
const listGym = loadStorage('gymLogs', state.gymLogs || []);

const totalSesiGym = listGym.length;
const lowerCount = listGym.filter(g => g.kategori?.includes('Lower')).length;
const upperCount = listGym.filter(g => g.kategori?.includes('Upper')).length;
const coreCount = listGym.filter(g => g.kategori?.includes('Core')).length;

container.innerHTML = `
<div class="space-y-6">
    <!-- 1. KPI HIGHLIGHT CARDS -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="bg-white/95 backdrop-blur-xl p-5 rounded-[28px] border border-slate-200/80 shadow-md flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center font-black text-xl shrink-0">
                <i class="fa-solid fa-dumbbell"></i>
            </div>
            <div>
                <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Preskripsi</p>
                <h4 class="text-2xl font-black text-slate-900 font-display">${totalSesiGym} <span class="text-xs font-bold text-slate-500">Log</span></h4>
            </div>
        </div>

        <div class="bg-white/95 backdrop-blur-xl p-5 rounded-[28px] border border-slate-200/80 shadow-md flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl shrink-0">
                <i class="fa-solid fa-person-walking"></i>
            </div>
            <div>
                <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lower Body</p>
                <h4 class="text-2xl font-black text-emerald-950 font-display">${lowerCount} <span class="text-xs font-bold text-emerald-600">Drill</span></h4>
            </div>
        </div>

        <div class="bg-white/95 backdrop-blur-xl p-5 rounded-[28px] border border-slate-200/80 shadow-md flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shrink-0">
                <i class="fa-solid fa-hand-fist"></i>
            </div>
            <div>
                <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Upper Body</p>
                <h4 class="text-2xl font-black text-indigo-950 font-display">${upperCount} <span class="text-xs font-bold text-indigo-600">Drill</span></h4>
            </div>
        </div>

        <div class="bg-white/95 backdrop-blur-xl p-5 rounded-[28px] border border-slate-200/80 shadow-md flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl shrink-0">
                <i class="fa-solid fa-arrows-spin"></i>
            </div>
            <div>
                <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Core & Rotasi</p>
                <h4 class="text-2xl font-black text-amber-950 font-display">${coreCount} <span class="text-xs font-bold text-amber-600">Drill</span></h4>
            </div>
        </div>
    </div>

    <!-- 2. MODUL TEMPLATE PROGRAM LATIHAN GYM SIAP PAKAI -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white p-6 sm:p-8 rounded-[32px] border border-slate-800 shadow-xl space-y-5">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
                <span class="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-1">PROGRAM WORKOUT TERSTRUKTUR</span>
                <h3 class="text-lg sm:text-xl font-black font-display flex items-center gap-2">
                    <i class="fa-solid fa-layer-group text-cyan-400"></i> Template Program Latihan Strength & Power Floorball
                </h3>
            </div>
            <span class="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-3.5 py-1.5 rounded-full text-xs font-black">
                Periodisasi Bompa
            </span>
        </div>

        <!-- SELECTOR PAKET PROGRAM -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button type="button" onclick="selectGymProgramPackage('hypertrophy_aa')" id="btn-pkg-hypertrophy_aa" class="p-4 rounded-2xl text-left border border-slate-700 bg-slate-800/80 hover:border-cyan-400 transition-all group active:scale-95">
                <span class="text-[9px] font-black text-cyan-400 uppercase tracking-wider block">Fase 1 (TPU)</span>
                <h5 class="font-black text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">Anatomical Adaptation</h5>
                <p class="text-[10px] text-slate-400 mt-1 font-semibold">Fondasi sendi, hipertrofi & stabilitas otot inti.</p>
            </button>

            <button type="button" onclick="selectGymProgramPackage('max_strength')" id="btn-pkg-max_strength" class="p-4 rounded-2xl text-left border border-slate-700 bg-slate-800/80 hover:border-cyan-400 transition-all group active:scale-95">
                <span class="text-[9px] font-black text-amber-400 uppercase tracking-wider block">Fase 2 (TPK)</span>
                <h5 class="font-black text-sm text-slate-100 group-hover:text-amber-300 transition-colors">Max Strength (MxS)</h5>
                <p class="text-[10px] text-slate-400 mt-1 font-semibold">Kekuatan maksimal tungkai, tarikan & dorongan.</p>
            </button>

            <button type="button" onclick="selectGymProgramPackage('conversion_power')" id="btn-pkg-conversion_power" class="p-4 rounded-2xl text-left border border-slate-700 bg-slate-800/80 hover:border-cyan-400 transition-all group active:scale-95">
                <span class="text-[9px] font-black text-rose-400 uppercase tracking-wider block">Fase 3 (Pra-Kompetisi)</span>
                <h5 class="font-black text-sm text-slate-100 group-hover:text-rose-300 transition-colors">Conversion to Power</h5>
                <p class="text-[10px] text-slate-400 mt-1 font-semibold">Eksplosivitas drag shot, sprint & pliometrik.</p>
            </button>

            <button type="button" onclick="selectGymProgramPackage('gk_special')" id="btn-pkg-gk_special" class="p-4 rounded-2xl text-left border border-slate-700 bg-slate-800/80 hover:border-cyan-400 transition-all group active:scale-95">
                <span class="text-[9px] font-black text-emerald-400 uppercase tracking-wider block">Posisi Khusus</span>
                <h5 class="font-black text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">Goalkeeper Conditioning</h5>
                <p class="text-[10px] text-slate-400 mt-1 font-semibold">Mobilitas pinggul, knee slide & reaksi bahu.</p>
            </button>
        </div>

        <!-- DETAIL DRILL PROGRAM YANG AKTIF -->
        <div id="gym-program-detail-card" class="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
            <!-- Dinamis dirender oleh selectGymProgramPackage() -->
        </div>
    </div>

    <!-- 3. GRID FORM INPUT MANUAL & KALKULATOR 1RM -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- FORM INPUT MANUAL/CUSTOM GYM -->
        <div class="lg:col-span-8 bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-xl space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                    <h3 class="text-base sm:text-lg font-black text-slate-900 font-display flex items-center gap-2">
                        <i class="fa-solid fa-pen-ruler text-blue-900"></i> Preskripsi Kustom / Input Beban Individual
                    </h3>
                    <p class="text-xs font-semibold text-slate-400 mt-0.5">Catat beban latihan custom harian untuk atlet tertentu.</p>
                </div>
                <span class="bg-blue-50 text-blue-900 border border-blue-200 font-black px-3 py-1 rounded-xl text-xs shadow-sm">
                    Custom Prescriptions
                </span>
            </div>

            <form onsubmit="submitGymLog(event)" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label class="block text-[11px] font-black uppercase text-slate-500">Pilih Atlet Target <span class="text-rose-500">*</span></label>
                        <select id="gym-atlet-id" required class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-white text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm">
                            <option value="semua">-- SEMUA ATLET (${state.atlet.length} ATLET) --</option>
                            ${optionsAtlet}
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-[11px] font-black uppercase text-slate-500">Tanggal Sesi <span class="text-rose-500">*</span></label>
                        <input type="date" id="gym-tanggal" required value="${today}" class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:border-blue-600 shadow-sm">
                    </div>
                </div>

                <!-- PILIHAN PRESET GERAKAN -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                    <div class="space-y-1.5">
                        <label class="block text-[11px] font-black uppercase text-blue-900">Preset Gerakan Standar</label>
                        <select id="gym-preset-gerakan" onchange="autoFillGymDrill(this.value)" class="w-full px-4 py-3 rounded-2xl border border-blue-200 text-xs font-bold bg-white text-blue-950 focus:outline-none focus:border-blue-600 shadow-sm">
                            <option value="">-- Pilih Rekomendasi Gerakan --</option>
                            <option value="squat">Barbell Back Squat (Power Tungkai & Stance)</option>
                            <option value="rdl">Romanian Deadlift / RDL (Hamstring & Posterior Chain)</option>
                            <option value="trap_bar">Trap Bar Deadlift (Akselerasi & Explosive Drive)</option>
                            <option value="bulgarian">Bulgarian Split Squat (Unilateral Knee Stability)</option>
                            <option value="bench_press">Barbell Bench Press (Pushing Power saat Body Contact)</option>
                            <option value="db_row">Single Arm Dumbbell Row (Tarikan & Power Stickwork)</option>
                            <option value="landmine_rot">Landmine Rotational Press (Power Drag Shot)</option>
                            <option value="pallof_press">Cable Pallof Press (Anti-Rotation Core)</option>
                            <option value="wrist_curl">Wrist Roller & Forearm Rotations (Wrist Shot Speed)</option>
                            <option value="box_jump">Plyo Box Jump (Vertical Power & Landing)</option>
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-[11px] font-black uppercase text-slate-500">Kategori Latihan</label>
                        <select id="gym-kategori" required class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm">
                            <option value="Lower Body Power">Lower Body Power (Squat, Deadlift, Jump)</option>
                            <option value="Upper Body Strength">Upper Body Strength (Press, Row, Pull)</option>
                            <option value="Core & Rotation">Core & Rotational Power (Shooting Mechanics)</option>
                            <option value="Forearm & Grip">Forearm, Wrist & Grip (Ball Control)</option>
                            <option value="Hypertrophy / AA">Anatomical Adaptation (AA) / Hypertrophy</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="space-y-1.5">
                        <label class="block text-[11px] font-black uppercase text-slate-500">Nama Gerakan <span class="text-rose-500">*</span></label>
                        <input type="text" id="gym-gerakan" placeholder="Contoh: Barbell Back Squat" required class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:border-blue-600 shadow-sm">
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-[11px] font-black uppercase text-slate-500">Target Beban <span class="text-rose-500">*</span></label>
                        <input type="text" id="gym-beban" placeholder="Contoh: 60 kg (75% 1RM)" required class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:border-blue-600 shadow-sm">
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-[11px] font-black uppercase text-slate-500">Skema Set × Reps <span class="text-rose-500">*</span></label>
                        <input type="text" id="gym-set-rep" placeholder="Contoh: 4 Set × 8 Reps (Rest 90s)" required class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:border-blue-600 shadow-sm">
                    </div>
                </div>

                <div class="flex items-center justify-end pt-2">
                    <button type="submit" class="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-900 text-white font-black px-8 py-3.5 rounded-2xl text-xs shadow-xl shadow-blue-900/30 active:scale-95 transition-all flex items-center gap-2">
                        <i class="fa-solid fa-plus text-cyan-400"></i> Simpan Drill Kustom
                    </button>
                </div>
            </form>
        </div>

        <!-- KALKULATOR 1RM -->
        <div class="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white p-6 rounded-[32px] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h4 class="font-black text-amber-400 text-xs uppercase tracking-wider flex items-center gap-2">
                        <i class="fa-solid fa-calculator"></i> Kalkulator 1RM (One Rep Max)
                    </h4>
                    <span class="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Epley Model</span>
                </div>

                <div class="space-y-3 mb-4">
                    <div>
                        <label class="block text-[10px] font-black uppercase text-slate-400 mb-1">Beban Terangkat (kg)</label>
                        <input type="number" id="calc-weight" oninput="calculate1RM()" placeholder="Contoh: 80" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black uppercase text-slate-400 mb-1">Jumlah Repetisi (Reps)</label>
                        <input type="number" id="calc-reps" oninput="calculate1RM()" placeholder="Contoh: 6" max="15" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400">
                    </div>
                </div>

                <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2.5">
                    <div class="flex justify-between items-center">
                        <span class="text-[11px] text-slate-400 font-extrabold">Estimasi 100% 1RM:</span>
                        <span class="text-xl font-black font-mono text-amber-400" id="res-1rm">0 kg</span>
                    </div>
                    <div class="h-px bg-slate-800"></div>
                    <div class="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                        <div class="bg-slate-950 p-2 rounded-xl border border-slate-800">
                            <span class="block text-slate-500 font-bold">Power (85%)</span>
                            <strong class="text-rose-400" id="res-85">0 kg</strong>
                        </div>
                        <div class="bg-slate-950 p-2 rounded-xl border border-slate-800">
                            <span class="block text-slate-500 font-bold">Strength (75%)</span>
                            <strong class="text-amber-300" id="res-75">0 kg</strong>
                        </div>
                        <div class="bg-slate-950 p-2 rounded-xl border border-slate-800">
                            <span class="block text-slate-500 font-bold">Hyper (65%)</span>
                            <strong class="text-emerald-400" id="res-65">0 kg</strong>
                        </div>
                    </div>
                </div>
            </div>

            <p class="text-[9px] text-slate-500 mt-4 text-center">Formula: $\\text{1RM} = \\text{Beban} \\times (1 + \\text{Reps} / 30)$.</p>
        </div>
    </div>

    <!-- 4. TABEL RIWAYAT PRESKRIPSI GYM -->
    <div class="bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden">
        <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-3">
            <div>
                <h4 class="font-black text-slate-900 text-sm font-display flex items-center gap-2">
                    <i class="fa-solid fa-clock-rotate-left text-blue-900"></i> Riwayat Preskripsi Latihan Gym Skuad
                </h4>
                <p class="text-xs font-semibold text-slate-400 mt-0.5">Daftar beban dan program gym yang telah ditugaskan.</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="exportGymLogsCSV()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5">
                    <i class="fa-solid fa-file-excel"></i> Ekspor CSV
                </button>
                <span class="bg-blue-50 text-blue-900 border border-blue-200 font-black px-3.5 py-2 rounded-2xl text-xs shadow-sm">
                    ${listGym.length} Log Tersimpan
                </span>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[750px]">
                <thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
                    <tr>
                        <th class="p-4">Tanggal</th>
                        <th class="p-4">Nama Atlet</th>
                        <th class="p-4">Kategori Latihan</th>
                        <th class="p-4">Gerakan / Drill</th>
                        <th class="p-4 text-center">Target Beban</th>
                        <th class="p-4 text-center">Skema Set × Reps</th>
                        <th class="p-4 text-center w-20">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs font-semibold">
                    ${listGym.length > 0 ? listGym.map(g => {
                        const pObj = state.atlet.find(a => String(a.id) === String(g.atletId));
                        const namaTampil = g.atletId === 'semua' ? 'Semua Atlet Skuad' : (pObj ? escapeHTML(pObj.nama) : 'Atlet Skuad');
                        
                        return `
                            <tr class="hover:bg-blue-50/40 transition-colors">
                                <td class="p-4 font-mono font-bold text-slate-500">${g.tanggal || '-'}</td>
                                <td class="p-4 font-black text-slate-800">${namaTampil}</td>
                                <td class="p-4"><span class="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-xl text-[10px] font-bold">${escapeHTML(g.kategori || '-')}</span></td>
                                <td class="p-4 font-extrabold text-slate-700">${escapeHTML(g.gerakan || '-')}</td>
                                <td class="p-4 text-center font-mono font-black text-blue-900">${escapeHTML(g.beban || '-')}</td>
                                <td class="p-4 text-center font-mono font-bold text-slate-600">${escapeHTML(g.setRep || '-')}</td>
                                <td class="p-4 text-center">
                                    <button onclick="deleteGymLog('${g.id}')" class="text-rose-500 bg-rose-50 w-8 h-8 inline-flex items-center justify-center hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm border border-rose-100" title="Hapus Log">
                                        <i class="fa-solid fa-trash-can text-xs"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('') : `
                        <tr>
                            <td colspan="7" class="p-8 text-center text-slate-400 italic font-semibold">Belum ada catatan program latihan gym tersimpan.</td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    </div>
</div>
`;
    } else if (state.currentMenu === 'menu-11') {
pageTitle.innerText = "Peta Anatomi Otot Interaktif & Fungsional Floorball";

const renderMuscleCards = (items, groupKey, borderTheme, badgeTheme) => items.map(m => `
<div class="anatomy-group-card p-5 bg-white rounded-2xl border ${borderTheme} shadow-sm hover:shadow-md transition-all space-y-3" data-group="${groupKey}">
    <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
            <span class="text-[10px] font-black uppercase tracking-wider ${badgeTheme} px-2.5 py-0.5 rounded-md inline-block mb-1">${escapeHTML(m.kategori)}</span>
            <h5 class="font-black text-slate-900 text-sm font-display">${escapeHTML(m.namaLatin)}</h5>
            <p class="text-xs font-bold text-slate-500">${escapeHTML(m.namaUmum)}</p>
        </div>
        <div class="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <i class="fa-solid fa-child text-sm"></i>
        </div>
    </div>
    <div class="space-y-2 text-xs">
        <div>
            <span class="block text-[10px] font-black uppercase text-slate-400">Fungsi Floorball:</span>
            <p class="font-semibold text-slate-700 leading-relaxed mt-0.5">${escapeHTML(m.fungsiFloorball)}</p>
        </div>
        <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span class="block text-[10px] font-black uppercase text-blue-900">Rekomendasi Drill:</span>
            <p class="font-bold text-slate-800 mt-0.5">${escapeHTML(m.drills)}</p>
        </div>
        <div class="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200/80">
            <span class="block text-[10px] font-black uppercase text-rose-700">Risiko Cedera:</span>
            <p class="font-bold text-rose-900 mt-0.5">${escapeHTML(m.risikoCedera)}</p>
        </div>
    </div>
</div>
`).join('');

container.innerHTML = `
<div class="space-y-6">
<!-- 1. MODEL MANUSIA ANATOMI INTERAKTIF -->
<div class="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-xl">
    <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 flex-wrap gap-2">
        <div>
            <h3 class="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <i class="fa-solid fa-child-reaching text-blue-900"></i> Model Anatomi Tubuh Interaktif
            </h3>
            <p class="text-xs font-semibold text-slate-400 mt-0.5">Klik bagian otot pada diagram untuk memunculkan analisis dan fungsinya.</p>
        </div>
        <span class="bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-black px-3 py-1 rounded-xl">Interactive Muscle Map</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- KONTINER PETA ANATOMI BLUEPRINT HUD -->
            <div class="lg:col-span-6 bg-[#070e1b] rounded-3xl p-5 flex flex-col items-center justify-between relative shadow-2xl border border-cyan-500/30 min-h-[580px] overflow-hidden">
                
                <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                <!-- Header Indikator -->
                <div class="w-full flex items-center justify-between z-10 mb-2">
                    <span class="bg-cyan-950/90 text-cyan-400 border border-cyan-500/40 text-[10px] font-mono px-3 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5">
                        <i class="fa-solid fa-crosshairs text-[10px] animate-pulse"></i> KLIK BAGIAN OTOT PADA DIAGRAM
                    </span>
                    <span class="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">HUD v2.0</span>
                </div>

                <!-- VIEWPORT SVG ANATOMI HUD -->
                <div class="w-full flex items-center justify-center relative z-10 my-auto py-2">
                    <svg viewBox="0 0 300 620" class="w-full max-w-[280px] h-auto select-none drop-shadow-[0_0_25px_rgba(2,132,199,0.15)]">
<defs>
<!-- Glow Halus Neon -->
<filter id="hudNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="5" result="blur" />
    <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
    </feMerge>
</filter>
<!-- Gradien Garis Tubuh -->
<linearGradient id="bodyBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#0b1e36" />
    <stop offset="100%" stop-color="#050d1a" />
</linearGradient>
</defs>

<!-- SILUET DASAR KERANGKA / KONTUR TUBUH -->
<g fill="none" stroke="#1e3a5f" stroke-width="1.5" opacity="0.6">
<!-- Kepala & Rahang -->
<path d="M150,25 C165,25 174,38 174,56 C174,75 162,92 150,95 C138,92 126,75 126,56 C126,38 135,25 150,25 Z" fill="#081426" stroke="#0284c7" />
<!-- Garis Tulang Belakang & Sumbu Simetri -->
<line x1="150" y1="95" x2="150" y2="280" stroke="#0369a1" stroke-dasharray="3 3" />
<!-- Pinggul & Telapak Kaki -->
<path d="M120,580 L115,595 L140,595 L135,580" fill="#0c1e38" />
<path d="M180,580 L185,595 L160,595 L165,580" fill="#0c1e38" />
</g>

<!-- 1. STAPEDIUS (Otot Pendengaran Mikro) -->
<g id="hotspot-stapedius" onclick="triggerHUDMuscle('stapedius')" class="cursor-pointer group">
<circle cx="125" cy="54" r="4" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
<circle cx="175" cy="54" r="4" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
</g>

<!-- 5. BAHU (DELTOIDEUS - ANTERIOR & LATERAL) -->
<g id="hotspot-deltoid" onclick="triggerHUDMuscle('deltoid')" class="cursor-pointer group">
<path d="M112,108 C102,112 88,124 86,145 C86,158 96,165 104,152 C110,140 114,124 116,112 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
<path d="M188,108 C198,112 212,124 214,145 C214,158 204,165 196,152 C190,140 186,124 184,112 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
</g>

<!-- 4. ROTATOR CUFF & LENGAN ATAS (BICEPS / BRACHIALIS) -->
<g id="hotspot-rotator" onclick="triggerHUDMuscle('rotator')" class="cursor-pointer group">
<path d="M96,160 C90,172 86,192 88,212 C96,214 102,198 104,178 C105,168 102,160 96,160 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
<path d="M204,160 C210,172 214,192 212,212 C204,214 198,198 196,178 C195,168 198,160 204,160 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
</g>

<!-- 3. LENGAN BAWAH (FOREARM / WRIST FLEXORS) -->
<g id="hotspot-forearm" onclick="triggerHUDMuscle('forearm')" class="cursor-pointer group">
<path d="M86,218 C78,238 70,270 66,295 C73,298 80,285 86,252 C90,232 90,220 86,218 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
<path d="M214,218 C222,238 230,270 234,295 C227,298 220,285 214,252 C210,232 210,220 214,218 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
</g>

<!-- 8. DADA (PECTORALIS) & PUNGGUNG SAYAP (LATISSIMUS DORSI) -->
<g id="hotspot-lats" onclick="triggerHUDMuscle('lats')" class="cursor-pointer group">
<!-- Pectoralis Kiri & Kanan -->
<path d="M118,110 C132,108 147,112 148,128 C148,144 135,152 118,148 C110,146 110,126 118,110 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
<path d="M182,110 C168,108 153,112 152,128 C152,144 165,152 182,148 C190,146 190,126 182,110 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
<!-- Lats Outer V-Taper -->
<path d="M110,154 C116,175 120,195 122,215 C114,205 106,182 106,160 Z" fill="#143760" stroke="#0284c7" stroke-width="1" />
<path d="M190,154 C184,175 180,195 178,215 C186,205 194,182 194,160 Z" fill="#143760" stroke="#0284c7" stroke-width="1" />
</g>

<!-- 6. PERUT & CORE (RECTUS & OBLIQUUS ABDOMINIS) -->
<g id="hotspot-oblique" onclick="triggerHUDMuscle('oblique')" class="cursor-pointer group">
<!-- Six Pack Abs Kolom Kiri -->
<path d="M130,154 L146,154 C147,166 147,168 146,172 L130,172 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1" rx="2" />
<path d="M130,176 L146,176 C147,188 147,190 146,194 L130,194 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1" rx="2" />
<path d="M130,198 L146,198 C147,212 146,218 144,222 L131,222 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1" rx="2" />
<!-- Six Pack Abs Kolom Kanan -->
<path d="M170,154 L154,154 C153,166 153,168 154,172 L170,172 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1" rx="2" />
<path d="M170,176 L154,176 C153,188 153,190 154,194 L170,194 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1" rx="2" />
<path d="M170,198 L154,198 C153,212 154,218 156,222 L169,222 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1" rx="2" />
<!-- Obliques Samping -->
<path d="M122,175 C126,195 126,215 124,232 C118,225 116,205 118,185 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1" />
<path d="M178,175 C174,195 174,215 176,232 C182,225 184,205 182,185 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1" />
</g>

<!-- 11. BOKONG / PANGGUL (GLUTEUS MAXIMUS) -->
<g id="hotspot-glute" onclick="triggerHUDMuscle('glute')" class="cursor-pointer group">
<path d="M124,236 C138,228 162,228 176,236 C186,252 184,274 172,285 C160,282 152,270 150,260 C148,270 140,282 128,285 C116,274 114,252 124,236 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.4" />
</g>

<!-- 10. PAHA DEPAN (QUADRICEPS FEMORIS) -->
<g id="hotspot-quads" onclick="triggerHUDMuscle('quads')" class="cursor-pointer group">
<!-- Paha Depan Kiri -->
<path d="M124,288 C138,285 146,310 144,360 C138,390 128,395 124,375 C118,340 114,305 124,288 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
<!-- Paha Depan Kanan -->
<path d="M176,288 C162,285 154,310 156,360 C162,390 172,395 176,375 C182,340 186,305 176,288 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
</g>

<!-- 9. PAHA BELAKANG (HAMSTRINGS - DESELERASI & SPRINT) -->
<g id="hotspot-hamstring" onclick="triggerHUDMuscle('hamstring')" class="cursor-pointer group">
<path d="M112,305 C116,335 118,368 122,385 C114,372 110,345 110,320 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
<path d="M188,305 C184,335 182,368 178,385 C186,372 190,345 190,320 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
</g>

<!-- 2. SENDI & KUNCI LUTUT (POPLITEUS) -->
<g id="hotspot-popliteus" onclick="triggerHUDMuscle('popliteus')" class="cursor-pointer group">
<ellipse cx="127" cy="408" rx="8" ry="6" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
<ellipse cx="173" cy="408" rx="8" ry="6" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
</g>

<!-- 7. BETIS (GASTROCNEMIUS & SOLEUS) -->
<g id="hotspot-calves" onclick="triggerHUDMuscle('calves')" class="cursor-pointer group">
<!-- Betis Kiri -->
<path d="M118,422 C132,425 136,448 132,500 C128,540 124,545 122,510 C116,480 112,445 118,422 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
<!-- Betis Kanan -->
<path d="M182,422 C168,425 164,448 168,500 C172,540 176,545 178,510 C184,480 188,445 182,422 Z" fill="#1b4578" stroke="#0284c7" stroke-width="1.2" />
</g>
</svg>
                </div>

                <!-- TOMBOL PILIH OTOT DI BAWAH DIAGRAM -->
                <div class="w-full pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5 justify-center z-10">
                    <span onclick="triggerHUDMuscle('stapedius')" class="cursor-pointer text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-800 font-bold transition">1. Stapedius</span>
                    <span onclick="triggerHUDMuscle('popliteus')" class="cursor-pointer text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-800 font-bold transition">2. Popliteus</span>
                    <span onclick="triggerHUDMuscle('forearm')" class="cursor-pointer text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-800 font-bold transition">3. Forearm</span>
                    <span onclick="triggerHUDMuscle('rotator')" class="cursor-pointer text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-800 font-bold transition">4. Rotator</span>
                    <span onclick="triggerHUDMuscle('deltoid')" class="cursor-pointer text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-800 font-bold transition">5. Bahu</span>
                    <span onclick="triggerHUDMuscle('oblique')" class="cursor-pointer text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-800 font-bold transition">6. Abs/Core</span>
                    <span onclick="triggerHUDMuscle('calves')" class="cursor-pointer text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-bold transition">7. Betis</span>
                    <span onclick="triggerHUDMuscle('lats')" class="cursor-pointer text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-bold transition">8. Lats/Dada</span>
                    <span onclick="triggerHUDMuscle('hamstring')" class="cursor-pointer text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-bold transition">9. Hamstring</span>
                    <span onclick="triggerHUDMuscle('quads')" class="cursor-pointer text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-bold transition">10. Quads</span>
                    <span onclick="triggerHUDMuscle('glute')" class="cursor-pointer text-[9px] bg-cyan-950 hover:bg-cyan-900 text-cyan-300 px-3 py-1 rounded-lg border border-cyan-500/50 font-black transition shadow-sm">11. Gluteus</span>
                </div>
            </div>

            <!-- DETAIL KARTU OTOT YANG SEDANG DIKLIK (SEBELAH KANAN) -->
            <div id="selected-muscle-detail" class="lg:col-span-6 flex flex-col justify-center min-h-[580px]">
                <div class="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-3xl text-center space-y-2">
                    <i class="fa-solid fa-hand-pointer text-blue-900 text-3xl mb-1 animate-bounce"></i>
                    <h4 class="font-black text-slate-800 text-sm">Pilih Bagian Otot Pada Model</h4>
                    <p class="text-xs font-semibold text-slate-400 max-w-sm mx-auto">Klik bagian tubuh pada model ilustrasi di sebelah kiri untuk melihat deskripsi klinis, fungsi aksi floorball, dan menu drill gym.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- 2. KARTU KATALOG OTOT LENGKAP -->
    <div class="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-md space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
            <h4 class="font-black text-slate-900 text-sm font-display uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-book-medical text-blue-900"></i> Katalog Lengkap Kelompok Otot Floorball
            </h4>
            
            <div class="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button id="btn-filter-anatomi-semua" onclick="filterAnatomyGroup('semua')" class="px-4 py-1.5 rounded-xl text-xs font-black bg-blue-900 text-white shadow-md transition-all">Semua</button>
                <button id="btn-filter-anatomi-besar" onclick="filterAnatomyGroup('besar')" class="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-white text-slate-600 hover:bg-slate-200 transition-all">Besar</button>
                <button id="btn-filter-anatomi-sedang" onclick="filterAnatomyGroup('sedang')" class="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-white text-slate-600 hover:bg-slate-200 transition-all">Sedang</button>
                <button id="btn-filter-anatomi-kecil" onclick="filterAnatomyGroup('kecil')" class="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-white text-slate-600 hover:bg-slate-200 transition-all">Kecil</button>
            </div>
        </div>

        <!-- KELOMPOK BESAR -->
        <div class="space-y-3">
            <span class="text-xs font-black text-blue-900 uppercase tracking-wider block">Otot Besar (Prime Movers)</span>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${renderMuscleCards(muscleHierarchyData.besar, 'besar', 'border-slate-200/90', 'bg-blue-50 text-blue-900 border border-blue-200')}
            </div>
        </div>

        <!-- KELOMPOK SEDANG -->
        <div class="space-y-3 pt-4 border-t border-slate-100">
            <span class="text-xs font-black text-emerald-800 uppercase tracking-wider block">Otot Sedang (Kinetic Link & Core)</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${renderMuscleCards(muscleHierarchyData.sedang, 'sedang', 'border-slate-200/90', 'bg-emerald-50 text-emerald-900 border border-emerald-200')}
            </div>
        </div>

        <!-- KELOMPOK KECIL -->
        <div class="space-y-3 pt-4 border-t border-slate-100">
            <span class="text-xs font-black text-purple-900 uppercase tracking-wider block">Otot Kecil (Stabilizers & Forearms)</span>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${renderMuscleCards(muscleHierarchyData.kecil, 'kecil', 'border-slate-200/90', 'bg-purple-50 text-purple-900 border border-purple-200')}
            </div>
        </div>
    </div>
</div>
`;

setTimeout(() => {
triggerHUDMuscle('glute');
}, 50);
        
    } else if (state.currentMenu === 'menu-atlet-1') {
pageTitle.innerText = "Dashboard Personal Atlet";
const at = state.activeAtlet;
if (!at) return;

// Kalkulasi Data Personal Atlet
const myAbsensi = getAtletAbsensiSummary(at.id)[0] || { total: 0, hadir: 0, alpa: 0, persentase: 0 };
const myVo2Max = getAtletVO2Max(at.id) || 'Belum Ada';
const myRpes = state.rpeLogs.filter(r => String(r.atletId) === String(at.id));
const lastRpe = myRpes.length > 0 ? myRpes[0] : null;
const acwrData = calculateAtletACWR(at.id);
const inisial = at.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

container.innerHTML = `
<!-- HEADER PROFIL ATLET -->
<div class="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white p-6 sm:p-8 rounded-[32px] mb-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
    <div class="relative z-10">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-500/30 tracking-wider">SKUAD RESMI</span>
            <span class="bg-white/10 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-full">PIN: ${escapeHTML(at.pin)}</span>
        </div>
        <h4 class="text-2xl sm:text-3xl font-black font-display tracking-tight">${escapeHTML(at.nama)}</h4>
        <p class="text-xs text-blue-200 mt-1 font-semibold">
            Posisi: <strong class="text-white">${escapeHTML(at.posisi)}</strong> | 
            Gender: <strong class="text-white">${escapeHTML(at.gender)}</strong> | 
            Usia: <strong class="text-white">${at.usia} Thn</strong>
        </p>
    </div>
    <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 border-2 border-white/20 flex items-center justify-center font-black text-2xl sm:text-3xl text-white font-display shadow-lg shrink-0 relative z-10">
        ${inisial}
    </div>
</div>

<!-- METRIK UTAMA KONDISI PERSONAL -->
<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mb-6">
    <div class="bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center font-black text-xl shrink-0">
            <i class="fa-solid fa-clipboard-user"></i>
        </div>
        <div>
            <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Kehadiran</p>
            <h4 class="text-xl font-black text-slate-800 font-display">${myAbsensi.persentase}%</h4>
            <span class="text-[9px] font-bold text-blue-700">${myAbsensi.hadir}/${myAbsensi.total} Sesi</span>
        </div>
    </div>

    <div class="bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl shrink-0">
            <i class="fa-solid fa-heart-pulse"></i>
        </div>
        <div>
            <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">VO2Max</p>
            <h4 class="text-xl font-black text-slate-800 font-display">${myVo2Max}</h4>
            <span class="text-[9px] font-bold text-emerald-600">Tes Yo-Yo IR1</span>
        </div>
    </div>

    <div class="bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl shrink-0">
            <i class="fa-solid fa-gauge-high"></i>
        </div>
        <div>
            <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Beban ACWR</p>
            <h4 class="text-xl font-black text-slate-800 font-display">${acwrData.acwrRatio}</h4>
            <span class="text-[9px] font-bold text-amber-700 truncate block max-w-[90px]">${acwrData.statusRisk}</span>
        </div>
    </div>

    <div class="bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center font-black text-xl shrink-0">
            <i class="fa-solid fa-notes-medical"></i>
        </div>
        <div>
            <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status Medis</p>
            <h4 class="text-xs font-black text-slate-800 truncate max-w-[110px] mt-1">${escapeHTML(at.cedera)}</h4>
        </div>
    </div>
</div>

<!-- AKSES CEPAT & STATUS TERAKHIR -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- PINTASAN AKSI -->
    <div class="lg:col-span-6 bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm space-y-4">
        <h4 class="font-black text-slate-800 text-sm font-display flex items-center gap-2">
            <i class="fa-solid fa-bolt text-blue-900"></i> Akses Cepat Atlet
        </h4>
        <div class="grid grid-cols-2 gap-3">
            <button onclick="navigate('menu-atlet-4')" class="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all group">
                <i class="fa-solid fa-route text-blue-900 text-xl mb-2 group-hover:scale-110 transition-transform block"></i>
                <span class="font-black text-slate-800 text-xs block">Kirim Laporan Lari</span>
                <span class="text-[10px] font-bold text-slate-400">Upload GPS & Foto Selfie</span>
            </button>
            <button onclick="navigate('menu-atlet-5')" class="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all group">
                <i class="fa-solid fa-heart-circle-bolt text-amber-600 text-xl mb-2 group-hover:scale-110 transition-transform block"></i>
                <span class="font-black text-slate-800 text-xs block">Input RPE Sesi</span>
                <span class="text-[10px] font-bold text-slate-400">Catat Beban Latihan</span>
            </button>
        </div>
    </div>

    <!-- DETAIL BEBAN TERAKHIR -->
    <div class="lg:col-span-6 bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
            <h4 class="font-black text-slate-800 text-sm font-display flex items-center gap-2 mb-3">
                <i class="fa-solid fa-clock-rotate-left text-blue-900"></i> Laporan Beban Terakhir
            </h4>
            ${lastRpe ? `
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div class="flex justify-between items-center text-xs">
                        <span class="font-bold text-slate-500">Tanggal: ${lastRpe.tanggal || '-'}</span>
                        <span class="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-lg font-black text-[10px]">RPE ${lastRpe.rpeVal}/10</span>
                    </div>
                    <div class="flex justify-between items-center pt-1">
                        <span class="text-xs font-extrabold text-slate-700">Session Load (sRPE):</span>
                        <span class="font-mono font-black text-base text-blue-900">${lastRpe.sRPE} AU</span>
                    </div>
                </div>
            ` : `
                <p class="text-xs text-slate-400 italic py-6 text-center bg-slate-50 rounded-2xl border border-dashed">Belum ada catatan RPE terinput.</p>
            `}
        </div>
    </div>
</div>
`;
    } else if (state.currentMenu === 'menu-atlet-2') {
pageTitle.innerText = "Laporan Hasil Tes Fisik Anda";
const at = state.activeAtlet;
if (!at) return;

// Ambil seluruh catatan tes fisik milik atlet yang sedang aktif
const records = state.tesFisik.filter(t => String(t.atletId) === String(at.id));
const lastDate = records.length > 0 ? records[0].tanggal : '-';

container.innerHTML = `
<!-- HEADER EVALUASI ATLET -->
<div class="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-200/80 shadow-sm mb-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-6">
        <div>
            <h3 class="text-base sm:text-lg font-black text-slate-800 font-display flex items-center gap-2">
                <i class="fa-solid fa-heart-pulse text-blue-900"></i> Evaluasi Fisik Personal & Kategori Norma
            </h3>
            <p class="text-xs text-slate-400 font-semibold mt-0.5">
                Hasil pengukuran kondisi fisik berdasarkan standar norma ${escapeHTML(at.gender)} (${escapeHTML(at.posisi)}).
            </p>
        </div>
        <div class="flex items-center gap-2">
            <span class="bg-blue-50 text-blue-900 font-black px-3.5 py-1.5 rounded-xl border border-blue-200 text-xs shadow-sm">
                <i class="fa-solid fa-calendar-day mr-1.5"></i>Terakhir Tes: ${lastDate}
            </span>
        </div>
    </div>

    <!-- GRID EVALUASI NORMA ITEM TES FISIK -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${listFieldTes.map(f => {
            const tesItem = records.find(t => t.keyTes === f.key);
            const skorVal = tesItem ? tesItem.skor : null;
            const kat = tesItem ? hitungKategoriNorma(f.key, tesItem.skor, at.gender, at.posisi) : '-';

            let pillColor = 'bg-slate-100 text-slate-400 border-slate-200';
            let badgeLabel = 'Belum Ada Tes';

            if (kat === 'SB') { pillColor = 'bg-emerald-500 text-white border-emerald-600'; badgeLabel = 'Sangat Baik (SB)'; }
            else if (kat === 'B') { pillColor = 'bg-blue-500 text-white border-blue-600'; badgeLabel = 'Baik (B)'; }
            else if (kat === 'S') { pillColor = 'bg-amber-400 text-amber-950 border-amber-500'; badgeLabel = 'Sedang (S)'; }
            else if (kat === 'K') { pillColor = 'bg-orange-500 text-white border-orange-600'; badgeLabel = 'Kurang (K)'; }
            else if (kat === 'SK') { pillColor = 'bg-rose-500 text-white border-rose-600'; badgeLabel = 'Sangat Kurang (SK)'; }

            return `
                <div class="border border-slate-200/80 p-4 sm:p-5 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all shadow-sm flex items-center justify-between gap-3">
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">${escapeHTML(f.shortLabel)}</p>
                        <h5 class="text-xl sm:text-2xl font-black text-slate-800 font-display mt-0.5">
                            ${skorVal !== null ? skorVal : '-'} 
                            <span class="text-xs font-semibold text-slate-500">${escapeHTML(f.satuan)}</span>
                        </h5>
                    </div>
                    <div class="px-3 py-1.5 rounded-xl text-[10px] font-black border shadow-sm ${pillColor} text-center shrink-0">
                        ${badgeLabel}
                    </div>
                </div>
            `;
        }).join('')}
    </div>
</div>

<!-- PETUNJUK INDIKATOR SKALA NORMA -->
<div class="bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-sm">
    <h4 class="font-black text-xs text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
        <i class="fa-solid fa-circle-info text-blue-900"></i> Keterangan Skala Norma Kebugaran:
    </h4>
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] font-black">
        <div class="p-2 rounded-xl bg-emerald-500 text-white border border-emerald-600">Sangat Baik (SB)</div>
        <div class="p-2 rounded-xl bg-blue-500 text-white border border-blue-600">Baik (B)</div>
        <div class="p-2 rounded-xl bg-amber-400 text-amber-950 border border-amber-500">Sedang (S)</div>
        <div class="p-2 rounded-xl bg-orange-500 text-white border border-orange-600">Kurang (K)</div>
        <div class="p-2 rounded-xl bg-rose-500 text-white border border-rose-600">Sangat Kurang (SK)</div>
    </div>
</div>
`;
    } else if (state.currentMenu === 'menu-atlet-3') {
pageTitle.innerText = "Riwayat Kehadiran Latihan";
const at = state.activeAtlet;
if (!at) return;

// Filter data presensi khusus atlet aktif & ambil ringkasannya
const records = state.absensi.filter(a => String(a.atletId) === String(at.id));
const summary = getAtletAbsensiSummary(at.id)[0] || { total: 0, hadir: 0, telat: 0, sakit: 0, izin: 0, alpa: 0, persentase: 0 };

container.innerHTML = `
<!-- RINGKASAN STATISTIK KEHADIRAN -->
<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mb-6">
    <div class="bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-sm text-center">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Total Sesi</span>
        <h4 class="text-2xl font-black text-slate-800 font-display">${summary.total}</h4>
        <span class="text-[9px] font-bold text-slate-400">Tercatat</span>
    </div>
    <div class="bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-sm text-center">
        <span class="text-[10px] font-black text-emerald-600 uppercase tracking-wider block mb-1">Hadir & Telat</span>
        <h4 class="text-2xl font-black text-emerald-700 font-display">${summary.hadir + summary.telat}</h4>
        <span class="text-[9px] font-bold text-emerald-600">${summary.persentase}% Kehadiran</span>
    </div>
    <div class="bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-sm text-center">
        <span class="text-[10px] font-black text-amber-600 uppercase tracking-wider block mb-1">Izin / Sakit</span>
        <h4 class="text-2xl font-black text-amber-700 font-display">${summary.izin + summary.sakit}</h4>
        <span class="text-[9px] font-bold text-amber-600">Dengan Keterangan</span>
    </div>
    <div class="bg-white p-5 rounded-[28px] border border-slate-200/80 shadow-sm text-center">
        <span class="text-[10px] font-black text-rose-500 uppercase tracking-wider block mb-1">Alpa</span>
        <h4 class="text-2xl font-black text-rose-600 font-display">${summary.alpa}</h4>
        <span class="text-[9px] font-bold text-rose-500">Tanpa Keterangan</span>
    </div>
</div>

<!-- LOG TABEL HISTORI PRESENSI -->
<div class="bg-white rounded-[32px] border border-slate-200/80 shadow-sm overflow-hidden">
    <div class="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h4 class="font-black text-slate-800 text-sm font-display flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-blue-900"></i> Log Presensi Latihan Personal
        </h4>
        <span class="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-xl text-xs font-black">
            ${records.length} Catatan
        </span>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[500px]">
            <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <tr>
                    <th class="p-4">Tanggal</th>
                    <th class="p-4">Jenis Sesi Latihan</th>
                    <th class="p-4 text-center">Status Kehadiran</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-semibold">
                ${records.length > 0 ? records.map(r => {
                    let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    if (r.status === 'Telat') badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
                    if (r.status === 'Izin' || r.status === 'Sakit') badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
                    if (r.status === 'Alpa') badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';

                    return `
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="p-4 font-mono font-bold text-slate-600">${r.tanggal || '-'}</td>
                            <td class="p-4 font-black text-slate-800">${escapeHTML(r.jenis)}</td>
                            <td class="p-4 text-center">
                                <span class="px-3.5 py-1.5 rounded-xl text-[10px] font-black border inline-block ${badgeColor}">
                                    ${escapeHTML(r.status)}
                                </span>
                            </td>
                        </tr>
                    `;
                }).join('') : `
                    <tr>
                        <td colspan="3" class="p-6 text-center text-slate-400 italic">Belum ada riwayat presensi tercatat untuk Anda.</td>
                    </tr>
                `}
            </tbody>
        </table>
    </div>
</div>
`;
    } else if (state.currentMenu === 'menu-atlet-4') {
pageTitle.innerText = "Laporan Sesi Jogging & Bukti GPS/PAP";
const at = state.activeAtlet;
if (!at) return;

// Ambil seluruh sumber target (programLatihan + joggingLogs + localStorage)
const allRawTargets = [
...(state.programLatihan || []), 
...(state.joggingLogs || []), 
...(loadStorage("programLatihan") || []),
...(loadStorage("joggingLogs") || [])
];

// Filter duplikat berdasarkan ID
const targetMap = new Map();
allRawTargets.forEach(item => { if (item && item.id) targetMap.set(String(item.id), item); });
const allTargets = Array.from(targetMap.values());

// Filter khusus atlet yang sedang login
const myPreskripsi = allTargets.filter(j => {
if (!j) return false;
const targetId = String(j.atletId || '').trim().toLowerCase();
const currentId = String(at.id || '').trim().toLowerCase();
const currentName = String(at.nama || '').trim().toLowerCase();
const logName = String(j.namaAtlet || j.nama || '').trim().toLowerCase();

return targetId === currentId || 
        targetId === 'semua' || 
        targetId === '' || 
        targetId === 'all' ||
        (logName && currentName && (logName.includes(currentName) || currentName.includes(logName)));
});

// 2. Ambil data status laporan validasi (Menu 8) khusus untuk atlet ini (Filter pintar: ID atau Nama)
const myReports = (state.laporanValidasi || []).filter(l => {
if (!l) return false;

const reportId = String(l.atletId || '').trim().toLowerCase();
const currentId = String(at.id || '').trim().toLowerCase();

const reportNama = String(l.namaAtlet || l.nama || '').trim().toLowerCase();
const currentNama = String(at.nama || '').trim().toLowerCase();

// Cocokkan berdasarkan ID atlet ATAU Nama Atlet yang sedang login
const isMatchId = reportId && currentId && (reportId === currentId);
const isMatchNama = reportNama && currentNama && (reportNama.includes(currentNama) || currentNama.includes(reportNama));

return isMatchId || isMatchNama;
});
container.innerHTML = `
<div class="space-y-6">
    <!-- 1. FORM INPUT LAPORAN (BAGIAN ATAS) -->
    <div class="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-xl space-y-6">
        <div class="border-b border-slate-100 pb-4">
            <h3 class="text-base sm:text-lg font-black text-slate-800 font-display flex items-center gap-2">
                <i class="fa-solid fa-route text-blue-900"></i> Form Laporan Bukti Jogging Atlet
            </h3>
            <p class="text-xs text-slate-400 font-semibold mt-0.5">
                Unggah titik koordinat GPS, foto selfie setelah lari, dan tangkapan layar bukti aplikasi Strava.
            </p>
        </div>

        <form onsubmit="submitAtletLaporanJogging(event)" class="space-y-6">
            <!-- BARIS 1: INFORMASI ATLET & TARGET -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-[11px] font-black text-slate-500 uppercase mb-1.5">Nama Atlet Skuad</label>
                    <input type="text" readonly value="${escapeHTML(at.nama)} (${escapeHTML(at.posisi)})" class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-sm font-extrabold text-slate-700 shadow-inner">
                </div>
                <div>
                    <label class="block text-[11px] font-black text-slate-500 uppercase mb-1.5">Target Durasi (Menit)</label>
                    <input type="number" step="1" min="1" id="run-durasi" oninput="calculateRealtimePaceFromAtletInput()" placeholder="Masukkan durasi..." class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-extrabold text-blue-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-sm">
                </div>
                <div>
                    <label class="block text-[11px] font-black text-slate-500 uppercase mb-1.5">Target Intensitas Zona</label>
                    <select id="run-zona" onchange="calculateRealtimePaceFromAtletInput()" class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-extrabold text-purple-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-sm">
                        <option value="0.60">Zone 1 (60% MAS)</option>
                        <option value="0.75" selected>Zone 2: Aerobic Base (75% MAS)</option>
                        <option value="0.80">Zone 3 (80% MAS)</option>
                        <option value="0.90">Zone 4 (90% MAS)</option>
                        <option value="1.00">Zone 5 (100% MAS)</option>
                    </select>
                </div>
            </div>

            <!-- BARIS 2: UNGGAH BUKTI FOTO & GPS -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-5 rounded-3xl bg-slate-50/80 border border-slate-200/90 shadow-sm hover:border-blue-300 transition-all">
                    <label class="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>1. Titik Lokasi GPS <span class="text-rose-500">*</span></span>
                        <i class="fa-solid fa-location-crosshairs text-blue-900 text-sm"></i>
                    </label>
                    <button type="button" id="btn-toggle-run-tracker" onclick="toggleLiveRunTracker()" class="w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-900 text-white font-black text-xs shadow-lg shadow-blue-900/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
<i class="fa-solid fa-play text-cyan-400"></i> Mulai Tracking Sesi Lari
</button>
<div id="gps-status-badge" class="w-full mt-2.5 px-3.5 py-2.5 bg-white text-slate-500 border border-slate-200/90 rounded-2xl text-xs font-semibold text-center shadow-inner">
Tekan tombol di atas sebelum mulai berlari (Bekerja Offline)
</div>
                </div>

                <div class="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 shadow-sm">
                    <label class="block text-[11px] font-black text-emerald-900 uppercase mb-2">2. Foto Selfie Pasca Lari <span class="text-rose-500">*</span></label>
                    <input type="file" id="run-file-selfie" accept="image/*;capture=camera" capture="user" required class="w-full text-xs font-extrabold text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer">
                </div>

                <div class="p-5 rounded-3xl bg-blue-50/60 border border-blue-200/80 shadow-sm">
                    <label class="block text-[11px] font-black text-blue-900 uppercase mb-2">3. Screenshot Strava <span class="text-rose-500">*</span></label>
                    <input type="file" id="run-file-bukti" accept="image/*" required class="w-full text-xs font-extrabold text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-900 file:text-white hover:file:bg-blue-950 cursor-pointer">
                </div>
            </div>

            <!-- BARIS 3: ESTIMASI METRIK PERFORMA -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-sm">
                    <span class="block text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Rerata Pace</span>
                    <h4 class="text-xl sm:text-2xl font-black text-slate-800 font-display" id="run-pace-display">-</h4>
                </div>
                <div class="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 shadow-sm">
                    <span class="block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">Target Jarak</span>
                    <h4 class="text-xl sm:text-2xl font-black text-blue-900 font-display" id="run-jarak-display">-</h4>
                </div>
                <div class="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 shadow-sm">
                    <span class="block text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">Kecepatan</span>
                    <h4 class="text-xl sm:text-2xl font-black text-emerald-800 font-display" id="run-speed-display">-</h4>
                </div>
                <div class="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 shadow-sm">
                    <span class="block text-[10px] font-black text-purple-600 uppercase tracking-wider mb-1">Est. Kalori</span>
                    <h4 class="text-xl sm:text-2xl font-black text-purple-900 font-display" id="run-kalori-display">-</h4>
                </div>
            </div>
            <div class="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
                <span class="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <i class="fa-solid fa-map-location-dot text-orange-500"></i> Peta Jalur Lari Live
                </span>
                <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">GPS Path</span>
            </div>
            <div id="strava-map" class="w-full h-64 rounded-2xl border border-slate-200 overflow-hidden z-0"></div>
        </div>
            <div class="flex justify-end pt-2">
                <button type="submit" class="w-full sm:w-auto bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-900 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-paper-plane"></i> Kirim Laporan Lari Ke Pelatih
                </button>
            </div>
        </form>
    </div>

    <!-- 2. DUA TABEL DI BAWAH (SIDE-BY-SIDE / DUA KOLOM) -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">   
<!-- TABEL KIRI: RIWAYAT PRESKRIPSI LATIHAN DARI MENU 7 -->
<div class="bg-white rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden flex flex-col justify-between">
<div class="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
    <div>
        <h4 class="font-black text-slate-900 text-sm font-display flex items-center gap-2">
            <i class="fa-solid fa-clipboard-list text-blue-900"></i> Target Latihan dari Pelatih (Menu 7)
        </h4>
        <p class="text-[11px] font-semibold text-slate-400 mt-0.5">Daftar preskripsi jogging/MAS yang ditugaskan Pelatih Kepala.</p>
    </div>
    <span class="bg-blue-50 text-blue-900 border border-blue-200 font-black px-3 py-1 rounded-xl text-xs shadow-sm">
        ${myPreskripsi.length} Target
    </span>
</div>
<div class="overflow-x-auto w-full">
    <table class="w-full text-left border-collapse min-w-[480px]">
        <thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
            <tr>
                <th class="p-3.5">Tanggal</th>
                <th class="p-3.5 text-center">Zona</th>
                <th class="p-3.5 text-center">Target Jarak</th>
                <th class="p-3.5 text-center">Durasi</th>
                <th class="p-3.5 text-center">Pace Target</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-xs font-semibold">
            ${myPreskripsi.length > 0 ? myPreskripsi.map(j => {
                const tglShort = j.tanggal ? String(j.tanggal).split('T')[0] : '-';
                return `
                    <tr class="hover:bg-blue-50/40 transition-colors">
                        <td class="p-3.5 font-mono font-bold text-slate-600">${tglShort}</td>
                        <td class="p-3.5 text-center font-bold text-purple-700"><span class="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">${Math.round(parseFloat(j.zona || '0.75') * 100)}% MAS</span></td>
                        <td class="p-3.5 text-center font-mono font-black text-blue-900">${j.jarak || 0} km</td>
                        <td class="p-3.5 text-center font-mono font-bold text-slate-600">${j.waktu || 0} mnt</td>
                        <td class="p-3.5 text-center font-mono font-black text-emerald-700">${escapeHTML(j.pace || '-')}</td>
                    </tr>
                `;
            }).join('') : `
                <tr>
                    <td colspan="5" class="p-8 text-center text-slate-400 italic font-semibold">Belum ada preskripsi latihan dari pelatih.</td>
                </tr>
            `}
        </tbody>
    </table>
</div>
</div>

<!-- TABEL KANAN: STATUS VERIFIKASI / VALIDASI LAPORAN (TIDAK DUPLIKAT lagi) -->
<div class="bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden flex flex-col justify-between">
<div class="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
    <div>
        <h4 class="font-black text-slate-900 text-sm font-display flex items-center gap-2">
            <i class="fa-solid fa-shield-check text-blue-900"></i> Histori Status Laporan Validasi Pelatih
        </h4>
        <p class="text-[11px] font-semibold text-slate-400 mt-0.5">Status verifikasi bukti lari Anda oleh Pelatih Kepala.</p>
    </div>
    <span class="bg-emerald-50 text-emerald-900 border border-emerald-200 font-black px-3 py-1 rounded-xl text-xs shadow-sm">
        ${myReports.length} Laporan Dikirim
    </span>
</div>

<div class="overflow-x-auto">
    <table class="w-full text-left border-collapse min-w-[450px]">
        <thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
            <tr>
                <th class="p-3.5">Tanggal</th>
                <th class="p-3.5 text-center">Jarak</th>
                <th class="p-3.5 text-center">Durasi</th>
                <th class="p-3.5 text-center">Speed</th>
                <th class="p-3.5 text-center">Status Pelatih</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-xs font-semibold">
            ${myReports.length > 0 ? myReports.map(r => {
                let badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
                let icon = 'fa-clock text-amber-600';
                let statusText = r.status || 'Menunggu';

                if (statusText === 'Disetujui') {
                    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    icon = 'fa-circle-check text-emerald-600';
                } else if (statusText === 'Ditolak') {
                    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
                    icon = 'fa-circle-xmark text-rose-600';
                }

                const tglShort = r.tanggal ? String(r.tanggal).split('T')[0] : '-';

                return `
                    <tr class="hover:bg-blue-50/40 transition-colors">
                        <td class="p-3.5 font-mono font-bold text-slate-600">${tglShort}</td>
                        <td class="p-3.5 text-center font-mono font-black text-blue-900">${r.jarak || 0} km</td>
                        <td class="p-3.5 text-center font-mono font-bold text-slate-600">${r.waktu || 0} mnt</td>
                        <td class="p-3.5 text-center font-mono font-black text-emerald-700">${r.speedKmh || 0} km/h</td>
                        <td class="p-3.5 text-center">
                            <span class="px-3 py-1 rounded-xl text-[10px] font-black border inline-flex items-center gap-1.5 ${badgeColor}">
                                <i class="fa-solid ${icon}"></i> ${statusText}
                            </span>
                        </td>
                    </tr>
                `;
            }).join('') : `
                <tr>
                    <td colspan="5" class="p-8 text-center text-slate-400 italic font-semibold">Belum ada riwayat laporan yang dikirimkan.</td>
                </tr>
            `}
        </tbody>
    </table>
</div>
</div>
</div>
`;                
setTimeout(updateAtletJoggingCalculations, 50);

    } else if (state.currentMenu === 'menu-atlet-5') {
pageTitle.innerText = "Input RPE & Heart Rate (Beban Latihan)";
const at = state.activeAtlet;
if (!at) return;
const today = new Date().toISOString().split('T')[0];

container.innerHTML = `
<div class="space-y-6">
    <!-- FORM INPUT RPE & HR -->
    <div class="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-200/80 shadow-sm">
        <div class="border-b border-slate-100 pb-4 mb-6">
            <h3 class="text-base sm:text-lg font-black text-slate-800 font-display flex items-center gap-2">
                <i class="fa-solid fa-heart-circle-bolt text-amber-600"></i> Form Laporkan Beban Latihan (sRPE)
            </h3>
            <p class="text-xs text-slate-400 font-semibold mt-0.5">
                Masukkan tingkat intensitas subjektif (Skala Borg 1-10) dan durasi sesi latihan yang baru saja Anda selesaikan.
            </p>
        </div>

        <form onsubmit="submitAtletRPE(event)" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label class="block text-xs font-extrabold text-slate-600 mb-1.5">Tanggal Sesi <span class="text-rose-500">*</span></label>
                    <input type="date" id="rpe-tanggal" required value="${today}" class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-700">
                </div>

                <div>
                    <label class="block text-xs font-extrabold text-slate-600 mb-1.5">Skala Intensitas RPE <span class="text-rose-500">*</span></label>
                    <select id="rpe-scale" onchange="updateRealtimeSRPE()" required class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-white text-slate-800 focus:outline-none focus:border-blue-700">
                        <option value="1">1 - Sangat Ringan (Rest / Santai)</option>
                        <option value="2">2 - Ringan (Napas Teratur)</option>
                        <option value="3">3 - Sedang (Mulai Berkeringat)</option>
                        <option value="4">4 - Agak Berat (Latihan Teratur)</option>
                        <option value="5" selected>5 - Berat (Napas Mulai Terengah)</option>
                        <option value="6">6 - Cukup Berat (Fokus Penuh)</option>
                        <option value="7">7 - Sangat Berat (Bicara Terbata-bata)</option>
                        <option value="8">8 - Sangat Berat Sekali (Mendekati Limit)</option>
                        <option value="9">9 - Hampir Maksimal (Sangat Lelah)</option>
                        <option value="10">10 - Maksimal (All-Out / Exhaustion)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-extrabold text-slate-600 mb-1.5">Durasi Latihan (Menit) <span class="text-rose-500">*</span></label>
                    <input type="number" min="1" max="300" id="rpe-durasi" oninput="updateRealtimeSRPE()" required value="90" class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-700">
                </div>

                <div>
                    <label class="block text-xs font-extrabold text-slate-600 mb-1.5">Detak Jantung Maksimal (BPM)</label>
                    <input type="number" min="60" max="230" id="rpe-hrmax" placeholder="Contoh: 175" class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-700">
                </div>
            </div>

            <!-- KALKULASI AUTOMATIS SESSION LOAD -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-blue-50/80 p-4 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-black text-blue-900 uppercase tracking-wider block">Session Load (sRPE)</span>
                        <span class="text-xs text-blue-700 font-semibold">Formula: Skala RPE × Durasi</span>
                    </div>
                    <input type="text" id="rpe-srpe-display" readonly value="450 AU" class="w-32 text-right font-mono font-black text-xl text-blue-950 bg-transparent focus:outline-none">
                </div>

                <div class="flex items-end justify-end">
                    <button type="submit" class="w-full bg-blue-900 hover:bg-blue-950 text-white py-4 px-8 rounded-2xl font-black text-xs shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <i class="fa-solid fa-floppy-disk"></i> Simpan Laporan RPE
                    </button>
                </div>
            </div>
        </form>
    </div>

    <!-- RIWAYAT LAPORAN RPE ATLET -->
    <div class="bg-white rounded-[28px] border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 class="font-black text-slate-800 text-sm font-display flex items-center gap-2">
                <i class="fa-solid fa-clock-rotate-left text-blue-900"></i> Riwayat Input RPE Personal
            </h4>
            <span class="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-xl text-xs font-black">
                ${state.rpeLogs.filter(r => String(r.atletId) === String(at.id)).length} Catatan
            </span>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[600px]">
                <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <tr>
                        <th class="p-4">Tanggal Sesi</th>
                        <th class="p-4 text-center">Skala RPE</th>
                        <th class="p-4 text-center">Durasi</th>
                        <th class="p-4 text-center">Max HR</th>
                        <th class="p-4 text-center">Beban Sesi (sRPE)</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs font-semibold">
                    ${state.rpeLogs.filter(r => String(r.atletId) === String(at.id)).length > 0 ? 
                        state.rpeLogs.filter(r => String(r.atletId) === String(at.id)).map(r => `
                            <tr class="hover:bg-slate-50/80 transition-colors">
                                <td class="p-4 font-mono font-bold text-slate-600">${r.tanggal || '-'}</td>
                                <td class="p-4 text-center font-black text-amber-700">RPE ${r.rpeVal}/10</td>
                                <td class="p-4 text-center font-mono font-bold text-slate-700">${r.durasi || 0} mnt</td>
                                <td class="p-4 text-center font-mono font-bold text-rose-600">${r.hrMax ? r.hrMax + ' BPM' : '-'}</td>
                                <td class="p-4 text-center font-mono font-black text-blue-900">${r.sRPE || 0} AU</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="5" class="p-6 text-center text-slate-400 italic">Belum ada riwayat beban latihan yang dilaporkan.</td>
                            </tr>
                        `
                    }
                </tbody>
            </table>
        </div>
    </div>
</div>
`;

setTimeout(updateRealtimeSRPE, 50);
    } else {
        if(pageTitle) pageTitle.innerText = "Modul";
        if (container) container.innerHTML = `<div class="bg-white p-12 rounded-[28px] border text-center">...</div>`;
}
setTimeout(() => {
        renderChartsForMenu(state.currentMenu);
    }, 50);

}

