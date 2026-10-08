function getNormaSlalom(waktuStr, jarak, gender) {
    const val = parseFloat(waktuStr);
    if (!val || isNaN(val) || val <= 0) return { 
        skor: '-', 
        kat: '-', 
        color: 'bg-slate-100 text-slate-300 border-slate-200' 
    };

    let sb = 24.0, b = 28.0, s = 32.0, k = 36.0;
    if (jarak === 7) { 
        sb = 28.0; 
        b = 32.0; 
        s = 36.0; 
        k = 40.0; 
    }
    else if (jarak === 9) { 
        sb = 32.0; 
        b = 36.0; 
        s = 40.0; 
        k = 44.0; 
    }

    if (gender === 'Putri') { 
        sb += 3.0; 
        b += 3.0; 
        s += 3.0; 
        k += 3.0; 
    }

    let kat = 'SK', color = 'bg-rose-500 text-white border-rose-600';
    if (val <= sb) { 
        kat = 'SB'; 
        color = 'bg-emerald-500 text-white border-emerald-600'; 
    }
    else if (val <= b) { 
        kat = 'B'; 
        color = 'bg-blue-500 text-white border-blue-600'; 
    }
    else if (val <= s) { 
        kat = 'S'; 
        color = 'bg-amber-400 text-amber-950 border-amber-500'; 
    }
    else if (val <= k) { 
        kat = 'K'; 
        color = 'bg-orange-500 text-white border-orange-600'; 
    }

    return { 
        skor: val.toFixed(2) + 's', kat, color 
    };
}

function getAtletVO2Max(atletId) {
    if (!atletId || atletId === 'semua') return null;
    const targetId = String(atletId).trim().toLowerCase();

    // 1. Cari objek atlet agar pencocokan bisa via ID maupun Nama
    const atletObj = state.atlet.find(a => String(a.id).trim().toLowerCase() === targetId);
    const targetNama = atletObj ? atletObj.nama.trim().toLowerCase() : '';

    // 2. Ambil seluruh riwayat tes Yo-Yo milik atlet ini
    const records = (state.tesFisik || []).filter(t => {
        const tId = String(t.atletId || '').trim().toLowerCase();
        const isMatch = (tId === targetId) || (targetNama && tId === targetNama);
        return isMatch && t.keyTes === 'yoyo' && parseFloat(t.skor) > 0;
    });

    if (records.length === 0) return null;

    // 3. Urutkan berdasarkan tanggal tes terbaru (DESC), lalu tahap (Post -> Mid -> Pre)
    const bobotTahap = { 'Post': 3, 'Mid': 2, 'Pre': 1 };
    records.sort((a, b) => {
        const timeA = a.tanggal ? new Date(a.tanggal).getTime() : 0;
        const timeB = b.tanggal ? new Date(b.tanggal).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA; // Tanggal paling baru di posisi pertama

        const rankA = bobotTahap[a.tahap] || 0;
        const rankB = bobotTahap[b.tahap] || 0;
        return rankB - rankA; // Jika tanggal sama, pilih Post > Mid > Pre
    });

    // 4. Kembalikan skor tes terakhir
    return parseFloat(records[0].skor) || null;
}

function calculateTestProgress(valPre, valPost, lowerIsBetter = false) {
    const v1 = parseFloat(valPre);
    const v2 = parseFloat(valPost);

    if (isNaN(v1) || isNaN(v2) || v1 === 0) {
        return {
            delta: '-',
            pct: '-',
            isImprove: null,
            color: 'text-slate-400'
        };
    }

    const diff = parseFloat((v2 - v1).toFixed(2));
    const pct = parseFloat(((diff / v1) * 100).toFixed(1));

    let isImprove = false;

    if (lowerIsBetter) {
        isImprove = diff < 0;
    } else {
        isImprove = diff > 0;
    }

    const sign = diff > 0 ? '+' : '';

    const color = isImprove
        ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
        : (diff === 0
            ? 'text-slate-500 bg-slate-50 border-slate-200'
            : 'text-rose-600 bg-rose-50 border-rose-200');

    return {
        delta: `${sign}${diff}`,
        pct: `${sign}${pct}%`,
        isImprove,
        color
    };
}

// HELPER KALKULASI PROGRES TES (PRE vs MID vs POST)
function hitungKategoriNorma(keyTes, valStr, gender, posisi) {
    const val = parseFloat(valStr);
    if (isNaN(val) || val <= 0) 
        return '-';

    const isGK = (posisi === 'GK');
    const isPutra = (gender === 'Putra');

    // Filter tes sesuai posisi
    const playerAllowedTests = ['vsit', 'vjump', 'plyo_push', 'push_up', 'squat', 'plank', 'sprint20', 'ttest', 'rsa6x20', 'yoyo'];
    const gkAllowedTests = ['vsit', 'plyo_push', 'push_up', 'squat', 'plank', 'kneeling', 'shuffle', 'boxdrill', 'creade_rsa', 'yoyo'];

    if (isGK && !gkAllowedTests.includes(keyTes)) return '-';
    if (!isGK && !playerAllowedTests.includes(keyTes)) return '-';

    // =================================----------------============
    // 1. VO2MAX / YO-YO IR1 (ml/kg/min)
    // =================================----------------============
    if (keyTes === 'yoyo') {
        if (isPutra) {
            if (val >= 54) return 'SB';
            if (val >= 49) return 'B';
            if (val >= 44) return 'S';
            if (val >= 39) return 'K';
            return 'SK';
        } else {
            if (val >= 56) return 'SB';
            if (val >= 46) return 'B';
            if (val >= 41) return 'S';
            if (val >= 37) return 'K';
            return 'SK';
        }
    }

    // =================================----------------============
    // 2. PLANK HOLD (Detik)
    // =================================----------------============
    if (keyTes === 'plank') {
        if (isPutra) {
            if (val >= 240) return 'SB';
            if (val >= 180) return 'B';
            if (val >= 120) return 'S';
            if (val >= 60)  return 'K';
            return 'SK';
        } else {
            if (val >= 210) return 'SB';
            if (val >= 150) return 'B';
            if (val >= 80)  return 'S';
            if (val >= 45)  return 'K';
            return 'SK';
        }
    }

    // =================================----------------============
    // 3. V-SIT REACH (CM)
    // =================================----------------============
    if (keyTes === 'vsit') {
        if (isPutra) {
            if (val >= 13) return 'SB';
            if (val >= 5)  return 'B';
            if (val >= 1)  return 'S';
            if (val >= -5) return 'K';
            return 'SK';
        } else {
            if (val >= 18) return 'SB';
            if (val >= 10) return 'B';
            if (val >= 3)  return 'S';
            if (val >= -1)  return 'K';
            return 'SK';
        }
    }

    // =================================----------------============
    // 4. TES WAKTU / SPEED & AGILITY (Semakin Kecil Detik = Semakin Baik)
    // =================================----------------============
    if (['sprint20', 'ttest', 'rsa6x20', 'boxdrill', 'creade_rsa'].includes(keyTes)) {
        
        // 4A. SPRINT 20M (Detik)
    if (keyTes === 'sprint20') {
        if (isPutra) {
            if (val <= 2.85) return 'SB';
            if (val <= 3.10) return 'B';
            if (val <= 3.35) return 'S';
            if (val <= 3.60) return 'K';
            return 'SK';
        } else {
            if (val <= 3.15) return 'SB';
            if (val <= 3.45) return 'B';
            if (val <= 3.75) return 'S';
            if (val <= 4.10) return 'K';
            return 'SK';
        }
    }

    // 4B. T-TEST AGILITY (Detik)
    if (keyTes === 'ttest') {
        if (isPutra) {
            if (val <= 10.20) return 'SB';
            if (val <= 11.00) return 'B';
            if (val <= 11.70) return 'S';
            if (val <= 12.50) return 'K';
            return 'SK';
        } else {
            if (val <= 11.00) return 'SB';
            if (val <= 11.80) return 'B';
            if (val <= 12.60) return 'S';
            if (val <= 13.50) return 'K';
            return 'SK';
        }
    }

    // 4C. RSA 6X20M (Detik - Rata-Rata per Sprint)
    if (keyTes === 'rsa6x20') {
        if (isPutra) {
            if (val <= 2.90) return 'SB';
            if (val <= 3.10) return 'B';
            if (val <= 3.35) return 'S';
            if (val <= 3.60) return 'K';
            return 'SK';
        } else {
            if (val <= 3.20) return 'SB';
            if (val <= 3.45) return 'B';
            if (val <= 3.70) return 'S';
            if (val <= 4.00) return 'K';
            return 'SK';
        }
    }
    
        // 4D. BOX DRILL 3X3M (Detik)
        if (keyTes === 'boxdrill') {
            if (isPutra) {
                if (val <= 7.50) return 'SB';
                if (val <= 8.20) return 'B';
                if (val <= 9.00) return 'S';
                if (val <= 10.00) return 'K';
                return 'SK';
            } else {
                if (val <= 8.80) return 'SB';
                if (val <= 9.50) return 'B';
                if (val <= 10.50) return 'S';
                if (val <= 11.50) return 'K';
                return 'SK';
            }
        }

        // 4E. CREADE RSA 6X4M (Detik)
        if (keyTes === 'creade_rsa') {
            if (isPutra) {
                if (val <= 2.30) return 'SB';
                if (val <= 2.61) return 'B';
                if (val <= 2.96) return 'S';
                if (val <= 3.31) return 'K';
                return 'SK';
            } else {
                if (val <= 2.60) return 'SB';
                if (val <= 2.91) return 'B';
                if (val <= 3.26) return 'S';
                if (val <= 3.61) return 'K';
                return 'SK';
            }
        }
    }

    // =================================----------------============
    // 5. TES REPETISI & DAYA TAHAN OTOT (Semakin Besar = Semakin Baik)
    // =================================----------------============

    // 5A. PUSH UP (1 MNT)
    if (keyTes === 'push_up') {
        let bonus = (isGK) ? 5 : 0; // Tambahan target untuk Kiper jika ada
        if (isPutra) {
            if (val >= 55) return 'SB';
            if (val >= 45) return 'B';
            if (val >= 35) return 'S';
            if (val >= 24) return 'K';
            return 'SK';
        } else {
            if (val >= 54) return 'SB';
            if (val >= 44) return 'B';
            if (val >= 34) return 'S';
            if (val >= 19) return 'K';
            return 'SK';
        }
    }

    // 5B. PLIOMETRIK PUSH UP
    if (keyTes === 'plyo_push') {
        let bonus = (isGK) ? 5 : 0;
        if (isPutra) {
            if (val >= 35) return 'SB';
            if (val >= 25) return 'B';
            if (val >= 15) return 'S';
            if (val >= 9) return 'K';
            return 'SK';
        } else {
            if (val >= 25) return 'SB';
            if (val >= 17) return 'B';
            if (val >= 9) return 'S';
            if (val >= 4)  return 'K';
            return 'SK';
        }
    }

    // 5C. SQUAT (1 MNT)
    if (keyTes === 'squat') {
        if (isPutra) {
            if (val >= 54) return 'SB';
            if (val >= 44) return 'B';
            if (val >= 34) return 'S';
            if (val >= 19) return 'K';
            return 'SK';
        } else {
            if (val >= 50) return 'SB';
            if (val >= 40) return 'B';
            if (val >= 30) return 'S';
            if (val >= 19) return 'K';
            return 'SK';
        }
    }

    // 5D. LATERAL SHUFFLE 30S (REPS)
    if (keyTes === 'shuffle') {
        if (isPutra) {
            if (val >= 28) return 'SB';
            if (val >= 23) return 'B';
            if (val >= 18) return 'S';
            if (val >= 13) return 'K';
            return 'SK';
        } else {
            if (val >= 24) return 'SB';
            if (val >= 19) return 'B';
            if (val >= 15) return 'S';
            if (val >= 10) return 'K';
            return 'SK';
        }
    }

    // =================================----------------============
    // 6. TES POWER LONCATAN (CM)
    // =================================----------------============

    // 6A. VERTICAL JUMP (CM)
    if (keyTes === 'vjump') {
        if (isPutra) {
            if (val >= 70) return 'SB';
            if (val >= 60) return 'B';
            if (val >= 50) return 'S';
            if (val >= 40) return 'K';
            return 'SK';
        } else {
            if (val >= 60) return 'SB';
            if (val >= 50) return 'B';
            if (val >= 40) return 'S';
            if (val >= 30) return 'K';
            return 'SK';
        }
    }

    // 6B. KNEELING JUMP (CM)
    if (keyTes === 'kneeling') {
        if (isPutra) {
            if (val >= 55) return 'SB';
            if (val >= 45) return 'B';
            if (val >= 35) return 'S';
            if (val >= 25) return 'K';
            return 'SK';
        } else {
            if (val >= 42) return 'SB';
            if (val >= 32) return 'B';
            if (val >= 24) return 'S';
            if (val >= 16) return 'K';
            return 'SK';
        }
    }

    return 'S';
}

// FUNGSI PENILAIAN OTOMATIS BERDASARKAN GENDER
function evaluasiHasilTes(testObj, skor, genderAtlet = 'L') {
    if (skor === null || skor === undefined || isNaN(skor) || skor === '') {
        return { 
            label: 'Belum Tes', 
            badge: 'bg-slate-100 text-slate-500 border-slate-200' 
        };
    }
    
    const val = parseFloat(skor);
    const g = (genderAtlet === 'P' || genderAtlet === 'Perempuan' || genderAtlet === 'Wanita') ? 'P' : 'L';
    const n = testObj.norma[g];

    if (testObj.lowerIsBetter) {
        if (val <= n.istimewa) 
            return { 
                label: 'Istimewa', 
                badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            };
        if (val <= n.baik) 
            return { 
                label: 'Baik', 
                badge: 'bg-blue-50 text-blue-800 border-blue-300' 
            };
        if (val <= n.sedang) 
            return { 
                label: 'Sedang', 
                badge: 'bg-amber-50 text-amber-800 border-amber-300' 
            };
        return { 
            label: 'Kurang', 
            badge: 'bg-rose-50 text-rose-800 border-rose-300' 
        };
    } else {
        if (val >= n.istimewa) 
            return { 
                label: 'Istimewa', 
                badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            };
        if (val >= n.baik) 
            return { 
                label: 'Baik', 
                badge: 'bg-blue-50 text-blue-800 border-blue-300' 
            };
        if (val >= n.sedang) 
            return { 
                label: 'Sedang', 
                badge: 'bg-amber-50 text-amber-800 border-amber-300' 
            };
        return { 
            label: 'Kurang', 
            badge: 'bg-rose-50 text-rose-800 border-rose-300' 
        };
    }
}

// Mengisi otomatis skor tes lama ke dalam form saat atlet dipilih
function loadExistingTesFisikForm(atletId) {
    if (!atletId) return;
    const tahapSelect = document.getElementById('multi-tes-tahap');
    const selectedTahap = tahapSelect ? tahapSelect.value : 'Pre';
    
    // Ambil tes yang cocok dengan atletId DAN tahap yang sedang dipilih
    const records = state.tesFisik.filter(t => 
        String(t.atletId) === String(atletId) && 
        (t.tahap || 'Pre') === selectedTahap
    );
    
    listFieldTes.forEach(f => {
        const inputElem = document.getElementById(`field-${f.key}`);
        if (inputElem) {
            const match = records.find(r => r.keyTes === f.key);
            inputElem.value = match ? match.skor : '';
        }
    });
}

async function submitMultiTesFisikOptimistic(e) {
    e.preventDefault();
    const atletId = document.getElementById('multi-tes-atlet-id')?.value;
    const tanggal = document.getElementById('multi-tes-tanggal')?.value;
    const tahap = document.getElementById('multi-tes-tahap')?.value || 'Pre';

    const atlet = state.atlet.find(a => String(a.id) === String(atletId));
    if (!atlet) return;

    const newEntries = [];
    listFieldTes.forEach(f => {
        const elem = document.getElementById(`field-${f.key}`);
        if (elem && elem.value.trim() !== '') {
            newEntries.push({
                id: 'tf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                atletId: String(atletId),
                tanggal,
                tahap,
                keyTes: f.key,
                skor: elem.value.trim()
            });
        }
    });

    if (newEntries.length === 0) {
        showToast('Harap isi minimal 1 nilai item tes!', 'error');
        return;
    }

    // Hapus data lama yang memiliki atletId, keyTes, DAN tahap yang sama persis (update tahap yang dipilih)
    newEntries.forEach(ne => {
        state.tesFisik = state.tesFisik.filter(t => 
            !(String(t.atletId) === String(ne.atletId) && t.keyTes === ne.keyTes && t.tahap === ne.tahap)
        );
    });

    state.tesFisik = [...newEntries, ...state.tesFisik];
    saveStorage('tesFisik', state.tesFisik);
    if (typeof window.pushToFirebaseRT === 'function') {
        window.pushToFirebaseRT('tesFisik', state.tesFisik);
    }
    if (typeof syncDataToSpreadsheet === 'function') {
        syncDataToSpreadsheet();
    }

    renderContent();
    showToast(`Hasil Tes Fisik (${tahap}-Test) untuk ${escapeHTML(atlet.nama)} tersimpan!`, 'success');
}

async function submitTesTeknikOptimistic(e) {
    e.preventDefault();
    const atletIdElem = document.getElementById('teknik-atlet-id');
    const tanggalElem = document.getElementById('teknik-tanggal');
    const atletId = atletIdElem ? atletIdElem.value : '';
    const tanggal = tanggalElem ? tanggalElem.value : '';

    const atlet = state.atlet.find(a => String(a.id) === String(atletId));
    if (!atlet) return;

    const newTeknikData = {
        id: 'tek_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        atletId,
        tanggal,
        dualGate: {
            sesi1: {
                partnerId: document.getElementById('dual-partner-1')?.value || '',
                rep: parseInt(document.getElementById('dual-rep-1')?.value) || 0,
                waktu: parseFloat(document.getElementById('dual-waktu-1')?.value) || 0
            },
            sesi2: {
                partnerId: document.getElementById('dual-partner-2')?.value || '',
                rep: parseInt(document.getElementById('dual-rep-2')?.value) || 0,
                waktu: parseFloat(document.getElementById('dual-waktu-2')?.value) || 0
            }
        },
        slalomShoot: {
            s5m: {
                waktu: parseFloat(document.getElementById('slalom-5m-waktu')?.value) || 0,
                goalL: document.getElementById('s5-goal-l')?.checked || false,
                goalC: document.getElementById('s5-goal-c')?.checked || false,
                goalR: document.getElementById('s5-goal-r')?.checked || false,
                garis: document.getElementById('s5-garis')?.checked || false,
                skip: document.getElementById('s5-skip')?.checked || false,
                hit: document.getElementById('s5-hit')?.checked || false
            },
            s7m: {
                waktu: parseFloat(document.getElementById('slalom-7m-waktu')?.value) || 0,
                goalL: document.getElementById('s7-goal-l')?.checked || false,
                goalC: document.getElementById('s7-goal-c')?.checked || false,
                goalR: document.getElementById('s7-goal-r')?.checked || false,
                garis: document.getElementById('s7-garis')?.checked || false,
                skip: document.getElementById('s7-skip')?.checked || false,
                hit: document.getElementById('s7-hit')?.checked || false
            },
            s9m: {
                waktu: parseFloat(document.getElementById('slalom-9m-waktu')?.value) || 0,
                goalL: document.getElementById('s9-goal-l')?.checked || false,
                goalC: document.getElementById('s9-goal-c')?.checked || false,
                goalR: document.getElementById('s9-goal-r')?.checked || false,
                garis: document.getElementById('s9-garis')?.checked || false,
                skip: document.getElementById('s9-skip')?.checked || false,
                hit: document.getElementById('s9-hit')?.checked || false
            }
        }
    };

    state.tesTeknik.unshift(newTeknikData);
    saveStorage('tesTeknik', state.tesTeknik);
    if (typeof window.pushToFirebaseRT === 'function') {
            window.pushToFirebaseRT('tesTeknik', state.tesTeknik);
        }
    if (typeof syncDataToSpreadsheet === 'function') {
        syncDataToSpreadsheet();
    }

    renderContent();
    showToast(`Hasil tes teknik dasar ${escapeHTML(atlet.nama)} berhasil disimpan!`, 'success');
}

function deleteTesTeknikLog(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus riwayat tes teknik ini?")) return;

    // Filter hapus data berdasarkan id
    state.tesTeknik = state.tesTeknik.filter(item => String(item.id) !== String(id));
    saveStorage('tesTeknik', state.tesTeknik);
    if (typeof window.pushToFirebaseRT === 'function') {
        window.pushToFirebaseRT('tesTeknik', state.tesTeknik);
    }
    renderContent();
    showToast("Riwayat tes teknik berhasil dihapus!", "success");
}



