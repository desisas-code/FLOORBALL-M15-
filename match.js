function initMatchPlayerStats() {
    state.atlet.forEach(a => {
        if (!state.matchLive.playerStats[a.id]) {
            state.matchLive.playerStats[a.id] = { passAcc: 0, passFail: 0, recAcc: 0, recFail: 0, shootAcc: 0, foul: 0, dribbleTime: 0 };
        }
    });
}

function recordGKStat(gkId, statType, delta = 1) {
    if (!gkId) {
        showToast("Pilih Kiper aktif terlebih dahulu!", "error");
        return;
    }
    
    if (!state.matchLive.gkStats) state.matchLive.gkStats = {};
    if (!state.matchLive.gkStats[gkId]) {
        state.matchLive.gkStats[gkId] = { saves: 0, goalsConceded: 0, outletAcc: 0, outletFail: 0 };
    }

    const gk = state.matchLive.gkStats[gkId];
    const gkObj = state.atlet.find(a => String(a.id) === String(gkId));
    const gkNama = gkObj ? gkObj.nama.split(' ')[0] : 'GK';

    if (statType === 'saves') {
        gk.saves = Math.max(0, gk.saves + delta);
    } else if (statType === 'goalsConceded') {
        gk.goalsConceded = Math.max(0, gk.goalsConceded + delta);
        if (delta > 0) {
            updateMatchScore('opponent', 1, false);
        }
    } else if (statType === 'outletAcc') {
        gk.outletAcc = Math.max(0, gk.outletAcc + delta);
    } else if (statType === 'outletFail') {
        gk.outletFail = Math.max(0, gk.outletFail + delta);
    }

    if (delta > 0) {
        const descMap = {
            saves: `Saves Gemilang!`,
            goalsConceded: `Kemasukan Gol`,
            outletAcc: `Lemparan Outlet Akurat`,
            outletFail: `Lemparan Outlet Gagal`
        };
        state.matchLive.logs.unshift({
            id: 'gk_' + Date.now(),
            time: new Date().toLocaleTimeString(),
            playerId: gkId,
            type: 'gk_action',
            desc: `[GK ${gkNama}] - ${descMap[statType]}`
        });
    }

    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
    showToast(`GK ${gkNama}: ${statType} diperbarui`, 'success');
}

function calculateGKSavePercentage(gkId) {
    const gk = state.matchLive.gkStats?.[gkId];
    if (!gk) return 0;
    const totalShotsOnTarget = gk.saves + gk.goalsConceded;
    if (totalShotsOnTarget === 0) return 0;
    return Math.round((gk.saves / totalShotsOnTarget) * 100);
}

function calculateGKOutletAccuracy(gkId) {
    const gk = state.matchLive.gkStats?.[gkId];
    if (!gk) return 0;
    const totalOutlets = gk.outletAcc + gk.outletFail;
    if (totalOutlets === 0) return 0;
    return Math.round((gk.outletAcc / totalOutlets) * 100);
}

function updateLineStats(isGoalFor) {
    const activeLine = state.matchLive.activeLine || 'Line 1';
    if (!state.matchLive.lineStats) state.matchLive.lineStats = {};
    if (!state.matchLive.lineStats[activeLine]) {
        state.matchLive.lineStats[activeLine] = { goalsFor: 0, goalsAgainst: 0, plusMinus: 0, shiftsCount: 0 };
    }

    const line = state.matchLive.lineStats[activeLine];
    if (isGoalFor) {
        line.goalsFor += 1;
    } else {
        line.goalsAgainst += 1;
    }
    line.plusMinus = line.goalsFor - line.goalsAgainst;
    saveStorage('matchLive', state.matchLive);
}

// FUNGSI SKOR BARU (MENIMPA BARIS 2374 LAMA)
function updateMatchScore(team, delta, triggerGKConceded = true) {
    if (team === 'team') {
        state.matchLive.scoreTeam = Math.max(0, (state.matchLive.scoreTeam || 0) + delta);
        if (delta > 0) updateLineStats(true);
    } else {
        state.matchLive.scoreOpponent = Math.max(0, (state.matchLive.scoreOpponent || 0) + delta);
        if (delta > 0) {
            updateLineStats(false);
            if (triggerGKConceded && state.matchLive.activeGKId) {
                if (!state.matchLive.gkStats) state.matchLive.gkStats = {};
                if (!state.matchLive.gkStats[state.matchLive.activeGKId]) {
                    state.matchLive.gkStats[state.matchLive.activeGKId] = { saves: 0, goalsConceded: 0, outletAcc: 0, outletFail: 0 };
                }
                state.matchLive.gkStats[state.matchLive.activeGKId].goalsConceded += 1;
            }
        }
    }
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
}

function updateMatchFoul(team, delta) {
    if (team === 'team') {
        state.matchLive.foulTeam = Math.max(0, (state.matchLive.foulTeam || 0) + delta);
    } else {
        state.matchLive.foulOpponent = Math.max(0, (state.matchLive.foulOpponent || 0) + delta);
    }
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
}

function setMatchPeriod(period) {
    state.matchLive.period = period;
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
    showToast(`Babak diubah ke: ${period}`, 'success');
}

function toggleMatchTimer() {
    if (!state.matchLive.matchTimer) {
        state.matchLive.matchTimer = { isRunning: false, startTime: null, intervalId: null, elapsedSec: 0 };
    }
    const timer = state.matchLive.matchTimer;

    if (!timer.isRunning) {
        timer.isRunning = true;
        timer.startTime = Date.now() - (timer.elapsedSec * 1000);
        timer.intervalId = setInterval(() => {
            timer.elapsedSec = Math.floor((Date.now() - timer.startTime) / 1000);
            const timerElem = document.getElementById('match-timer-display');
            if (timerElem) {
                const m = Math.floor(timer.elapsedSec / 60).toString().padStart(2, '0');
                const s = (timer.elapsedSec % 60).toString().padStart(2, '0');
                timerElem.innerText = `${m}:${s}`;
            }
        }, 200);
        showToast(`Waktu Pertandingan Dimulai...`, 'loading');
    } else {
        clearInterval(timer.intervalId);
        timer.isRunning = false;
        saveStorage('matchLive', state.matchLive);
        renderMatchLiveUI();
        showToast(`Waktu Pertandingan Dihentikan`, 'success');
    }
    renderMatchLiveUI();
}

function resetMatchTimer() {
    if (state.matchLive.matchTimer) {
        if (state.matchLive.matchTimer.intervalId) clearInterval(state.matchLive.matchTimer.intervalId);
        state.matchLive.matchTimer = { isRunning: false, startTime: null, intervalId: null, elapsedSec: 0 };
    }
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
    showToast(`Timer Pertandingan Di-reset`, 'success');
}

function switchMatchLine(lineName) {
    state.matchLive.activeLine = lineName;
    const currentLinePlayers = state.matchLive.lines[lineName];
    const firstPlayerInLine = Object.values(currentLinePlayers).find(id => id !== '');
    if (firstPlayerInLine) state.matchLive.activePlayerId = firstPlayerInLine;
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
    showToast(`Rotasi Aktif: ${lineName}`, 'success');
}

function updateLinePlayer(lineName, pos, playerId) {
    state.matchLive.lines[lineName][pos] = playerId;
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
}

function switchActiveGK(gkId) {
    state.matchLive.activeGKId = gkId;
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
}

function selectActiveMatchPlayer(playerId) {
    state.matchLive.activePlayerId = playerId;
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
}

function setSpatialEventType(type) {
    state.matchLive.activeSpatialEventType = type;
    renderMatchLiveUI();
}

function handleCourtClick(e) {
    const court = e.currentTarget;
    const rect = court.getBoundingClientRect();
    
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    const x = Math.round(((clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((clientY - rect.top) / rect.height) * 100);

    const activePlayer = state.atlet.find(a => a.id === state.matchLive.activePlayerId);
    if (!activePlayer) return;

    const typeNames = { loss: 'Kehilangan Bola', intercept: 'Cut Bola', shoot_att: 'Percobaan Shoot' };
    
    // SAMAKAN SATU ID UNTUK KEDUA DATA
    const sharedId = 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

    state.matchLive.spatialEvents.unshift({
        id: sharedId, 
        x, y, 
        type: state.matchLive.activeSpatialEventType,
        playerId: activePlayer.id, 
        timestamp: new Date().toLocaleTimeString()
    });

    state.matchLive.logs.unshift({
        id: sharedId, 
        time: new Date().toLocaleTimeString(),
        playerId: activePlayer.id, 
        type: 'spatial', 
        desc: `[Spatial] ${escapeHTML(activePlayer.nama)} - ${typeNames[state.matchLive.activeSpatialEventType]} di (${x}%, ${y}%)`
    });

    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
    renderMatchHeatmap();
    showToast(`Event dicatat untuk ${escapeHTML(activePlayer.nama)}!`, 'success');
}

function renderMatchHeatmap() {
    const container = document.getElementById('court-heatmap-layer');
    if (!container || typeof h337 === 'undefined') return;

    // 1. Bersihkan layer container sebelum membuat heatmap baru
    container.innerHTML = '';
    matchHeatmapInstance = null;

    // 2. Buat instance baru secara bersih
    matchHeatmapInstance = h337.create({
        container: container,
        radius: 20,
        maxOpacity: 0.6,
        minOpacity: 0.1,
        blur: 0.75
    });

    const points = (state.matchLive.spatialEvents || []).map(ev => ({
        x: Math.round((ev.x / 100) * container.offsetWidth),
        y: Math.round((ev.y / 100) * container.offsetHeight),
        value: 1
    }));

    matchHeatmapInstance.setData({
        max: 3,
        data: points
    });
}

function recordMatchStat(statType) {
    const playerId = state.matchLive.activePlayerId;
    const player = state.atlet.find(a => a.id === playerId);
    if (!player) return;

    const stats = state.matchLive.playerStats[playerId];
    let desc = '';
    if (statType === 'passAcc') { stats.passAcc++; desc = 'Passing Akurat'; }
    else if (statType === 'passFail') { stats.passFail++; desc = 'Passing Gagal'; }
    else if (statType === 'recAcc') { stats.recAcc++; desc = 'Receiving Berhasil'; }
    else if (statType === 'recFail') { stats.recFail++; desc = 'Receiving Gagal'; }
    else if (statType === 'shootAcc') { 
        stats.shootAcc++; 
        desc = 'Shoot Berhasil/Goal'; 
        state.matchLive.scoreTeam = (state.matchLive.scoreTeam || 0) + 1;
    }
    else if (statType === 'foul') {
        stats.foul = (stats.foul || 0) + 1;
        state.matchLive.foulTeam = (state.matchLive.foulTeam || 0) + 1;
        desc = 'Pelanggaran (Foul)';
    }

    state.matchLive.logs.unshift({
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4), time: new Date().toLocaleTimeString(),
        playerId, type: 'action', desc: `${escapeHTML(player.nama)} - ${desc}`
    });

    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
    showToast(`Statistik ${desc} +1 (${escapeHTML(player.nama)})`, 'success');
}

function decrementMatchStat(e, statType) {
    if (e && e.stopPropagation) e.stopPropagation();
    const playerId = state.matchLive.activePlayerId;
    const player = state.atlet.find(a => a.id === playerId);
    if (!player) return;

    const stats = state.matchLive.playerStats[playerId];
    let desc = '';
    if (statType === 'passAcc' && stats.passAcc > 0) { stats.passAcc--; desc = 'Passing Akurat'; }
    else if (statType === 'passFail' && stats.passFail > 0) { stats.passFail--; desc = 'Passing Gagal'; }
    else if (statType === 'recAcc' && stats.recAcc > 0) { stats.recAcc--; desc = 'Receiving Berhasil'; }
    else if (statType === 'recFail' && stats.recFail > 0) { stats.recFail--; desc = 'Receiving Gagal'; }
    else if (statType === 'shootAcc' && stats.shootAcc > 0) { 
        stats.shootAcc--; 
        desc = 'Shoot Berhasil'; 
        state.matchLive.scoreTeam = Math.max(0, (state.matchLive.scoreTeam || 0) - 1);
    }
    else if (statType === 'foul' && stats.foul > 0) {
        stats.foul--;
        state.matchLive.foulTeam = Math.max(0, (state.matchLive.foulTeam || 0) - 1);
        desc = 'Pelanggaran (Foul)';
    }
    else return;

    state.matchLive.logs.unshift({
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4), time: new Date().toLocaleTimeString(),
        playerId, type: 'action', desc: `[Koreksi -1] ${escapeHTML(player.nama)} - ${desc}`
    });

    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
    showToast(`Dikurangi -1 (${escapeHTML(player.nama)})`, 'error');
}

function deleteMatchLog(logId) {
    state.matchLive.logs = state.matchLive.logs.filter(l => l.id !== logId);
    state.matchLive.spatialEvents = state.matchLive.spatialEvents.filter(ev => ev.id !== logId);
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
    showToast('Log aktivitas dihapus', 'success');
}

function deleteSpatialEvent(id) {
    // Hapus dari data lapangan dan dari riwayat log
    state.matchLive.spatialEvents = (state.matchLive.spatialEvents || []).filter(ev => ev.id !== id);
    state.matchLive.logs = (state.matchLive.logs || []).filter(l => l.id !== id);
    
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
    renderMatchHeatmap();
    showToast('Penanda lapangan berhasil dihapus!', 'success');
}

function toggleDribbleTimer() {
    const timer = state.matchLive.dribbleTimer;
    const playerId = state.matchLive.activePlayerId;
    const player = state.atlet.find(a => a.id === playerId);

    if (!timer.isRunning) {
        timer.isRunning = true;
        timer.startTime = Date.now();
        timer.intervalId = setInterval(() => {
            timer.elapsedSec = Math.floor((Date.now() - timer.startTime) / 1000);
            const timerElem = document.getElementById('dribble-display-seconds');
            if (timerElem) timerElem.innerText = `${timer.elapsedSec}s`;
        }, 200);
        showToast(`Timer Dribble dimulai...`, 'loading');
    } else {
        clearInterval(timer.intervalId);
        timer.isRunning = false;
        state.matchLive.playerStats[playerId].dribbleTime += timer.elapsedSec;
        state.matchLive.logs.unshift({
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4), time: new Date().toLocaleTimeString(),
            playerId, type: 'dribble', desc: `${escapeHTML(player.nama)} - Dribble bola selama ${timer.elapsedSec} detik`
        });
        timer.elapsedSec = 0;
        saveStorage('matchLive', state.matchLive);
        renderMatchLiveUI();
        showToast(`Dribble dicatat!`, 'success');
    }
    renderMatchLiveUI();
}

async function saveMatchAnalysis() {
    const isConfirmed = await confirmAction('Simpan Match', 'Simpan analisis match live dan simpan ke memori?');
    if (!isConfirmed) return;

    saveStorage('matchLive', state.matchLive);
    showToast('Hasil analisis berhasil disimpan!', 'success');
}

async function clearMatchData(askConfirmation = true) {
    if (askConfirmation) {
        const isConfirmed = await confirmAction('Reset Statistik', 'Kosongkan statistik dan marker lapangan?');
        if (!isConfirmed) return;
    }
    state.matchLive.spatialEvents = [];
    state.matchLive.logs = [];
    state.matchLive.scoreTeam = 0;
    state.matchLive.scoreOpponent = 0;
    state.matchLive.foulTeam = 0;
    state.matchLive.foulOpponent = 0;
    state.matchLive.period = 'Babak 1';
    
    if (state.matchLive.dribbleTimer.intervalId) clearInterval(state.matchLive.dribbleTimer.intervalId);
    state.matchLive.dribbleTimer.isRunning = false;
    state.matchLive.dribbleTimer.elapsedSec = 0;

    if (state.matchLive.matchTimer && state.matchLive.matchTimer.intervalId) clearInterval(state.matchLive.matchTimer.intervalId);
    state.matchLive.matchTimer = { isRunning: false, startTime: null, intervalId: null, elapsedSec: 0 };

    initMatchPlayerStats();
    saveStorage('matchLive', state.matchLive);
    renderMatchLiveUI();
    if (askConfirmation) showToast('Data statistik pertandingan berhasil di-reset!', 'success');
}

function renderMatchLiveUI() {
    const container = document.getElementById('main-container');
    if (!container) return;

    const lineNames = ['Line 1', 'Line 2', 'Line 3', 'Line 4'];
    const activeLineObj = state.matchLive.lines[state.matchLive.activeLine] || {};
    const positions = ['FL', 'FR', 'C', 'DL', 'DR'];
    const activeOnCourtPlayerIds = [...Object.values(activeLineObj).filter(id => id !== ''), state.matchLive.activeGKId];
    const activePlayer = state.atlet.find(a => String(a.id) === String(state.matchLive.activePlayerId)) || state.atlet[0] || { id: '1', nama: 'Default' };
    const activeStats = state.matchLive.playerStats[activePlayer.id] || { passAcc:0, passFail:0, recAcc:0, recFail:0, shootAcc:0, foul:0, dribbleTime:0 };

    const matchTimer = state.matchLive.matchTimer || { isRunning: false, elapsedSec: 0 };
    const mSec = matchTimer.elapsedSec || 0;
    const timerMin = Math.floor(mSec / 60).toString().padStart(2, '0');
    const timerSec = (mSec % 60).toString().padStart(2, '0');

    const activeGKId = state.matchLive.activeGKId;
    const activeGKObj = state.atlet.find(a => String(a.id) === String(activeGKId));
    const gkStats = state.matchLive.gkStats?.[activeGKId] || { saves: 0, goalsConceded: 0, outletAcc: 0, outletFail: 0 };
    const savePct = calculateGKSavePercentage(activeGKId);

    container.innerHTML = `
        <!-- 1. KONTROL SHIFT LINEUP -->
        <div class="bg-slate-900 border border-slate-800 p-3 rounded-2xl mb-4 text-center shadow-inner">
            <span class="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-2">⚡ Shift Lineup Aktif Bertanding</span>
            <div class="grid grid-cols-3 gap-2">
                <button onclick="switchMatchLine('Line 1')" class="py-2 px-3 rounded-xl font-black text-xs transition cursor-pointer ${state.matchLive?.activeLine === 'Line 1' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">Line 1</button>
                <button onclick="switchMatchLine('Line 2')" class="py-2 px-3 rounded-xl font-black text-xs transition cursor-pointer ${state.matchLive?.activeLine === 'Line 2' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">Line 2</button>
                <button onclick="switchMatchLine('Line 3')" class="py-2 px-3 rounded-xl font-black text-xs transition cursor-pointer ${state.matchLive?.activeLine === 'Line 3' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">Line 3</button>
            </div>
        </div>

        <!-- 2. SCOREBOARD STADIUM DIGITAL -->
        <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 rounded-[32px] border border-slate-800/90 shadow-2xl mb-6 relative overflow-hidden">
            <div class="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                <div class="flex items-center gap-4">
                    <div class="text-center">
                        <span class="text-[10px] font-black uppercase text-cyan-400 tracking-widest block mb-1">TIM KITA</span>
                        <div class="text-5xl font-black text-amber-400 font-display bg-slate-900/90 px-6 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl min-w-[90px]">${state.matchLive.scoreTeam || 0}</div>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <button onclick="updateMatchScore('team', 1)" class="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-base flex items-center justify-center active:scale-95 shadow-lg shadow-emerald-600/30">+</button>
                        <button onclick="updateMatchScore('team', -1)" class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-base flex items-center justify-center active:scale-95 text-slate-300 border border-slate-700">-</button>
                    </div>
                </div>

                <div class="flex flex-col items-center gap-2 text-center">
                    <select onchange="setMatchPeriod(this.value)" class="bg-slate-800/90 text-amber-300 font-black text-xs px-4 py-1.5 rounded-xl border border-slate-700/90 focus:outline-none cursor-pointer shadow-inner">
                        <option value="Babak 1" ${state.matchLive.period === 'Babak 1' ? 'selected' : ''}>Babak 1</option>
                        <option value="Babak 2" ${state.matchLive.period === 'Babak 2' ? 'selected' : ''}>Babak 2</option>
                        <option value="Babak 3" ${state.matchLive.period === 'Babak 3' ? 'selected' : ''}>Babak 3</option>
                        <option value="Extra Time" ${state.matchLive.period === 'Extra Time' ? 'selected' : ''}>Extra Time (ET)</option>
                    </select>

                    <div class="text-4xl sm:text-5xl font-mono font-black text-white tracking-widest bg-slate-950/90 px-8 py-2 rounded-2xl border border-cyan-500/30 shadow-inner" id="match-timer-display">
                        ${timerMin}:${timerSec}
                    </div>

                    <div class="flex gap-2 mt-1">
                        <button onclick="toggleMatchTimer()" class="px-5 py-2 rounded-xl font-black text-xs shadow-lg transition-all ${matchTimer.isRunning ? 'bg-amber-400 hover:bg-amber-500 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}">
                            <i class="fa-solid ${matchTimer.isRunning ? 'fa-pause' : 'fa-play'} mr-1"></i> ${matchTimer.isRunning ? 'Pause' : 'Start'}
                        </button>
                        <button onclick="resetMatchTimer()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                        <button onclick="shareMatchToWhatsApp()" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer">
                            <i class="fa-brands fa-whatsapp text-base"></i> WA
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <div class="flex flex-col gap-1.5">
                        <button onclick="updateMatchScore('opponent', 1)" class="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-base flex items-center justify-center active:scale-95 shadow-lg shadow-emerald-600/30">+</button>
                        <button onclick="updateMatchScore('opponent', -1)" class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-base flex items-center justify-center active:scale-95 text-slate-300 border border-slate-700">-</button>
                    </div>
                    <div class="text-center">
                        <span class="text-[10px] font-black uppercase text-rose-400 tracking-widest block mb-1">LAWAN</span>
                        <div class="text-5xl font-black text-rose-400 font-display bg-slate-900/90 px-6 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl min-w-[90px]">${state.matchLive.scoreOpponent || 0}</div>
                    </div>
                </div>
            </div>

            <div class="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-around text-xs font-bold relative z-10">
                <div class="flex items-center gap-2">
                    <span class="text-slate-400 uppercase text-[10px] font-black">Foul Tim:</span>
                    <span class="text-amber-400 font-mono font-black text-sm">${state.matchLive.foulTeam || 0}</span>
                    <button onclick="updateMatchFoul('team', 1)" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-bold">+</button>
                    <button onclick="updateMatchFoul('team', -1)" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-rose-400 font-bold">-</button>
                </div>
                <div class="w-px h-4 bg-slate-800"></div>
                <div class="flex items-center gap-2">
                    <span class="text-slate-400 uppercase text-[10px] font-black">Foul Lawan:</span>
                    <span class="text-rose-400 font-mono font-black text-sm">${state.matchLive.foulOpponent || 0}</span>
                    <button onclick="updateMatchFoul('opponent', 1)" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-bold">+</button>
                    <button onclick="updateMatchFoul('opponent', -1)" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-rose-400 font-bold">-</button>
                </div>
            </div>
        </div>

        <!-- 3. ANALISIS KIPER LIVE (GK) -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white p-6 rounded-[28px] border border-slate-800 shadow-xl mb-6">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 flex-wrap gap-2">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-lg">
                        <i class="fa-solid fa-hands-capturing"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Analisis Kiper Live (GK)</span>
                        <h4 class="text-base font-black text-white font-display">${activeGKObj ? escapeHTML(activeGKObj.nama) : 'Pilih Kiper'}</h4>
                    </div>
                </div>
                
                <div class="flex items-center gap-2">
                    <span class="bg-slate-800 text-slate-300 px-3 py-1 rounded-xl text-xs font-mono font-black border border-slate-700">
                        SoT: ${gkStats.saves + gkStats.goalsConceded}
                    </span>
                    <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl text-xs font-mono font-black">
                        Save: ${savePct}%
                    </span>
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span class="text-[10px] font-black text-emerald-400 uppercase tracking-wider block mb-1">Saves</span>
                    <div class="flex items-center justify-between mt-1">
                        <span class="text-2xl font-black text-white font-mono">${gkStats.saves}</span>
                        <div class="flex gap-1">
                            <button onclick="recordGKStat('${activeGKId}', 'saves', 1)" class="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-sm active:scale-95">+</button>
                            <button onclick="recordGKStat('${activeGKId}', 'saves', -1)" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-sm text-slate-400 active:scale-95">-</button>
                        </div>
                    </div>
                </div>

                <div class="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span class="text-[10px] font-black text-rose-400 uppercase tracking-wider block mb-1">Kebobolan</span>
                    <div class="flex items-center justify-between mt-1">
                        <span class="text-2xl font-black text-rose-400 font-mono">${gkStats.goalsConceded}</span>
                        <div class="flex gap-1">
                            <button onclick="recordGKStat('${activeGKId}', 'goalsConceded', 1)" class="w-8 h-8 rounded-xl bg-rose-600 hover:bg-rose-500 font-black text-sm active:scale-95">+</button>
                            <button onclick="recordGKStat('${activeGKId}', 'goalsConceded', -1)" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-sm text-slate-400 active:scale-95">-</button>
                        </div>
                    </div>
                </div>

                <div class="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span class="text-[10px] font-black text-cyan-400 uppercase tracking-wider block mb-1">Outlet Sukses</span>
                    <div class="flex items-center justify-between mt-1">
                        <span class="text-2xl font-black text-cyan-300 font-mono">${gkStats.outletAcc}</span>
                        <div class="flex gap-1">
                            <button onclick="recordGKStat('${activeGKId}', 'outletAcc', 1)" class="w-8 h-8 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-black text-sm active:scale-95">+</button>
                            <button onclick="recordGKStat('${activeGKId}', 'outletAcc', -1)" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-sm text-slate-400 active:scale-95">-</button>
                        </div>
                    </div>
                </div>

                <div class="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between">
                    <span class="text-[10px] font-black text-amber-400 uppercase tracking-wider block mb-1">Outlet Gagal</span>
                    <div class="flex items-center justify-between mt-1">
                        <span class="text-2xl font-black text-amber-400 font-mono">${gkStats.outletFail}</span>
                        <div class="flex gap-1">
                            <button onclick="recordGKStat('${activeGKId}', 'outletFail', 1)" class="w-8 h-8 rounded-xl bg-amber-600 hover:bg-amber-500 font-black text-sm active:scale-95">+</button>
                            <button onclick="recordGKStat('${activeGKId}', 'outletFail', -1)" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-sm text-slate-400 active:scale-95">-</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. EFISIENSI SHIFT LINEUP (+/- RATING) -->
        <div class="bg-white/95 backdrop-blur-xl p-6 rounded-[28px] border border-slate-200/80 shadow-md mb-6">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h4 class="font-black text-slate-900 text-xs font-display flex items-center gap-2 uppercase tracking-wider">
                    <i class="fa-solid fa-arrows-split-up-and-left text-blue-900"></i> Efisiensi Shift Lineup (+/- Rating)
                </h4>
                <span class="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">Net Rating Live</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                ${['Line 1', 'Line 2', 'Line 3', 'Line 4'].map(lineName => {
                    const lStat = state.matchLive.lineStats?.[lineName] || { goalsFor: 0, goalsAgainst: 0, plusMinus: 0 };
                    const isCurrentActive = state.matchLive.activeLine === lineName;
                    
                    let pmBadge = 'bg-slate-100 text-slate-700 border-slate-300';
                    if (lStat.plusMinus > 0) pmBadge = 'bg-emerald-500 text-white border-emerald-600';
                    else if (lStat.plusMinus < 0) pmBadge = 'bg-rose-500 text-white border-rose-600';

                    return `
                        <div class="p-3.5 rounded-2xl border transition-all ${isCurrentActive ? 'bg-blue-50/80 border-blue-400 shadow-md' : 'bg-slate-50 border-slate-200/80'}">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[10px] font-black uppercase ${isCurrentActive ? 'text-blue-900' : 'text-slate-500'}">${lineName}</span>
                                <span class="text-[10px] font-black px-2 py-0.5 rounded-md border ${pmBadge}">
                                    ${lStat.plusMinus > 0 ? '+' : ''}${lStat.plusMinus}
                                </span>
                            </div>
                            <div class="flex items-center justify-between text-xs font-mono font-bold mt-2">
                                <span class="text-emerald-600">GF: ${lStat.goalsFor}</span>
                                <span class="text-slate-300">|</span>
                                <span class="text-rose-600">GA: ${lStat.goalsAgainst}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- 5. PANEL MANAGER LINE-UP MATCH -->
        <div class="bg-white/95 backdrop-blur-xl p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-md mb-6">
            <div class="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center flex-wrap gap-3">
                <h3 class="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2 font-display">
                    <i class="fa-solid fa-users-line text-blue-900"></i> Line-Up Rotasi Match (4 Lines & 2 GK)
                </h3>
                <div class="flex items-center gap-2">
                    <select onchange="switchActiveGK(this.value)" class="text-xs font-black p-2.5 rounded-2xl border bg-white text-blue-950 border-slate-200/90 shadow-sm">
                        ${state.atlet.filter(a => a.posisi === 'GK').map(gk => `<option value="${gk.id}" ${gk.id === state.matchLive.activeGKId ? 'selected' : ''}>${escapeHTML(gk.nama)} (GK)</option>`).join('')}
                    </select>
                    <button onclick="clearMatchData(true)" class="bg-rose-50 text-rose-600 border border-rose-200 font-black px-4 py-2.5 rounded-2xl text-xs hover:bg-rose-100 active:scale-95 transition-all"><i class="fa-solid fa-rotate-left mr-1"></i> Reset</button>
                    <button onclick="saveMatchAnalysis()" class="bg-emerald-600 text-white font-black px-5 py-2.5 rounded-2xl text-xs shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"><i class="fa-solid fa-floppy-disk mr-1"></i> Simpan Match</button>
                </div>
            </div>

            <div class="flex gap-2 mb-4">
                ${lineNames.map(line => `<button onclick="switchMatchLine('${line}')" class="flex-1 py-2.5 rounded-2xl font-black text-xs border transition-all ${state.matchLive.activeLine === line ? 'bg-blue-900 text-white border-blue-950 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'}">${line}</button>`).join('')}
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                ${positions.map(pos => `
                    <div>
                        <span class="block text-[10px] font-black text-blue-900 uppercase mb-1">${pos}</span>
                        <select onchange="updateLinePlayer('${state.matchLive.activeLine}', '${pos}', this.value)" class="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:border-blue-600">
                            <option value="">-- Kosong --</option>
                            ${state.atlet.map(a => `<option value="${a.id}" ${a.id === activeLineObj[pos] ? 'selected' : ''}>${escapeHTML(a.nama)}</option>`).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 6. LAPANGAN TAKTIS SPASIAL & CONTROLLER AKSI -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div class="lg:col-span-8 bg-white/95 backdrop-blur-xl p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-md">
                <div class="flex gap-2 mb-4">
                    <button onclick="setSpatialEventType('loss')" class="flex-1 py-2.5 rounded-2xl font-black text-xs transition-all ${state.matchLive.activeSpatialEventType === 'loss' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">Kehilangan</button>
                    <button onclick="setSpatialEventType('intercept')" class="flex-1 py-2.5 rounded-2xl font-black text-xs transition-all ${state.matchLive.activeSpatialEventType === 'intercept' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">Cut Bola</button>
                    <button onclick="setSpatialEventType('shoot_att')" class="flex-1 py-2.5 rounded-2xl font-black text-xs transition-all ${state.matchLive.activeSpatialEventType === 'shoot_att' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">Shoot</button>
                </div>

                <div onclick="handleCourtClick(event)" class="relative w-full aspect-[2/1] min-h-[220px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[580px] bg-[#0066B2] rounded-[20px] sm:rounded-[28px] lg:rounded-[34px] border-[4px] sm:border-[6px] lg:border-[8px] border-white shadow-2xl overflow-hidden cursor-crosshair">
                    <div id="court-heatmap-layer" class="absolute inset-0 pointer-events-none z-0"></div>
                    <div class="absolute inset-0 pointer-events-none z-10">
                        <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-white/90"></div>
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/90"></div>
                        <div class="absolute top-[20%] left-[15%] -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/90"></div>
                        <div class="absolute bottom-[20%] left-[15%] -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/90"></div>
                        <div class="absolute top-[20%] right-[15%] translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/90"></div>
                        <div class="absolute bottom-[20%] right-[15%] translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/90"></div>
                        <div class="absolute top-1/2 left-[8.75%] -translate-y-1/2 w-[12.5%] h-[40%] border-2 border-white bg-white/10 flex items-center justify-start">
                            <div class="w-[62.5%] h-[50%] border-2 border-white bg-rose-500/40"></div>
                        </div>
                        <div class="absolute top-1/2 right-[8.75%] -translate-y-1/2 w-[12.5%] h-[40%] border-2 border-white bg-white/10 flex items-center justify-end">
                            <div class="w-[62.5%] h-[50%] border-2 border-white bg-rose-500/40"></div>
                        </div>
                    </div>
                    <div class="relative z-20 w-full h-full pointer-events-none">
                        ${state.matchLive.spatialEvents.map(ev => `
    <div onclick="event.stopPropagation(); deleteSpatialEvent('${ev.id}')" 
         title="Klik untuk menghapus titik ini"
         class="pointer-events-auto absolute w-5 h-5 sm:w-6 sm:h-6 bg-amber-400 hover:bg-rose-500 hover:text-white cursor-pointer text-slate-900 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg -translate-x-1/2 -translate-y-1/2 border border-slate-900 transition-all hover:scale-125" 
         style="left: ${ev.x}%; top: ${ev.y}%;">
        ${escapeHTML(state.atlet.find(a => String(a.id) === String(ev.playerId))?.nama.charAt(0) || '?')}
    </div>
`).join('')}
                    </div>
                </div>
            </div>

            <div class="lg:col-span-4 bg-white/95 backdrop-blur-xl p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-md">
                <div>

                    <div class="grid grid-cols-3 gap-1.5 mb-4">
                        ${activeOnCourtPlayerIds.map(pId => {
                            const pObj = state.atlet.find(a => a.id === pId);
                            if (!pObj) return '';
                            return `<button onclick="selectActiveMatchPlayer('${pObj.id}')" class="p-2.5 rounded-2xl text-left border transition-all ${pObj.id === activePlayer.id ? 'bg-blue-50 border-blue-900 text-blue-950 font-black shadow-sm' : 'bg-slate-50 font-bold border-slate-200/80 text-slate-700 hover:bg-slate-100'}"><span class="block text-[9px] text-slate-400 uppercase font-black">${escapeHTML(pObj.posisi)}</span><span class="text-xs truncate block">${escapeHTML(pObj.nama.split(' ')[0])}</span></button>`;
                        }).join('')}
                    </div>

                    <div class="bg-slate-900 text-white p-4 rounded-2xl mb-4 flex items-center justify-between border border-slate-800 shadow-inner">
                        <div>
                            <p class="text-[10px] text-slate-400 uppercase font-black">Dribble Timer (${escapeHTML(activePlayer.nama.split(' ')[0])})</p>
                            <h5 class="text-2xl font-black text-amber-400 font-mono mt-0.5" id="dribble-display-seconds">${state.matchLive.dribbleTimer.elapsedSec}s</h5>
                        </div>
                        <button onclick="toggleDribbleTimer()" class="px-5 py-2.5 rounded-xl font-black text-xs bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition-all shadow-md shadow-emerald-500/30">${state.matchLive.dribbleTimer.isRunning ? 'Stop' : 'Start'}</button>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <div onclick="recordMatchStat('passAcc')" class="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex justify-between items-center cursor-pointer active:scale-95 transition-transform hover:bg-emerald-100/80">
                            <div><span class="block text-[9px] font-black text-emerald-600 uppercase">PASS AKURAT</span><span class="text-base font-black text-emerald-800">${activeStats.passAcc}</span></div>
                            <button onclick="decrementMatchStat(event, 'passAcc')" class="w-6 h-6 rounded-lg bg-emerald-200 text-xs font-bold text-emerald-900 hover:bg-emerald-300">-</button>
                        </div>
                        <div onclick="recordMatchStat('passFail')" class="p-3 bg-rose-50/80 border border-rose-200/80 rounded-2xl flex justify-between items-center cursor-pointer active:scale-95 transition-transform hover:bg-rose-100/80">
                            <div><span class="block text-[9px] font-black text-rose-600 uppercase">PASS GAGAL</span><span class="text-base font-black text-rose-800">${activeStats.passFail}</span></div>
                            <button onclick="decrementMatchStat(event, 'passFail')" class="w-6 h-6 rounded-lg bg-rose-200 text-xs font-bold text-rose-900 hover:bg-rose-300">-</button>
                        </div>
                        <div onclick="recordMatchStat('recAcc')" class="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex justify-between items-center cursor-pointer active:scale-95 transition-transform hover:bg-blue-100/80">
                            <div><span class="block text-[9px] font-black text-blue-600 uppercase">RECEIVING ACC</span><span class="text-base font-black text-blue-800">${activeStats.recAcc}</span></div>
                            <button onclick="decrementMatchStat(event, 'recAcc')" class="w-6 h-6 rounded-lg bg-blue-200 text-xs font-bold text-blue-900 hover:bg-blue-300">-</button>
                        </div>
                        <div onclick="recordMatchStat('recFail')" class="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex justify-between items-center cursor-pointer active:scale-95 transition-transform hover:bg-amber-100/80">
                            <div><span class="block text-[9px] font-black text-amber-600 uppercase">RECEIVING FAIL</span><span class="text-base font-black text-amber-800">${activeStats.recFail}</span></div>
                            <button onclick="decrementMatchStat(event, 'recFail')" class="w-6 h-6 rounded-lg bg-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-300">-</button>
                        </div>
                        <div onclick="recordMatchStat('foul')" class="p-3 bg-purple-50/80 border border-purple-200/80 rounded-2xl flex justify-between items-center cursor-pointer active:scale-95 transition-transform hover:bg-purple-100/80 col-span-2">
                            <div><span class="block text-[9px] font-black text-purple-600 uppercase">PELANGGARAN (FOUL)</span><span class="text-base font-black text-purple-800">${activeStats.foul || 0}</span></div>
                            <button onclick="decrementMatchStat(event, 'foul')" class="w-6 h-6 rounded-lg bg-purple-200 text-xs font-bold text-purple-900 hover:bg-purple-300">-</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 7. REKAP STATISTIK PEMAIN & LOG ACTIVITY (RESPONSIVE FULL WIDTH) -->
        <div class="w-full space-y-6 mb-6">
            <div class="w-full bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/80 shadow-md overflow-hidden">
                <div class="p-4 sm:p-5 bg-slate-50/80 border-b flex justify-between items-center flex-wrap gap-2">
                    <h4 class="font-black text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-chart-simple text-blue-900"></i> Ringkasan Statistik Pemain Match Live
                    </h4>
                </div>
                
                <div class="w-full overflow-x-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse min-w-[600px]">
                        <thead class="bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider">
                            <tr>
                                <th class="p-3.5 pl-5">Nama Pemain</th>
                                <th class="p-3.5 text-center">Passing</th>
                                <th class="p-3.5 text-center">Receiving</th>
                                <th class="p-3.5 text-center">Dribble</th>
                                <th class="p-3.5 text-center">Foul</th>
                                <th class="p-3.5 text-center pr-5">Akurasi Pass %</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs font-semibold">
                            ${state.atlet.map(p => {
                                const pStat = state.matchLive.playerStats[p.id] || { passAcc:0, passFail:0, recAcc:0, recFail:0, shootAcc:0, foul:0, dribbleTime:0 };
                                const totalPass = pStat.passAcc + pStat.passFail;
                                const passPct = totalPass > 0 ? Math.round((pStat.passAcc / totalPass) * 100) : 0;
                                
                                let passBarColor = 'bg-rose-500';
                                if (passPct >= 75) passBarColor = 'bg-emerald-500';
                                else if (passPct >= 50) passBarColor = 'bg-amber-500';

                                return `
                                    <tr class="hover:bg-blue-50/40 transition-colors">
                                        <td class="p-3.5 pl-5">
                                            <div class="font-extrabold text-slate-800">${escapeHTML(p.nama)}</div>
                                            <span class="text-[9px] bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md font-black mt-0.5 inline-block">${escapeHTML(p.posisi)}</span>
                                        </td>
                                        <td class="p-3.5 text-center font-mono">
                                            <div class="flex justify-center items-center shadow-sm rounded-lg overflow-hidden w-fit mx-auto">
                                                <span class="bg-emerald-50 text-emerald-700 px-2.5 py-1 border border-emerald-200 font-black">${pStat.passAcc}</span>
                                                <span class="bg-rose-50 text-rose-700 px-2.5 py-1 border-y border-r border-rose-200 font-black">${pStat.passFail}</span>
                                            </div>
                                        </td>
                                        <td class="p-3.5 text-center font-mono">
                                            <div class="flex justify-center items-center shadow-sm rounded-lg overflow-hidden w-fit mx-auto">
                                                <span class="bg-blue-50 text-blue-700 px-2.5 py-1 border border-blue-200 font-black">${pStat.recAcc}</span>
                                                <span class="bg-amber-50 text-amber-700 px-2.5 py-1 border-y border-r border-amber-200 font-black">${pStat.recFail}</span>
                                            </div>
                                        </td>
                                        <td class="p-3.5 text-center">
                                            <span class="font-mono font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shadow-sm">${pStat.dribbleTime}s</span>
                                        </td>
                                        <td class="p-3.5 text-center">
                                            <span class="font-mono font-black ${pStat.foul > 0 ? 'text-purple-700 bg-purple-50 border border-purple-200' : 'text-slate-400 bg-slate-50 border border-slate-200'} px-2.5 py-1 rounded-lg">${pStat.foul || 0}</span>
                                        </td>
                                        <td class="p-3.5 text-center pr-5 align-middle">
                                            <div class="flex flex-col gap-1 items-center justify-center min-w-[80px] mx-auto">
                                                <span class="font-mono font-black text-xs ${passPct >= 75 ? 'text-emerald-600' : (passPct >= 50 ? 'text-amber-600' : 'text-rose-600')}">
                                                    ${passPct}%
                                                </span>
                                                <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div class="h-full rounded-full transition-all duration-500 ${passBarColor}" style="width: ${passPct}%;"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="w-full bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/80 shadow-md overflow-hidden flex flex-col max-h-[350px]">
                <div class="p-4 bg-slate-50/80 border-b flex justify-between items-center shrink-0">
                    <h4 class="font-black text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-list-check text-blue-900"></i> Log Event Pertandingan
                    </h4>
                    <span class="bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full text-[10px] font-black">${state.matchLive.logs.length} Log</span>
                </div>
                <div class="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    ${state.matchLive.logs.length > 0 ? state.matchLive.logs.map(log => `
                        <div class="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between text-xs">
                            <div>
                                <span class="font-mono text-[10px] text-slate-400 font-bold block">${log.time}</span>
                                <p class="font-extrabold text-slate-700 mt-0.5">${escapeHTML(log.desc)}</p>
                            </div>
                            <button onclick="deleteMatchLog('${log.id}')" class="text-rose-400 hover:text-rose-600 p-1.5"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    `).join('') : `<p class="text-xs text-slate-400 text-center py-8 italic font-semibold">Belum ada aktivitas tercatat.</p>`}
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        renderMatchHeatmap();
    }, 50);
}

// 3. SHARE WHATSAPP PERTANDINGAN
function shareMatchToWhatsApp() {
    const m = state.matchLive || {};
    const scoreTeam = m.scoreTeam || 0;
    const scoreOpponent = m.scoreOpponent || 0;
    const period = m.period || 'Match';

    let text = `🏑 *UPDATE SKOR MATCH LIVE FLOORBALL*\n`;
    text += `===============================\n`;
    text += `*TIM KITA* [ ${scoreTeam} ] vs [ ${scoreOpponent} ] *LAWAN*\n`;
    text += `Status: ${period}\n`;
    text += `Foul Tim: ${m.foulTeam || 0} | Foul Lawan: ${m.foulOpponent || 0}\n`;
    text += `===============================\n\n`;

    const events = m.spatialEvents || [];
    if (events.length > 0) {
        text += `📊 Total Aksi Lapangan Recorded: ${events.length} Event\n`;
    }

    text += `\n_Diproses otomatis via Coach Floorball System_ ⚡`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
}





		