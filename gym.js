function submitGymLog(e) {
    e.preventDefault();
    const atletId = document.getElementById('gym-atlet-id')?.value;
    const tanggal = document.getElementById('gym-tanggal')?.value;
    const kategori = document.getElementById('gym-kategori')?.value;
    const gerakan = document.getElementById('gym-gerakan')?.value;
    const beban = document.getElementById('gym-beban')?.value;
    const setRep = document.getElementById('gym-set-rep')?.value;

    const newLogs = [];

    if (atletId === 'semua') {
        state.atlet.forEach(a => {
            newLogs.push({
                id: 'gym_' + Date.now() + '_' + a.id,
                atletId: String(a.id),
                tanggal,
                kategori,
                gerakan,
                beban,
                setRep
            });
        });
    } else {
        newLogs.push({
            id: 'gym_' + Date.now(),
            atletId,
            tanggal,
            kategori,
            gerakan,
            beban,
            setRep
        });
    }

    if (!state.gymLogs) state.gymLogs = [];
    state.gymLogs = [...newLogs, ...state.gymLogs];
    saveStorage('gymLogs', state.gymLogs);
    if (typeof syncDataToSpreadsheet === 'function') {
        syncDataToSpreadsheet();
    }

    renderContent();
    showToast(`Preskripsi Gym (${newLogs.length} entri) berhasil disimpan!`, 'success');
}

function deleteGymLog(id) {
    if (!confirm('Hapus log latihan gym ini?')) return;
    state.gymLogs = state.gymLogs.filter(g => String(g.id) !== String(id));
    saveStorage('gymLogs', state.gymLogs);
	if (typeof window.pushToFirebaseRT === 'function') {
        window.pushToFirebaseRT('gymLogs', state.gymLogs);
    }
    renderContent();
    showToast('Log Gym berhasil dihapus', 'success');
}

function autoFillGymDrill(presetKey) {
    const drillMap = {
        squat: { gerakan: "Barbell Back Squat", kategori: "Lower Body Power", beban: "70-80% 1RM", setRep: "4 Set × 6-8 Reps (Rest 90s)" },
        rdl: { gerakan: "Romanian Deadlift (RDL)", kategori: "Lower Body Power", beban: "65-75% 1RM", setRep: "3 Set × 8-10 Reps (Rest 60s)" },
        trap_bar: { gerakan: "Trap Bar Deadlift (Explosive)", kategori: "Lower Body Power", beban: "80-85% 1RM", setRep: "4 Set × 5 Reps (Rest 120s)" },
        bulgarian: { gerakan: "Dumbbell Bulgarian Split Squat", kategori: "Lower Body Power", beban: "Moderate DB", setRep: "3 Set × 8 Reps / Kaki" },
        bench_press: { gerakan: "Barbell Bench Press", kategori: "Upper Body Strength", beban: "75% 1RM", setRep: "4 Set × 6-8 Reps (Rest 90s)" },
        db_row: { gerakan: "Single Arm Dumbbell Row", kategori: "Upper Body Strength", beban: "Moderate-Heavy", setRep: "3 Set × 10 Reps / Sisi" },
        landmine_rot: { gerakan: "Landmine Rotational Press", kategori: "Core & Rotation", beban: "15-25 kg Bar", setRep: "3 Set × 8 Reps / Sisi (Explosive)" },
        pallof_press: { gerakan: "Cable Pallof Press Hold", kategori: "Core & Rotation", beban: "Moderate Cable", setRep: "3 Set × 12 Reps (Hold 2s)" },
        wrist_curl: { gerakan: "Wrist Roller & Pronation/Supination", kategori: "Forearm & Grip", beban: "5-10 kg", setRep: "3 Set × 15 Reps" },
        box_jump: { gerakan: "Plyometric Box Jump (Landing Focus)", kategori: "Lower Body Power", beban: "Bodyweight", setRep: "4 Set × 5 Reps (Max Height)" }
    };

    if (!presetKey || !drillMap[presetKey]) return;

    const data = drillMap[presetKey];
    if (document.getElementById('gym-gerakan')) document.getElementById('gym-gerakan').value = data.gerakan;
    if (document.getElementById('gym-kategori')) document.getElementById('gym-kategori').value = data.kategori;
    if (document.getElementById('gym-beban')) document.getElementById('gym-beban').value = data.beban;
    if (document.getElementById('gym-set-rep')) document.getElementById('gym-set-rep').value = data.setRep;
}

function selectGymProgramPackage(pkgKey) {
    const packages = {
        hypertrophy_aa: {
            title: "Fase 1 (TPU): Anatomical Adaptation & Base Hypertrophy",
            desc: "Fokus: Penguatan tendon/ligamen, stabilitas sendi, dan adaptasi beban awal sebelum intensitas tinggi.",
            drills: [
                { name: "Barbell Back Squat (Tempo 3-0-1)", sets: "3-4 Set × 10-12 Reps", load: "60-65% 1RM", rest: "60s" },
                { name: "Dumbbell Romanian Deadlift (RDL)", sets: "3 Set × 12 Reps", load: "60% 1RM", rest: "60s" },
                { name: "Push-Up to Plank Hold", sets: "3 Set × 15 Reps + 30s Hold", load: "Bodyweight", rest: "45s" },
                { name: "Cable Pallof Press & Hold", sets: "3 Set × 12 Reps/Sisi", load: "Ringan-Sedang", rest: "45s" }
            ]
        },
        max_strength: {
            title: "Fase 2 (TPK): Maximum Strength (MxS)",
            desc: "Fokus: Merekrut unit motorik maksimal otot tungkai dan panggul untuk pondasi power akselerasi.",
            drills: [
                { name: "Trap Bar Deadlift (Explosive Drive)", sets: "4-5 Set × 4-6 Reps", load: "80-85% 1RM", rest: "120s" },
                { name: "Barbell Front Squat", sets: "4 Set × 5-6 Reps", load: "75-80% 1RM", rest: "90s" },
                { name: "Weighted Pull-Up / Lat Pulldown", sets: "4 Set × 6 Reps", load: "75-80% 1RM", rest: "90s" },
                { name: "Single-Arm Dumbbell Row", sets: "3 Set × 6-8 Reps/Sisi", load: "Beban Berat", rest: "60s" }
            ]
        },
        conversion_power: {
            title: "Fase 3 (Pra-Kompetisi): Conversion to Power & SAQ",
            desc: "Fokus: Mentransfer kekuatan maksimal menjadi daya ledak rotasi drag shot dan akselerasi pivot.",
            drills: [
                { name: "Plyometric Box Jump (Landing Focus)", sets: "4 Set × 5 Reps", load: "Bodyweight", rest: "90s" },
                { name: "Landmine Rotational Punch/Press", sets: "3 Set × 6 Reps/Sisi", load: "Cepat & Eksplosif", rest: "60s" },
                { name: "Dumbbell Jump Squat", sets: "3 Set × 6 Reps", load: "20-30% 1RM", rest: "90s" },
                { name: "Medicine Ball Rotational Wall Slam", sets: "4 Set × 8 Reps/Sisi", load: "4-6 kg Ball", rest: "60s" }
            ]
        },
        gk_special: {
            title: "Spesifik Posisi: Goalkeeper Conditioning & Mobility",
            desc: "Fokus: Fleksibilitas adduktor, knee slides recovery, dan kecepatan reaksi otot gelang bahu.",
            drills: [
                { name: "Kneeling Jump to Balance Stance", sets: "4 Set × 5 Reps", load: "Bodyweight", rest: "60s" },
                { name: "Cossack Squat / Lateral Hip Flow", sets: "3 Set × 8 Reps/Sisi", load: "Bodyweight / Light DB", rest: "45s" },
                { name: "Resistance Band Rotator Cuff (Ext/Int)", sets: "3 Set × 15 Reps", load: "Light Band", rest: "30s" },
                { name: "Medicine Ball Chest Pass from Kneeling", sets: "4 Set × 8 Reps", load: "3-5 kg Ball", rest: "45s" }
            ]
        }
    };

    const target = packages[pkgKey] || packages.hypertrophy_aa;
    const detailBox = document.getElementById('gym-program-detail-card');

    ['hypertrophy_aa', 'max_strength', 'conversion_power', 'gk_special'].forEach(k => {
        const btn = document.getElementById(`btn-pkg-${k}`);
        if (btn) {
            if (k === pkgKey) btn.classList.add('border-cyan-400', 'bg-slate-800');
            else btn.classList.remove('border-cyan-400');
        }
    });

    if (detailBox) {
        detailBox.innerHTML = `
            <div class="border-b border-slate-800 pb-3">
                <h4 class="font-black text-sm text-cyan-300 font-display">${target.title}</h4>
                <p class="text-xs text-slate-400 mt-1">${target.desc}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${target.drills.map(d => `
                    <div class="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                            <span class="font-bold text-slate-200 block">${escapeHTML(d.name)}</span>
                            <span class="text-[10px] text-slate-400 font-mono">${d.load} • Rest: ${d.rest}</span>
                        </div>
                        <span class="bg-cyan-950 text-cyan-400 border border-cyan-500/40 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0">
                            ${d.sets}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}
		
function calculate1RM() {
    const weight = parseFloat(document.getElementById('calc-weight')?.value || 0);
    const reps = parseFloat(document.getElementById('calc-reps')?.value || 0);

    if (weight <= 0 || reps <= 0) {
        if (document.getElementById('res-1rm')) document.getElementById('res-1rm').innerText = "0 kg";
        if (document.getElementById('res-85')) document.getElementById('res-85').innerText = "0 kg";
        if (document.getElementById('res-75')) document.getElementById('res-75').innerText = "0 kg";
        if (document.getElementById('res-65')) document.getElementById('res-65').innerText = "0 kg";
        return;
    }

    // Formula Epley
    const oneRM = reps === 1 ? weight : Math.round(weight * (1 + reps / 30));
    const p85 = Math.round(oneRM * 0.85);
    const p75 = Math.round(oneRM * 0.75);
    const p65 = Math.round(oneRM * 0.65);

    if (document.getElementById('res-1rm')) document.getElementById('res-1rm').innerText = `${oneRM} kg`;
    if (document.getElementById('res-85')) document.getElementById('res-85').innerText = `${p85} kg`;
    if (document.getElementById('res-75')) document.getElementById('res-75').innerText = `${p75} kg`;
    if (document.getElementById('res-65')) document.getElementById('res-65').innerText = `${p65} kg`;
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
		
