function autoFillJoggingVO2(atletId) {
    if (!atletId) return;
    const vo2Val = getAtletVO2Max(atletId);
    const displayVO2 = document.getElementById('jogging-vo2-display');
    const displayPace = document.getElementById('jogging-pace-display');
    const inputJarak = document.getElementById('jogging-jarak');
    const selectZona = document.getElementById('jogging-zona')?.value || '0.75';

    if (!vo2Val) {
        if (displayVO2) displayVO2.value = 'Belum Ada Data Tes Yo-Yo';
        if (displayPace) displayPace.value = '-';
        if (inputJarak) inputJarak.value = '';
        return;
    }

    if (displayVO2) displayVO2.value = `${vo2Val} ml/kg/m`;

    const masKmh = vo2Val / 3.5;
    const zoneFactor = parseFloat(selectZona);
    const paceMinPerKm = 60 / (masKmh * zoneFactor);
    const waktuMnt = parseFloat(document.getElementById('jogging-waktu')?.value || 30);

    const autoDist = (waktuMnt / paceMinPerKm).toFixed(2);
    if (inputJarak) {
        inputJarak.value = autoDist;
    }

    const mins = Math.floor(paceMinPerKm);
    const secs = Math.round((paceMinPerKm - mins) * 60).toString().padStart(2, '0');
    if (displayPace) {
        displayPace.value = `${mins}'${secs}" /km`;
    }
}

function calculateRealtimePace() {
    const distElem = document.getElementById('jogging-jarak');
    const timeElem = document.getElementById('jogging-waktu');
    const displayPace = document.getElementById('jogging-pace-display');

    if (!displayPace || !distElem || !timeElem) return;

    const dist = parseFloat(distElem.value || 0);
    const time = parseFloat(timeElem.value || 0);

    if (dist > 0 && time > 0) {
        const paceVal = time / dist;
        const mins = Math.floor(paceVal);
        const secs = Math.round((paceVal - mins) * 60).toString().padStart(2, '0');
        displayPace.value = `${mins}'${secs}" /km`;
    } else {
        displayPace.value = '-';
    }
}

function calculateRealtimePaceFromAtletInput() {
    const at = state.activeAtlet;
    if (!at) return;

    const durasiInput = document.getElementById('run-durasi');
    const zonaInput = document.getElementById('run-zona');

    const waktuMnt = parseFloat(durasiInput?.value || 30);
    const zonaFactor = parseFloat(zonaInput?.value || 0.75);

    // Ambil baseline VO2Max atlet
    const vo2val = getAtletVO2Max(at.id) || 45; // Default 45 jika belum tes
    const masKmh = vo2val / 3.5;
    const paceMinPerKm = 60 / (masKmh * zonaFactor);

    // Hitung estimasi jarak & speed
    const autoDist = (waktuMnt / paceMinPerKm).toFixed(2);
    const speedKmh = parseFloat((autoDist / (waktuMnt / 60)).toFixed(1));
    const estKalori = Math.round(autoDist * (at.bb || 65) * 0.75);

    // Format tampilan pace
    const mins = Math.floor(paceMinPerKm);
    const secs = Math.round((paceMinPerKm - mins) * 60).toString().padStart(2, '0');
    const paceFormatted = `${mins}'${secs}"`;

    // Render ke tampilan HP atlet
    if (document.getElementById('run-pace-display')) document.getElementById('run-pace-display').innerText = paceFormatted;
    if (document.getElementById('run-jarak-display')) document.getElementById('run-jarak-display').innerText = `${autoDist} km`;
    if (document.getElementById('run-speed-display')) document.getElementById('run-speed-display').innerText = `${speedKmh} km/h`;
    if (document.getElementById('run-kalori-display')) document.getElementById('run-kalori-display').innerText = `${estKalori} kcal`;
}

function autoFillMASVO2(atletId) {
    if(!atletId) return;
    const vo2Val = getAtletVO2Max(atletId);
    const displayVO2 = document.getElementById('mas-vo2-display');
    const atlet = state.atlet.find(a => String(a.id) === String(atletId));
    
    if (!vo2Val) {
        if (displayVO2) displayVO2.value = 'Belum Ada Data Tes Yo-Yo';
        calculateMASDistances();
        return;
    }

    if (displayVO2) displayVO2.value = `${vo2Val} ml/kg/m`;

    const repElem = document.getElementById('mas-rep');
    const walkSecElem = document.getElementById('mas-walk-sec');
    const jogSecElem = document.getElementById('mas-jog-sec');
    const sprintSecElem = document.getElementById('mas-sprint-sec');

    if (atlet && repElem && walkSecElem && jogSecElem && sprintSecElem) {
        let defaultRep = 10;
        let defaultWalkSec = 15;
        let defaultJogSec = 15;
        let defaultSprintSec = 15;

        if (atlet.posisi === 'GK') {
            defaultRep = 6;
            defaultWalkSec = 30;
            defaultSprintSec = 10;
        } else if (['FL', 'FR', 'C'].includes(atlet.posisi)) {
            defaultRep = 12;
            defaultWalkSec = 12;
        } else if (['DL', 'DR'].includes(atlet.posisi)) {
            defaultRep = 10;
            defaultWalkSec = 15;
        }

        if (atlet.cedera && atlet.cedera !== 'Tidak ada') {
            defaultRep = Math.max(4, Math.round(defaultRep * 0.7));
            defaultWalkSec = Math.round(defaultWalkSec * 1.5);
        }

        repElem.value = defaultRep;
        walkSecElem.value = defaultWalkSec;
        jogSecElem.value = defaultJogSec;
        sprintSecElem.value = defaultSprintSec;
    }

    calculateMASDistances();
}

function calculateMASDistances() {
    const atletElem = document.getElementById('mas-atlet-id');
    if (!atletElem) return;

    const atletId = atletElem.value;
    const vo2Val = getAtletVO2Max(atletId);

    const walkSec = parseFloat(document.getElementById('mas-walk-sec')?.value || 0);
    const jogSec = parseFloat(document.getElementById('mas-jog-sec')?.value || 0);
    const sprintSec = parseFloat(document.getElementById('mas-sprint-sec')?.value || 0);

    const displayWalk = document.getElementById('mas-walk-dist-display');
    const displayJog = document.getElementById('mas-jog-dist-display');
    const displaySprint = document.getElementById('mas-sprint-dist-display');

    if (!vo2Val || isNaN(vo2Val)) {
        if (displayWalk) displayWalk.value = '-';
        if (displayJog) displayJog.value = '-';
        if (displaySprint) displaySprint.value = '-';
        return;
    }

    const masMPS = vo2Val / 12.6;

    const sprintDist = Math.round(sprintSec * (masMPS * 1.20));
    const jogDist = Math.round(jogSec * (masMPS * 0.70));
    const walkDist = Math.round(walkSec * (masMPS * 0.40));

    if (displaySprint) displaySprint.value = `${sprintDist} Meter`;
    if (displayJog) displayJog.value = `${jogDist} Meter`;
    if (displayWalk) displayWalk.value = `${walkDist} Meter`;
}

function initMenu7AutoFill() {
    const joggingSelect = document.getElementById('jogging-atlet-id');
    const masSelect = document.getElementById('mas-atlet-id');

    if (joggingSelect && joggingSelect.options.length > 0) {
        if (!joggingSelect.value) joggingSelect.selectedIndex = 0;
        autoFillJoggingVO2(joggingSelect.value);
    }

    if (masSelect && masSelect.options.length > 0) {
        if (!masSelect.value) masSelect.selectedIndex = 0;
        autoFillMASVO2(masSelect.value);
    }
}

async function submitJoggingLog(e) {
    e.preventDefault();
    const atletId = document.getElementById('jogging-atlet-id')?.value;
    const tanggal = document.getElementById('jogging-tanggal')?.value;
    const zona = document.getElementById('jogging-zona')?.value;
    const waktu = parseFloat(document.getElementById('jogging-waktu')?.value || 0);
    const jarak = parseFloat(document.getElementById('jogging-jarak')?.value || 0);
    const pace = document.getElementById('jogging-pace-display')?.value || '-';
    const vo2max = getAtletVO2Max(atletId) || '-';

    const newLog = { id: 'j' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), atletId, tanggal, vo2max, zona, jarak, waktu, pace };
    state.joggingLogs.unshift(newLog);
    saveStorage('joggingLogs', state.joggingLogs);
    if (typeof window.pushToFirebaseRT === 'function') {
        window.pushToFirebaseRT('joggingLogs', state.joggingLogs);
    }

    const speedKmh = waktu > 0 ? parseFloat((jarak / (waktu / 60)).toFixed(1)) : 0;
    const estKalori = Math.round((speedKmh * 1.05) * 65 * (waktu / 60));
    
    const newValidasiSync = {
        id: 'v' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        atletId: atletId,
        tanggal: tanggal,
        jarak: jarak,
        waktu: waktu,
        paceSec: 0,
        speedKmh: speedKmh,
        kalori: estKalori,
        hrAvg: 145,
        cadenceSpm: 160,
        gpsLoc: 'Input Langsung Pelatih',
        stravaLink: '',
        imgStravaHash: 'sync_' + Date.now(),
        imgStravaUrl: 'https://images.unsplash.com/photo-1510519138161-584459eb1b37?w=500&q=80',
        imgSelfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
        detectedMotor: false,
        detectedLowHR: false,
        detectedEdit: false,
        softwareDetected: 'Disetujui Langsung Pelatih',
        status: 'Disetujui'
    };

    state.laporanValidasi.unshift(newValidasiSync);
    saveStorage('laporanValidasi', state.laporanValidasi);

    renderContent();
    showToast('Sesi jogging berhasil dicatat & disinkronkan ke atlet!', 'success');
}

async function submitMASLog(e) {
    e.preventDefault();
    const atletId = document.getElementById('mas-atlet-id')?.value;
    const tanggal = document.getElementById('mas-tanggal')?.value;
    const rep = parseInt(document.getElementById('mas-rep')?.value || 0);
    const vo2max = getAtletVO2Max(atletId) || '-';

    const walkSec = parseFloat(document.getElementById('mas-walk-sec')?.value || 0);
    const jogSec = parseFloat(document.getElementById('mas-jog-sec')?.value || 0);
    const sprintSec = parseFloat(document.getElementById('mas-sprint-sec')?.value || 0);

    const sprintDist = parseInt(document.getElementById('mas-sprint-dist-display')?.value) || 0;
    const jogDist = parseInt(document.getElementById('mas-jog-dist-display')?.value) || 0;
    const walkDist = parseInt(document.getElementById('mas-walk-dist-display')?.value) || 0;

    const newLog = { id: 'm' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), atletId, tanggal, vo2max, walkSec, jogSec, sprintSec, walkDist, jogDist, sprintDist, rep };
    state.masLogs.unshift(newLog);
    saveStorage('masLogs', state.masLogs);
    renderContent();
    showToast('Preskripsi MAS berhasil disimpan!', 'success');
}

function updateAtletJoggingCalculations() {
    const atlet = state.activeAtlet;
    if (!atlet) return;

    const historiList = state.joggingLogs || [];
    const matchLog = historiList.slice().reverse().find(item => 
        String(item.atletId) === String(atlet.id) || String(item.namaAtlet) === String(atlet.nama)
    );
    
    const waktuMnt = matchLog ? parseFloat(matchLog.waktu) : 30;
    const zonaFactor = matchLog ? matchLog.zona : "0.75";
    const jarakKm = matchLog ? parseFloat(matchLog.jarak) : 4.31;
    const paceFormatted = matchLog ? matchLog.pace : "5'48\"";
    
    const speedKmh = (waktuMnt > 0 && jarakKm > 0) 
        ? parseFloat((jarakKm / (waktuMnt / 60)).toFixed(1)) 
        : 8.6;
    const estKalori = Math.round(jarakKm * (atlet.bb || 65) * 0.75);

    const durasiInput = document.getElementById('run-durasi');
    const zonaInput = document.getElementById('run-zona');
    if (durasiInput) durasiInput.value = waktuMnt;
    if (zonaInput) {
        const z = String(zonaFactor);
        if (z.includes('0.6')) zonaInput.value = 'Zone 1 (60% MAS)';
        else if (z.includes('0.8')) zonaInput.value = 'Zone 3 (80% MAS)';
        else if (z.includes('0.9')) zonaInput.value = 'Zone 4 (90% MAS)';
        else if (z.includes('1')) zonaInput.value = 'Zone 5 (100% MAS)';
        else zonaInput.value = 'Zone 2: Aerobic Base (75% MAS)';
    }

    if (document.getElementById('run-pace-display')) document.getElementById('run-pace-display').innerText = paceFormatted;
    if (document.getElementById('run-jarak-display')) document.getElementById('run-jarak-display').innerText = `${jarakKm} km`;
    if (document.getElementById('run-speed-display')) document.getElementById('run-speed-display').innerText = `${speedKmh} km/h`;
    if (document.getElementById('run-kalori-display')) document.getElementById('run-kalori-display').innerText = `${estKalori} kcal`;
}

async function submitAtletLaporanJogging(e) {
    e.preventDefault();
    const at = state.activeAtlet;
    if (!at) return;

    const selfieFile = document.getElementById('run-file-selfie')?.files[0];
    const buktiFile = document.getElementById('run-file-bukti')?.files[0];
    const toast = showToast('Memproses & Mengunggah Laporan...', 'loading');

    let selfieUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80';
    let stravaUrl = 'https://picsum.photos/500/500?sports';

    if (selfieFile) {
        try { selfieUrl = await compressImage(selfieFile, 600, 600, 0.6); } 
        catch(err) { console.warn("Gagal kompresi selfie:", err); }
    }

    if (buktiFile) {
        try { stravaUrl = await compressImage(buktiFile, 800, 800, 0.6); } 
        catch(err) { console.warn("Gagal kompresi bukti strava:", err); }
    }

    // Ambil log target atlet
    const matchLog = (state.joggingLogs || []).slice().reverse().find(item => 
        String(item.atletId) === String(at.id) || String(item.namaAtlet) === String(at.nama)
    );

    const inputDurasi = parseFloat(document.getElementById('run-durasi')?.value);
    const durasiVal = !isNaN(inputDurasi) && inputDurasi > 0 ? inputDurasi : (matchLog ? parseFloat(matchLog.waktu) : 30);
    const jarakVal = matchLog ? parseFloat(matchLog.jarak) : 4.31;
    const isMotorDetected = (typeof liveRunMetrics !== 'undefined' && liveRunMetrics.vehicleDetected) || (state.currentGpsLocation && state.currentGpsLocation.includes("MOTOR"));
	const finalJarak = (typeof liveRunMetrics !== 'undefined' && liveRunMetrics.distanceKm > 0) ? parseFloat(liveRunMetrics.distanceKm.toFixed(2)) : jarakVal;

    const newReport = {
        id: 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        atletId: String(at.id),
        namaAtlet: at.nama,
        tanggal: matchLog ? matchLog.tanggal : new Date().toISOString().split('T')[0],
        jarak: finalJarak,
        waktu: durasiVal,
        speedKmh: durasiVal > 0 ? parseFloat((finalJarak / (durasiVal / 60)).toFixed(1)) : 0,
        kalori: Math.round(finalJarak * (at.bb || 65) * 0.75),
        gpsLoc: state.currentGpsLocation || 'Lokasi Terdeteksi',
        imgSelfieUrl: selfieUrl,
        imgStravaUrl: stravaUrl,
        detectedMotor: Boolean(isMotorDetected),
        detectedLowHR: false,
        detectedEdit: false,
        softwareDetected: isMotorDetected ? 'Terindikasi Naik Kendaraan (GPS Speed)' : 'Validasi Live GPS Tracker',
        status: 'Menunggu'
    };

    state.laporanValidasi.unshift(newReport);
    saveStorage('laporanValidasi', state.laporanValidasi);

    // KIRIM LANGSUNG SEBAGAI BARIS BARU (APPEND), BUKAN TIMPA SEMUA
    try {
        await apiPost({
            action: "APPEND_LAPORAN_VALIDASI",
            data: newReport
        });
        if (toast) toast.remove();
        showToast('Laporan Jogging berhasil masuk ke Google Spreadsheet!', 'success');
    } catch (err) {
        if (toast) toast.remove();
        showToast('Tersimpan di HP (offline). Akan sinkron otomatis saat online.', 'error');
    }

    renderSidebar();
    renderContent();
}

async function deleteJoggingLog(id) {
    state.joggingLogs = state.joggingLogs.filter(j => j.id !== id);
    saveStorage('joggingLogs', state.joggingLogs);
    renderContent();
    showToast('Data jogging dihapus!', 'success');
}

async function deleteMASLog(id) {
    state.masLogs = state.masLogs.filter(m => m.id !== id);
    saveStorage('masLogs', state.masLogs);
    renderContent();
    showToast('Data MAS dihapus!', 'success');
}

function generateJoggingSkuad(event) {
  if (event) event.preventDefault();

  if (!state.atlet || state.atlet.length === 0) {
    showToast("Data atlet belum dimuat!", "error");
    return;
  }

  const selectedId = document.getElementById('jogging-atlet-id')?.value;
  const zona = document.getElementById('jogging-zona')?.value || "0.75";
  const waktu = parseFloat(document.getElementById('jogging-waktu')?.value) || 30;
  const tanggal = document.getElementById('jogging-tanggal')?.value || new Date().toISOString().split('T')[0];

  // 1. Tentukan target atlet: Semua atlet atau 1 atlet terpilih (pencocokan case-insensitive)
  let targetAthletes = [];
  if (selectedId === 'semua' || !selectedId) {
    targetAthletes = [...state.atlet];
  } else {
    const found = state.atlet.find(a => String(a.id).trim().toLowerCase() === String(selectedId).trim().toLowerCase());
    if (found) targetAthletes = [found];
  }

  if (targetAthletes.length === 0) {
    showToast("Atlet tidak ditemukan!", "error");
    return;
  }

  // 2. Kalkulasi metrik personal per individu berdasarkan data tes terbaru masing-masing
  const newLogs = targetAthletes.map(atlet => {
    // Panggil fungsi getAtletVO2Max yang sudah akurat membaca riwayat tes terakhir atlet
    const vo2 = getAtletVO2Max(atlet.id) || (atlet.posisi === 'GK' ? 42.0 : (atlet.gender === 'Putri' ? 45.0 : 48.5));
    
    const masKmh = vo2 / 3.5;
    const factor = parseFloat(zona) || 0.75;
    const speedKmh = masKmh * factor;
    const jarak = parseFloat(((speedKmh * waktu) / 60).toFixed(2));

    const paceDecimal = 60 / speedKmh;
    const paceMin = Math.floor(paceDecimal);
    const paceSec = Math.round((paceDecimal - paceMin) * 60);
    const paceStr = `${paceMin}'${paceSec < 10 ? '0' : ''}${paceSec}" /km`;

    return {
      id: 'j_' + Date.now() + '_' + atlet.id,
      atletId: String(atlet.id),
      namaAtlet: atlet.nama,
      tanggal: tanggal,
      vo2max: String(vo2.toFixed(2)),
      zona: zona,
      jarak: jarak,
      waktu: waktu,
      pace: paceStr
    };
  });

  // 3. Masukkan ke database lokal tanpa menimpa data hari lain
  if (!state.joggingLogs) state.joggingLogs = [];
  
  // Hapus log lama hanya jika atlet dan tanggalnya sama persis agar tidak duplikat
  const targetIds = new Set(targetAthletes.map(a => String(a.id).trim().toLowerCase()));
  state.joggingLogs = state.joggingLogs.filter(j => !(targetIds.has(String(j.atletId).trim().toLowerCase()) && j.tanggal === tanggal));
  
  // Gabungkan seluruh target personal baru ke antrean utama
  state.joggingLogs = [...newLogs, ...state.joggingLogs];
  saveStorage("joggingLogs", state.joggingLogs);
  if (typeof window.pushToFirebaseRT === 'function') {
    window.pushToFirebaseRT('joggingLogs', state.joggingLogs);
  }

  // 4. Sinkronkan ke Google Spreadsheet
  if (typeof syncDataToSpreadsheet === 'function') {
    syncDataToSpreadsheet();
  }

  // 5. Muat ulang antarmuka
  renderContent();
  showToast(`Preskripsi jogging personal berhasil dibagikan ke ${newLogs.length} atlet!`, "success");
}

