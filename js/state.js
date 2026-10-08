const state = {
    loginRole: 'pelatih',
    currentRole: 'Pelatih',
    currentMenu: 'menu-1',
    sidebarCollapsed: false,
    activeAtlet: null,
    selectedProgramAtlet: null,
    selectedProgramWeek: 1,
    searchQueryAtlet: '',
    currentGpsLocation: null,
    absensiInputMode: 'single',
    gymLogs: loadStorage('gymLogs', []),
    periodisasiConfig: loadStorage('periodisasi', {
        startDate: new Date().toISOString().split('T')[0],
        totalWeeks: 12
    }),
    atlet: loadStorage('atlet', []),
    absensi: loadStorage('absensi', [
        { id: '101', atletId: '1', tanggal: '2026-07-28', jenis: 'Latihan Fisik', status: 'Hadir' },
        { id: '102', atletId: '2', tanggal: '2026-07-28', jenis: 'Latihan Fisik', status: 'Hadir' },
        { id: '103', atletId: '3', tanggal: '2026-07-28', jenis: 'Latihan Fisik', status: 'Izin' }
    ]),
    tesFisik: loadStorage('tesFisik', [
        { id: '201', atletId: '1', tanggal: '2026-07-30', tahap: 'Pre', keyTes: 'vsit', skor: '18' },
        { id: '202', atletId: '1', tanggal: '2026-07-30', tahap: 'Pre', keyTes: 'vjump', skor: '58' },
        { id: '203', atletId: '1', tanggal: '2026-07-30', tahap: 'Pre', keyTes: 'yoyo', skor: '48.5' },
        { id: '204', atletId: '2', tanggal: '2026-07-30', tahap: 'Pre', keyTes: 'yoyo', skor: '52.0' },
        { id: '205', atletId: '3', tanggal: '2026-07-30', tahap: 'Pre', keyTes: 'yoyo', skor: '40.0' }
        ]),
    tesTeknik: loadStorage('tesTeknik', []),
    joggingLogs: loadStorage('joggingLogs', [
        { id: 'j1', atletId: '1', tanggal: '2026-07-29', vo2max: '48.5', zona: '0.75', jarak: 3.93, waktu: 30, pace: '7\'38"' },
        { id: 'j2', atletId: '2', tanggal: '2026-07-29', vo2max: '52.0', zona: '0.75', jarak: 4.20, waktu: 30, pace: '7\'08"' }
    ]),
    masLogs: loadStorage('masLogs', [
        { id: 'm1', atletId: '1', tanggal: '2026-07-30', vo2max: '48.5', walkSec: 15, jogSec: 15, sprintSec: 15, walkDist: 23, jogDist: 40, sprintDist: 69, rep: 10 }
    ]),
    rpeLogs: loadStorage('rpeLogs', [
        { id: 'rpe_1', atletId: '1', namaAtlet: 'Dandi Wijaya', tanggal: '2026-08-25', rpeVal: 7, durasi: 90, hrMax: 178, sRPE: 630, status: 'Disetujui' },
        { id: 'rpe_2', atletId: '2', namaAtlet: 'Rian Pratama', tanggal: '2026-08-25', rpeVal: 6, durasi: 90, hrMax: 165, sRPE: 540, status: 'Disetujui' },
        { id: 'rpe_3', atletId: '3', namaAtlet: 'Fajar Nugraha', tanggal: '2026-08-26', rpeVal: 8, durasi: 75, hrMax: 182, sRPE: 600, status: 'Disetujui' }
        ]),
    uploadedHashes: new Set(loadStorage('uploadedHashes', ['img_dummy_strava_sample_1', 'img_dummy_strava_sample_2'])),
    laporanValidasi: loadStorage('laporanValidasi', []),
    matchLive: loadStorage('matchLive', {
        scoreTeam: 0,
        scoreOpponent: 0,
        foulTeam: 0,
        foulOpponent: 0,
        period: 'Babak 1',
        matchTimer: { isRunning: false, startTime: null, intervalId: null, elapsedSec: 0 },
        activeLine: 'Line 1',
        activePlayerId: '1',
        activeSpatialEventType: 'loss',
        spatialEvents: [],
        activeGKId: '3',
        lines: {
            'Line 1': { FL: '5', FR: '1', C: '6', DL: '2', DR: '4' },
            'Line 2': { FL: '', FR: '', C: '', DL: '', DR: '' },
            'Line 3': { FL: '', FR: '', C: '', DL: '', DR: '' },
            'Line 4': { FL: '', FR: '', C: '', DL: '', DR: '' }
        },
        playerStats: {},
        dribbleTimer: { isRunning: false, startTime: null, intervalId: null, elapsedSec: 0 },
        logs: []
    })
};

window.state = state;
window.saveStorage = saveStorage;
window.loadStorage = loadStorage;