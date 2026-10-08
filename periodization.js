function updatePeriodisasiConfig(e) {
    if (e && e.preventDefault) e.preventDefault();
    const startElem = document.getElementById('periodisasi-start-date');
    const totalWeeksElem = document.getElementById('periodisasi-total-weeks');

    if (startElem) state.periodisasiConfig.startDate = startElem.value;
    if (totalWeeksElem) state.periodisasiConfig.totalWeeks = parseInt(totalWeeksElem.value) || 12;

    saveStorage('periodisasi', state.periodisasiConfig);
    renderContent();
    showToast('Siklus periodisasi latihan berhasil diperbarui!', 'success');
}

function generateDynamicPeriodisasi(startDateStr, totalWeeks) {
    const list = [];
    if (!startDateStr || !totalWeeks) return list;

    let start = new Date(startDateStr);

    for (let i = 1; i <= totalWeeks; i++) {
        let end = new Date(start);
        end.setDate(end.getDate() + 6);

        const dateRangeStr = `${start.getDate()} ${start.toLocaleString('id-ID', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('id-ID', { month: 'short' })} ${end.getFullYear()}`;
        const ratio = i / totalWeeks;

        let faseUtama = "";
        let subFase = "";
        let faseBadge = "";
        let badgeBg = "";
        let volPct = 50, intPct = 50;
        let volLbl = "Sedang", intLbl = "Sedang";
        let hrTarget = "";
        
        // Rincian 3 Pilar Latihan Floorball
        let fokusFisik = "";
        let fokusTeknik = "";
        let fokusTaktik = "";

        // ==============================================================
        // 1. TAHAP PERSIAPAN UMUM (TPU)
        // ==============================================================
        if (ratio <= 0.15) {
            faseUtama = "Persiapan Umum (TPU)";
            subFase = "Adaptasi Anatomi (AA) & Aerobik Dasar";
            faseBadge = "TPU - AA";
            badgeBg = "bg-sky-50 text-sky-800 border-sky-300";
            volPct = Math.min(95, 75 + (i * 3));
            intPct = 50 + (i * 2);
            volLbl = "Sangat Tinggi"; intLbl = "Rendah - Sedang";
            hrTarget = "120–140 BPM";
            
            fokusFisik = "Sirkuit beban ringan (40-60% 1RM), fleksibilitas sendi, continuous run Zona 2.";
            fokusTeknik = "Mekanika stance & grip rendah, stationary passing (5-10m), ball handling angka 8.";
            fokusTaktik = "Pengenalan formasi dasar (2-1-2 / 2-2-1) & zona penempatan posisi di gelanggang.";
        } else if (ratio <= 0.30) {
            faseUtama = "Persiapan Umum (TPU)";
            subFase = "Hipertrofi & Ketahanan Otot (Endurance-Strength)";
            faseBadge = "TPU - Hipertrofi";
            badgeBg = "bg-blue-50 text-blue-900 border-blue-300";
            volPct = 85;
            intPct = 65;
            volLbl = "Tinggi"; intLbl = "Sedang";
            hrTarget = "135–155 BPM";
            
            fokusFisik = "Latihan beban compound (Squat/RDL/Row 65%), kapasitas aerobik MAS.";
            fokusTeknik = "Wall-pass dinamis, forehand/backhand reception bola pantul, wrist shot statis.";
            fokusTaktik = "Aturan resmi IFF, koordinasi dasar antar-lini pemain, komunikasi lapangan.";
        }
        // ==============================================================
        // 2. TAHAP PERSIAPAN KHUSUS (TPK)
        // ==============================================================
        else if (ratio <= 0.48) {
            faseUtama = "Persiapan Khusus (TPK)";
            subFase = "Kekuatan Maksimal (Maximum Strength / MxS)";
            faseBadge = "TPK - MxS";
            badgeBg = "bg-indigo-50 text-indigo-900 border-indigo-300";
            volPct = 75;
            intPct = 85;
            volLbl = "Sedang - Tinggi"; intLbl = "Tinggi";
            hrTarget = "155–175 BPM";
            
            fokusFisik = "Beban gym 80-85% 1RM (Trap Bar, Back Squat) untuk rekrutmen serat otot cepat.";
            fokusTeknik = "Dribble slalom cone kecepatan tinggi (head-up), passing diagonal saat sprint.";
            fokusTaktik = "Breakout dari pertahanan ke transisi serang, duel 1 vs 1 di pinggir rink (wall battle).";
        } else if (ratio <= 0.65) {
            faseUtama = "Persiapan Khusus (TPK)";
            subFase = "Konversi ke Power & Anaerobic RSA";
            faseBadge = "TPK - Power & RSA";
            badgeBg = "bg-emerald-50 text-emerald-900 border-emerald-300";
            volPct = 65;
            intPct = 90;
            volLbl = "Sedang"; intLbl = "Tinggi";
            hrTarget = "165–185 BPM";
            
            fokusFisik = "Pliometrik loncatan (box jump), rotasi eksplosif bola medis, interval lari RSA (6x20m).";
            fokusTeknik = "Drag shot lari bertenaga penuh, one-timer slap shot, lemparan cepat kiper (outlet pass).";
            fokusTaktik = "Forechecking agresif (1-2-2), transisi cepat, rotasi bertahan kiper di area slot.";
        }
        // ==============================================================
        // 3. PRA-KOMPETISI (K1)
        // ==============================================================
        else if (ratio <= 0.85) {
            faseUtama = "Pra-Kompetisi (K1)";
            subFase = "SAQ (Speed, Agility) & Taktik Match";
            faseBadge = "Pra-Kompetisi";
            badgeBg = "bg-amber-50 text-amber-900 border-amber-300";
            volPct = 50;
            intPct = 95;
            volLbl = "Sedang - Rendah"; intLbl = "Sangat Tinggi";
            hrTarget = "170–190 BPM";
            
            fokusFisik = "SAQ (kecepatan langkah awal 0-5m, change of direction), pemeliharaan daya ledak.";
            fokusTeknik = "Passing & shooting di bawah tekanan benturan lawan, tip-in & deflection di depan gawang.";
            fokusTaktik = "Taktik Power Play (5v4) & Box Play (4v5), simulasi pergantian shift 45 detik, laga uji coba.";
        }
        // ==============================================================
        // 4. KOMPETISI UTAMA (K2)
        // ==============================================================
        else if (ratio <= 0.95) {
            faseUtama = "Kompetisi Utama (K2)";
            subFase = "Tapering, Peaking & Evaluasi Taktik";
            faseBadge = "Kompetisi Utama";
            badgeBg = "bg-rose-50 text-rose-900 border-rose-300";
            volPct = 35;
            intPct = 100;
            volLbl = "Rendah (Tapering)"; intLbl = "Maksimal";
            hrTarget = "175–195 BPM";
            
            fokusFisik = "Tapering (volume turun 60%), pemanasan dinamis, aktivasi otot penstabil sendi.";
            fokusTeknik = "Penyelesaian akhir (finishing), presisi penalti shootout, eksekusi free-hit dekat gawang.";
            fokusTaktik = "Penyesuaian strategi menghadapi lawan spesifik turnamen, kekompakan komunikasi tim.";
        }
        // ==============================================================
        // 5. TRANSISI
        // ==============================================================
        else {
            faseUtama = "Transisi / Pemulihan";
            subFase = "Active Recovery & Fisiologis";
            faseBadge = "Transisi";
            badgeBg = "bg-slate-100 text-slate-700 border-slate-300";
            volPct = 30;
            intPct = 35;
            volLbl = "Sangat Rendah"; intLbl = "Rendah";
            hrTarget = "110–130 BPM";
            
            fokusFisik = "Active recovery (renang santai/bersepeda), pelepasan asam laktat dengan foam rolling.";
            fokusTeknik = "Bebas dari drill stickhandling intensif, latihan mobilitas ringan.";
            fokusTaktik = "Evaluasi menyeluruh musim pertandingan, pemulihan mental bertanding atlet.";
        }

        list.push({
            mingguKe: i,
            rentangTanggal: dateRangeStr,
            fase: faseBadge,
            faseUtama,
            subFase,
            faseBadge,
            badgeBg,
            faseCode: (ratio <= 0.30) ? "AA" : (ratio <= 0.65) ? "MxS" : "SAQ",
            volumePct: volPct,
            volumeLabel: volLbl,
            intensitasPct: intPct,
            intensitasLabel: intLbl,
            hrTarget,
            fokusFisik,
            fokusTeknik,
            fokusTaktik,
            mikrosiklus: `Mikro ${i}`
        });

        start.setDate(start.getDate() + 7);
    }

    return list;
}

function changeProgramAtlet(val) {
    state.selectedProgramAtlet = String(val);
    updateProgramLatihanUI();
}

function changeProgramWeek(val) {
    state.selectedProgramWeek = parseInt(val);
    updateProgramLatihanUI();
}

function updateProgramLatihanUI() {
    const area = document.getElementById('program-result-area');
    if (!area) return;

    let atlet = state.atlet.find(a => String(a.id) === String(state.selectedProgramAtlet));
    if (!atlet && state.atlet.length > 0) atlet = state.atlet[0];
    if (!atlet) return;

    const listMikro = generateDynamicPeriodisasi(state.periodisasiConfig.startDate, state.periodisasiConfig.totalWeeks);
    const currentMikro = listMikro.find(m => m.mingguKe === state.selectedProgramWeek) || listMikro[0];

    // 1. Ambil data tes fisik atlet (otomatis utamakan Post, lalu Mid, lalu Pre)
    const myTes = state.tesFisik.filter(t => String(t.atletId) === String(atlet.id));
    const getSkorTerbaru = (key) => {
        const post = myTes.find(t => t.keyTes === key && t.tahap === 'Post');
        if (post) return parseFloat(post.skor);
        const mid = myTes.find(t => t.keyTes === key && t.tahap === 'Mid');
        if (mid) return parseFloat(mid.skor);
        const pre = myTes.find(t => t.keyTes === key);
        return pre ? parseFloat(pre.skor) : null;
    };

    const vo2max = getSkorTerbaru('yoyo');
    const ttest = getSkorTerbaru('ttest');
    const sprint20 = getSkorTerbaru('sprint20');
    const plank = getSkorTerbaru('plank');
    const statusCedera = (atlet.cedera && atlet.cedera !== 'Tidak ada') ? atlet.cedera : null;

    // 2. Ambil template dasar fase
    const templateBase = menuLatihanHarian[currentMikro.faseCode] || menuLatihanHarian["AA"];

    // 3. Modifikasi adaptif harian mengikuti tes fisik & status cedera
    const jadwalSpesifik = templateBase.map(j => {
        let warmUp = j.warmUp;
        let inti = j.inti;
        let coolDown = j.coolDown;

        if (j.durasi === '0 mnt') return { ...j, warmUp, inti, coolDown };

        // --- ADAPTASI TES FISIK ---
        if (vo2max) {
            const paceEst = (60 / (vo2max / 3.5 * 0.75)).toFixed(2);
            if (vo2max < 45) {
                inti += `\n• [Koreksi VO2Max ${vo2max}]: Fokus Zona 2 (Aerobic Base), pace lari diatur ${paceEst} mnt/km.`;
            } else if (vo2max >= 54) {
                inti += `\n• [Koreksi VO2Max ${vo2max} (SB)]: Kapasitas prima, boleh tempo run / interval MAS.`;
            }
        }

        if (ttest && ttest > 11.5) {
            warmUp += ` (+5 mnt ladder drill & ankle control karena T-Test ${ttest}s).`;
            inti += `\n• [Koreksi Agility]: Tambahkan 3 set drill kelincahan ganti arah cone 5m.`;
        }

        if (plank && plank < 90) {
            inti += `\n• [Koreksi Core]: Plank rendah (${plank}s), ganti beban rotasi berat ke deadbug stabil.`;
        }

        // --- KHUSUS KIPER (GK) ---
        if (atlet.posisi === 'GK') {
            warmUp = `[Kiper] Mobilitas panggul (adductor flow), knee slide di lantai, dan reaksi bola tenis.`;
            if (j.hari === 'Senin') inti = `• [Kiper] Reaksi tembakan dekat (3-5m), recovery kneeling, drill fleksibilitas panggul.`;
            else if (j.hari === 'Rabu') inti = `• [Kiper] Rebound slot area gawang, lemparan outlet pass presisi ke FL/FR.`;
            else if (j.hari === 'Jumat') inti = `• [Kiper] Pliometrik panggul (kneeling jump ke kuda-kuda), lateral shuffle 30 dtk.`;
            coolDown = `[Kiper] Deep stretch paha dalam, selangkangan, dan kompres es sendi lutut.`;
        }

        // --- ADAPTASI STATUS CEDERA ---
        if (statusCedera) {
            const cLower = statusCedera.toLowerCase();
            if (cLower.includes('ankle') || cLower.includes('lutut') || cLower.includes('sprain') || cLower.includes('knee')) {
                inti = inti.replace(/box jump/gi, 'Step-Up Rendah (Tanpa Benturan)')
                           .replace(/sprint/gi, 'Jogging Ringan / Sepeda Statis')
                           .replace(/depth jump/gi, 'Isometric Wall-Sit');
                warmUp += ` [Pakai knee/ankle brace, hindari loncatan eksplosif].`;
                coolDown += ` [Kompres es pada ${escapeHTML(statusCedera)}].`;
            }
            if (cLower.includes('pinggang') || cLower.includes('back') || cLower.includes('hamstring')) {
                inti = inti.replace(/deadlift/gi, 'Glute Bridge Bodyweight')
                           .replace(/back squat/gi, 'Goblet Squat Ringan');
            }
            if (cLower.includes('bahu') || cLower.includes('shoulder') || cLower.includes('wrist')) {
                inti = inti.replace(/bench press/gi, 'Push-Up Incline Tembok')
                           .replace(/slap shot/gi, 'Passing Datar Ringan (No Slap)');
            }
        }

        return { ...j, warmUp, inti, coolDown };
    });

    const noteMedis = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <!-- KARTU STATUS ADAPTASI TES FISIK -->
            <div class="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs shadow-sm space-y-1">
                <span class="font-black uppercase tracking-wider text-[10px] text-blue-700 block flex items-center gap-1.5">
                    <i class="fa-solid fa-square-poll-vertical"></i> Baseline Fisik Terkini (Terkoreksi Otomatis)
                </span>
                <p class="font-bold">
                    VO2Max: <strong class="text-blue-900 font-black">${vo2max ? vo2max + ' ml/kg/m' : 'Belum Tes'}</strong> | 
                    T-Test: <strong class="text-blue-900 font-black">${ttest ? ttest + 's' : '-'}</strong> | 
                    Plank: <strong class="text-blue-900 font-black">${plank ? plank + 's' : '-'}</strong>
                </p>
                <p class="text-[10px] text-blue-700 leading-tight">
                    *Menu latihan lari, repetisi inti, dan durasi istirahat di bawah otomatis disesuaikan dengan nilai tes atlet di atas.
                </p>
            </div>

            <!-- KARTU PERINGATAN MEDIS & CEDERA -->
            <div class="p-4 rounded-2xl ${statusCedera ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'} border text-xs shadow-sm space-y-1">
                <span class="font-black uppercase tracking-wider text-[10px] ${statusCedera ? 'text-rose-700' : 'text-emerald-700'} block flex items-center gap-1.5">
                    <i class="fa-solid ${statusCedera ? 'fa-triangle-exclamation' : 'fa-shield-heart'}"></i> Status Medis Atlet
                </span>
                <p class="font-extrabold">
                    ${statusCedera ? `Terdeteksi Cedera: <u>${escapeHTML(statusCedera)}</u>` : 'Kondisi Bugar (Fit to Train)'}
                </p>
                <p class="text-[10px] ${statusCedera ? 'text-rose-700' : 'text-emerald-700'} leading-tight">
                    ${statusCedera ? '*Gerakan eksplosif tinggi (box jump/sprint/deadlift) otomatis dialihkan ke alternatif low-impact.' : '*Atlet diizinkan menjalankan seluruh menu beban dan latihan kecepatan secara maksimal.'}
                </p>
            </div>
        </div>
    `;
		
	
    area.innerHTML = `
        <div class="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-xl mb-6">
            <!-- HEADER PROFIL ATLET -->
            <div class="flex justify-between items-start sm:items-center mb-6 flex-wrap gap-4 pb-5 border-b border-slate-100">
                <div>
                    <span class="text-[10px] font-black uppercase text-blue-900 tracking-wider block mb-1">PROGRAM WORKOUT HARIAN (WARMING UP, INTI, COOLING DOWN)</span>
                    <h4 class="font-black text-slate-900 text-2xl font-display tracking-tight flex items-center gap-2">
                        ${escapeHTML(atlet.nama)}
                        <span class="text-xs font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl shadow-sm">${escapeHTML(atlet.posisi)}</span>
                    </h4>
                </div>
                <div class="flex flex-col sm:items-end">
                    <span class="${currentMikro.badgeBg} border px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm inline-block">
                        Minggu Ke-${state.selectedProgramWeek}: ${currentMikro.faseBadge}
                    </span>
                    <span class="text-[11px] font-bold text-slate-400 mt-1">${currentMikro.subFase}</span>
                </div>
            </div>

            ${noteMedis}

            <!-- 4 KARTU PARAMETER BEBAN MIKROSIKLUS -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div class="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl shadow-sm">
                    <span class="block text-[10px] text-blue-800 font-black uppercase tracking-wider mb-0.5">Volume Latihan</span>
                    <strong class="text-blue-950 font-black text-base">${currentMikro.volumeLabel} (${currentMikro.volumePct}%)</strong>
                </div>
                <div class="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl shadow-sm">
                    <span class="block text-[10px] text-rose-700 font-black uppercase tracking-wider mb-0.5">Intensitas Latihan</span>
                    <strong class="text-rose-950 font-black text-base">${currentMikro.intensitasLabel} (${currentMikro.intensitasPct}%)</strong>
                </div>
                <div class="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl shadow-sm">
                    <span class="block text-[10px] text-amber-800 font-black uppercase tracking-wider mb-0.5">Target Heart Rate</span>
                    <strong class="text-amber-950 font-black text-base">${currentMikro.hrTarget}</strong>
                </div>
                <div class="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl shadow-sm">
                    <span class="block text-[10px] text-purple-800 font-black uppercase tracking-wider mb-0.5">Fase Biomotorik</span>
                    <strong class="text-purple-950 font-black text-base">${currentMikro.faseCode}</strong>
                </div>
            </div>

            <!-- TABEL JADWAL HARIAN 3 SESI LENGKAP -->
            <div class="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm">
                <div class="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <h5 class="font-black text-xs uppercase tracking-wider flex items-center gap-2 font-display">
                        <i class="fa-solid fa-calendar-week text-cyan-400"></i> Preskripsi Harian: Pemanasan, Latihan Inti & Pendinginan
                    </h5>
                    <span class="text-[10px] font-extrabold text-cyan-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                        7 Hari Terstruktur
                    </span>
                </div>
                
                <table class="w-full text-left border-collapse min-w-[850px]">
                    <thead class="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <tr>
                            <th class="p-3.5 w-24">Hari</th>
                            <th class="p-3.5 w-44">Sesi Focus</th>
                            <th class="p-3.5 min-w-[380px]">Materi & Rincian Drill Latihan</th>
                            <th class="p-3.5 text-center w-24">Durasi</th>
                            <th class="p-3.5 text-center w-28">Target RPE</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-xs font-semibold bg-white">
                        ${jadwalSpesifik.map(j => {
    // Memecah teks latihan inti berdasarkan pemisah "•" agar menjadi baris kartu rapi
    const listInti = j.inti ? j.inti.split('•').map(s => s.trim()).filter(Boolean) : [];

    return `
        <tr class="hover:bg-slate-50/60 transition-colors align-top border-b border-slate-100">
            <!-- 1. HARI -->
            <td class="p-4 bg-slate-50/40">
                <span class="font-black text-slate-900 text-sm block">${j.hari}</span>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Sesi Harian</span>
            </td>

            <!-- 2. SESI FOCUS -->
            <td class="p-4">
                <span class="font-extrabold text-slate-800 text-xs leading-snug block">${j.sesi}</span>
            </td>

            <!-- 3. MATERI & RINCIAN DRILL LATIHAN -->
            <td class="p-4 space-y-2.5">
                ${j.durasi !== '0 mnt' ? `
                    <!-- WARMING UP -->
                    <div class="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 shadow-xs">
                        <div class="flex items-center gap-1.5 mb-1">
                            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span class="text-[10px] font-black uppercase tracking-wider text-amber-900">
                                1. Pemanasan (Warming Up)
                            </span>
                        </div>
                        <p class="text-xs text-slate-700 leading-relaxed font-medium pl-3.5">${j.warmUp}</p>
                    </div>

                    <!-- LATIHAN INTI (DIPECAH JADI KARTU RAPI) -->
                    <div class="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/80 shadow-xs space-y-2">
                        <div class="flex items-center justify-between mb-1.5">
                            <div class="flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                                <span class="text-[10px] font-black uppercase tracking-wider text-blue-950">
                                    2. Latihan Inti (Main Drill)
                                </span>
                            </div>
                            <span class="text-[9px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                ${listInti.length} Drill
                            </span>
                        </div>

                        <!-- DAFTAR GERAKAN/DRILL SATU PER SATU -->
                        <div class="space-y-1.5 pl-1">
                            ${listInti.map(item => {
                                const parts = item.split('—');
                                const namaDrill = parts[0] ? parts[0].trim() : item;
                                const parameter = parts[1] ? parts[1].trim() : '';

                                return `
                                    <div class="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div class="flex items-center gap-2">
                                            <i class="fa-solid fa-angle-right text-blue-500 text-[10px]"></i>
                                            <span class="font-bold text-slate-800 text-xs">${namaDrill}</span>
                                        </div>
                                        ${parameter ? `
                                            <div class="flex items-center gap-1.5 flex-wrap">
                                                <span class="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                                                    ${parameter}
                                                </span>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- COOLING DOWN -->
                    <div class="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 shadow-xs">
                        <div class="flex items-center gap-1.5 mb-1">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span class="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                                3. Pendinginan (Cooling Down)
                            </span>
                        </div>
                        <p class="text-xs text-slate-700 leading-relaxed font-medium pl-3.5">${j.coolDown}</p>
                    </div>
                ` : `
                    <div class="p-4 rounded-2xl bg-slate-50 text-slate-500 italic text-center border border-slate-200 font-semibold text-xs">
                        ${j.inti}
                    </div>
                `}
            </td>

            <!-- 4. DURASI -->
            <td class="p-4 text-center font-mono font-black text-slate-600 text-xs">
                ${j.durasi}
            </td>

            <!-- 5. TARGET RPE -->
            <td class="p-4 text-center">
                <span class="bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl font-mono font-black text-[11px] whitespace-nowrap shadow-xs inline-block">
                    RPE ${j.rpeTarget}/10
                </span>
            </td>
        </tr>
    `;
}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

