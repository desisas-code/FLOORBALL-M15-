function openModalAtlet(id = null) {
    const modal = document.getElementById('modal-atlet');
    const title = document.getElementById('modal-title');
    const btnSubmit = document.getElementById('btn-submit-modal');
    const inputId = document.getElementById('input-id');

    if (id !== null && id !== undefined && id !== '') {
        const target = state.atlet.find(a => String(a.id) === String(id));
        
        if (!target) {
            showToast('Data atlet tidak ditemukan!', 'error');
            return;
        }

        if (title) title.innerHTML = `<i class="fa-solid fa-user-pen text-blue-800"></i> Edit Data Atlet`;
        if (btnSubmit) btnSubmit.innerText = 'Update Data Atlet';
        if (inputId) inputId.value = target.id;

        if (document.getElementById('input-nama')) document.getElementById('input-nama').value = target.nama || '';
        // Mengisi nama panggilan dari ID atlet
        if (document.getElementById('input-panggilan')) document.getElementById('input-panggilan').value = target.id || '';
        if (document.getElementById('input-posisi')) document.getElementById('input-posisi').value = target.posisi || '';
        if (document.getElementById('input-gender')) document.getElementById('input-gender').value = target.gender || '';
        if (document.getElementById('input-usia')) document.getElementById('input-usia').value = target.usia || '';
        if (document.getElementById('input-pin')) document.getElementById('input-pin').value = target.pin || '';
        if (document.getElementById('input-tb')) document.getElementById('input-tb').value = target.tb || '';
        if (document.getElementById('input-bb')) document.getElementById('input-bb').value = target.bb || '';
        if (document.getElementById('input-cedera')) document.getElementById('input-cedera').value = (target.cedera === 'Tidak ada' ? '' : target.cedera) || '';
    } else {
        if (title) title.innerHTML = `<i class="fa-solid fa-user-plus text-blue-800"></i> Input Data Atlet Baru`;
        if (btnSubmit) btnSubmit.innerText = 'Simpan Data Atlet';
        if (inputId) inputId.value = '';
        const form = document.getElementById('form-atlet');
        if (form) form.reset();
        // Mengosongkan kolom nama panggilan saat tambah atlet baru
        if (document.getElementById('input-panggilan')) document.getElementById('input-panggilan').value = '';
    }
    
    if (modal) modal.classList.remove('hidden');
}

function closeModalAtlet() {
    const modal = document.getElementById('modal-atlet');
    if(modal) modal.classList.add('hidden');
    const form = document.getElementById('form-atlet');
    if(form) form.reset();
    const inputId = document.getElementById('input-id');
    if(inputId) inputId.value = '';
}

async function submitFormAtletOptimistic(e) {
    e.preventDefault();
	isSavingData = true;
    const id = document.getElementById('input-id')?.value;
    const nama = document.getElementById('input-nama')?.value?.trim() || '';
    const panggilan = document.getElementById('input-panggilan')?.value?.trim().toLowerCase().replace(/\s+/g, '') || '';
    const posisi = document.getElementById('input-posisi')?.value;
    const gender = document.getElementById('input-gender')?.value;
    const usia = parseInt(document.getElementById('input-usia')?.value) || 0;
    const pin = document.getElementById('input-pin')?.value;
    const tb = parseInt(document.getElementById('input-tb')?.value) || 0;
    const bb = parseInt(document.getElementById('input-bb')?.value) || 0;
    
    const cederaInput = document.getElementById('input-cedera')?.value.trim();
    const cedera = cederaInput && cederaInput.length > 0 ? cederaInput : 'Tidak ada';

    // Tentukan ID: prioritas input panggilan, jika kosong ambil kata pertama nama panjang
    const finalId = panggilan || nama.split(' ')[0].toLowerCase();

    if (id !== null && id !== undefined && id !== '') {
        const idx = state.atlet.findIndex(a => String(a.id) === String(id));
        
        if (idx !== -1) {
            state.atlet[idx] = { 
                id: finalId, // Memperbarui ID jika panggilan diganti saat diedit
                nama, 
                posisi, 
                gender, 
                usia, 
                tb, 
                bb, 
                pin, 
                cedera 
            };
        } else {
            showToast('Gagal memperbarui: ID Atlet tidak ditemukan!', 'error');
            return;
        }
    } else {
        // Cek duplikasi ID agar tidak ada nama panggilan yang kembar
        const isDuplicate = state.atlet.some(a => String(a.id) === String(finalId));
        if (isDuplicate) {
            showToast(`Nama panggilan / ID "${finalId}" sudah digunakan atlet lain!`, 'error');
            return;
        }

        state.atlet.unshift({ 
            id: finalId, 
            nama, 
            posisi, 
            gender, 
            usia, 
            tb, 
            bb, 
            pin, 
            cedera 
        });
    }

    saveStorage('atlet', state.atlet);
	if (typeof window.pushToFirebaseRT === 'function') {
        window.pushToFirebaseRT('atlet', state.atlet);
    }
    closeModalAtlet();
    initMatchPlayerStats();
    renderContent();

    // Pastikan baris ini ada:
    if (typeof syncDataToSpreadsheet === 'function') {
        syncDataToSpreadsheet();
    }
    
    showToast('Data atlet berhasil disimpan ke sistem & Spreadsheet!', 'success');
}

async function deleteAtletOptimistic(id) {
    const isConfirmed = await confirmAction('Hapus Atlet', 'Apakah Anda yakin ingin menghapus atlet ini?');
    if (!isConfirmed) return;

    state.atlet = state.atlet.filter(a => String(a.id) !== String(id));
    saveStorage('atlet', state.atlet);
    renderContent();
    showToast('Atlet berhasil dihapus!', 'success');
}

function filterSearchAtlet(query) {
    state.searchQueryAtlet = query.toLowerCase();
    renderContent();
}

function exportDataAtletCSV() {
    const headers = ['Nama', 'Posisi', 'Gender', 'Usia', 'Tinggi (cm)', 'Berat (kg)', 'PIN', 'Cedera'];
    const rows = state.atlet.map(a => [a.nama, a.posisi, a.gender, a.usia, a.tb, a.bb, a.pin, a.cedera]);
    exportToCSV('Data_Atlet_Floorball.csv', headers, rows);
}