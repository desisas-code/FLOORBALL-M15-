function filterAnatomyGroup(groupKey) {
    const cards = document.querySelectorAll('.anatomy-group-card');
    cards.forEach(card => {
        if (groupKey === 'semua' || card.getAttribute('data-group') === groupKey) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });

    ['semua', 'besar', 'sedang', 'kecil'].forEach(key => {
        const btn = document.getElementById(`btn-filter-anatomi-${key}`);
        if (btn) {
            if (key === groupKey) {
                btn.className = "px-4 py-2 rounded-xl text-xs font-black bg-blue-900 text-white shadow-md";
            } else {
                btn.className = "px-4 py-2 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-600 hover:bg-slate-200";
            }
        }
    });
}

function highlightMuscleGroup(muscleKey) {
    let found = null;
    const allMuscles = [
        ...(muscleHierarchyData.mikro || []),
        ...(muscleHierarchyData.kecil || []),
        ...(muscleHierarchyData.sedang || []),
        ...(muscleHierarchyData.besar || [])
    ];

    const keyMap = {
        'stapedius': 'Stapedius',
        'popliteus': 'Popliteus',
        'forearm': 'Flexor',
        'rotator': 'Rotator',
        'deltoid': 'Deltoideus',
        'oblique': 'Obliquus',
        'calves': 'Gastrocnemius',
        'lats': 'Latissimus',
        'hamstring': 'Hamstrings',
        'quads': 'Quadriceps',
        'glute': 'Gluteus'
    };

    const searchName = keyMap[muscleKey] || muscleKey;
    found = allMuscles.find(m => m.namaLatin.toLowerCase().includes(searchName.toLowerCase()));

    const detailBox = document.getElementById('selected-muscle-detail');
    if (!detailBox || !found) return;

    detailBox.innerHTML = `
        <div class="p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl border border-cyan-500/40 shadow-xl space-y-4">
            <div class="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                    <span class="text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-md inline-block mb-1.5">${escapeHTML(found.kategori)}</span>
                    <h4 class="text-lg font-black text-white font-display">${escapeHTML(found.namaLatin)}</h4>
                    <p class="text-xs font-bold text-slate-400">${escapeHTML(found.namaUmum)}</p>
                </div>
                <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black shrink-0">
                    <i class="fa-solid fa-child text-lg"></i>
                </div>
            </div>
            <div class="space-y-3 text-xs">
                <div>
                    <span class="block text-[10px] font-black uppercase text-cyan-400 mb-1">Fungsi Gerakan Floorball:</span>
                    <p class="font-medium text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">${escapeHTML(found.fungsiFloorball)}</p>
                </div>
                <div class="p-3 bg-blue-950/60 rounded-xl border border-blue-800/60">
                    <span class="block text-[10px] font-black uppercase text-blue-300">Rekomendasi Latihan (Drill / Gym):</span>
                    <p class="font-bold text-white mt-1">${escapeHTML(found.drills)}</p>
                </div>
                <div class="p-3 bg-rose-950/50 rounded-xl border border-rose-800/60">
                    <span class="block text-[10px] font-black uppercase text-rose-300">Titik Risiko / Overload:</span>
                    <p class="font-bold text-rose-200 mt-1">${escapeHTML(found.risikoCedera)}</p>
                </div>
            </div>
        </div>
    `;
}

function init3DAnatomyViewer() {
    const container = document.getElementById('anatomy-3d-canvas');
    if (!container || typeof THREE === 'undefined') return;

    if (animationFrameId3D) cancelAnimationFrame(animationFrameId3D);
    container.innerHTML = '';
    muscleMeshMap = {};

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 430;

    scene3D = new THREE.Scene();
    scene3D.background = new THREE.Color(0x070b14);

    camera3D = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera3D.position.set(0, 1.1, 3.7);

    renderer3D = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer3D.setSize(width, height);
    renderer3D.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer3D.domElement);

    controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
    controls3D.enableDamping = true;
    controls3D.dampingFactor = 0.05;
    controls3D.minDistance = 1.8;
    controls3D.maxDistance = 5.5;

    // Pencahayaan
    scene3D.add(new THREE.AmbientLight(0xffffff, 0.75));
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(3, 5, 4);
    scene3D.add(mainLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 1.2, 10);
    rimLight.position.set(-3, 3, -2);
    scene3D.add(rimLight);

    const floorGlow = new THREE.PointLight(0x6366f1, 0.8, 8);
    floorGlow.position.set(0, -2, 2);
    scene3D.add(floorGlow);

    // Material Glossy Serat Otot
    const makeMuscleMat = (hexColor) => new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.32,
        metalness: 0.15,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2
    });

    const boneMat = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        roughness: 0.45,
        metalness: 0.05
    });

    const addPart = (key, geo, mat, pos, rot = [0, 0, 0], scale = [1, 1, 1]) => {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...pos);
        mesh.rotation.set(...rot);
        mesh.scale.set(...scale);
        mesh.userData = { muscleKey: key, originalColor: mat.color.getHex() };
        scene3D.add(mesh);

        if (!muscleMeshMap[key]) muscleMeshMap[key] = [];
        muscleMeshMap[key].push(mesh);
        return mesh;
    };

    // Kerangka
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), boneMat);
    skull.position.set(0, 1.68, 0);
    skull.scale.set(0.9, 1.1, 1.0);
    scene3D.add(skull);

    const ribcage = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.46, 16), boneMat);
    ribcage.position.set(0, 1.2, -0.02);
    scene3D.add(ribcage);

    // 1. Stapedius (Mikro kepala)
    const stapediusGeo = new THREE.SphereGeometry(0.04, 12, 12);
    addPart('stapedius', stapediusGeo, makeMuscleMat(0xf8fafc), [-0.22, 1.7, 0.02]);
    addPart('stapedius', stapediusGeo, makeMuscleMat(0xf8fafc), [0.22, 1.7, 0.02]);

    // 2. Popliteus (Belakang Lutut)
    const popGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 12);
    addPart('popliteus', popGeo, makeMuscleMat(0x10b981), [-0.16, 0.02, -0.09], [0.3, 0, 0.2]);
    addPart('popliteus', popGeo, makeMuscleMat(0x10b981), [0.16, 0.02, -0.09], [0.3, 0, -0.2]);

    // 3. Forearm (Lengan Bawah)
    const forearmGeo = new THREE.CylinderGeometry(0.065, 0.045, 0.42, 16);
    addPart('forearm', forearmGeo, makeMuscleMat(0xf59e0b), [-0.55, 0.78, 0.1], [0.3, 0, 0.15]);
    addPart('forearm', forearmGeo, makeMuscleMat(0xf59e0b), [0.55, 0.78, 0.1], [0.3, 0, -0.15]);

    // 4. Rotator Cuff
    const rotatorGeo = new THREE.SphereGeometry(0.08, 14, 14);
    addPart('rotator', rotatorGeo, makeMuscleMat(0x38bdf8), [-0.3, 1.45, -0.06]);
    addPart('rotator', rotatorGeo, makeMuscleMat(0x38bdf8), [0.3, 1.45, -0.06]);

    // 5. Deltoid (Bahu)
    const deltGeo = new THREE.SphereGeometry(0.15, 16, 16);
    addPart('deltoid', deltGeo, makeMuscleMat(0x0284c7), [-0.38, 1.38, 0.02], [0, 0, 0.4], [1.1, 0.9, 0.9]);
    addPart('deltoid', deltGeo, makeMuscleMat(0x0284c7), [0.38, 1.38, 0.02], [0, 0, -0.4], [1.1, 0.9, 0.9]);

    // 6. Abs / Core Oblique
    const absGeo = new THREE.BoxGeometry(0.11, 0.08, 0.07);
    for (let r = 0; r < 3; r++) {
        addPart('oblique', absGeo, makeMuscleMat(0x14b8a6), [-0.07, 1.05 - (r * 0.09), 0.14]);
        addPart('oblique', absGeo, makeMuscleMat(0x14b8a6), [0.07, 1.05 - (r * 0.09), 0.14]);
    }

    // 7. Betis (Calves)
    const calfGeo = new THREE.SphereGeometry(0.11, 16, 16);
    addPart('calves', calfGeo, makeMuscleMat(0x6366f1), [-0.15, -0.26, -0.04], [0, 0, 0], [1.0, 1.8, 1.1]);
    addPart('calves', calfGeo, makeMuscleMat(0x6366f1), [0.15, -0.26, -0.04], [0, 0, 0], [1.0, 1.8, 1.1]);

    // 8. Dada & Lats
    const pecGeo = new THREE.SphereGeometry(0.18, 16, 16);
    addPart('lats', pecGeo, makeMuscleMat(0xef4444), [-0.14, 1.3, 0.14], [0, 0, -0.3], [1.1, 0.7, 0.6]);
    addPart('lats', pecGeo, makeMuscleMat(0xef4444), [0.14, 1.3, 0.14], [0, 0, 0.3], [1.1, 0.7, 0.6]);

    // 9. Hamstrings
    const hamGeo = new THREE.CylinderGeometry(0.11, 0.08, 0.58, 16);
    addPart('hamstring', hamGeo, makeMuscleMat(0xa855f7), [-0.16, 0.28, -0.08], [-0.05, 0, -0.05]);
    addPart('hamstring', hamGeo, makeMuscleMat(0xa855f7), [0.16, 0.28, -0.08], [-0.05, 0, 0.05]);

    // 10. Quads (Paha Depan)
    const quadGeo = new THREE.CylinderGeometry(0.13, 0.09, 0.62, 16);
    addPart('quads', quadGeo, makeMuscleMat(0xd946ef), [-0.16, 0.28, 0.06], [0.05, 0, -0.08], [1.1, 1.0, 1.1]);
    addPart('quads', quadGeo, makeMuscleMat(0xd946ef), [0.16, 0.28, 0.06], [0.05, 0, 0.08], [1.1, 1.0, 1.1]);

    // 11. Gluteus (Bokong Terbesar)
    const gluteGeo = new THREE.SphereGeometry(0.22, 16, 16);
    addPart('glute', gluteGeo, makeMuscleMat(0x2563eb), [-0.15, 0.65, -0.08], [0, 0, -0.1], [1.0, 1.2, 1.0]);
    addPart('glute', gluteGeo, makeMuscleMat(0x2563eb), [0.15, 0.65, -0.08], [0, 0, -0.1], [1.0, 1.2, 1.0]);

    // Raycaster Klik Otot
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('pointerdown', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera3D);
        const intersects = raycaster.intersectObjects(scene3D.children);

        if (intersects.length > 0) {
            const hit = intersects.find(i => i.object.userData && i.object.userData.muscleKey);
            if (hit) trigger3DMuscleSelect(hit.object.userData.muscleKey);
        }
    });

	window.trigger3DMuscleSelect = function(muscleKey) {
    if (!muscleKey) return;

    // Reset warna semua mesh 3D ke warna aslinya
    Object.values(muscleMeshMap).forEach(meshList => {
        meshList.forEach(mesh => {
            if (mesh.material && mesh.userData.originalColor !== undefined) {
                mesh.material.color.setHex(mesh.userData.originalColor);
            }
        });
    });

    // Sorot mesh 3D yang dipilih dengan warna neon cyan
    if (muscleMeshMap[muscleKey]) {
        muscleMeshMap[muscleKey].forEach(mesh => {
            if (mesh.material) {
                mesh.material.color.setHex(0x00f2fe);
            }
        });
    }

    // Sinkronkan ke kartu detail anatomi
    if (typeof highlightMuscleGroup === 'function') {
        highlightMuscleGroup(muscleKey);
    }
}
    function animate() {
        animationFrameId3D = requestAnimationFrame(animate);
        controls3D.update();
        renderer3D.render(scene3D, camera3D);
    }
    animate();
}

function triggerHUDMuscle(muscleKey) {
    if (!muscleKey) return;

    // 1. Reset semua kelompok otot ke biru gelap blueprint
    document.querySelectorAll('svg g[id^="hotspot-"]').forEach(g => {
        g.querySelectorAll('path, ellipse, rect, circle').forEach(el => {
            el.setAttribute('fill', '#1b4578');
            el.setAttribute('stroke', '#0284c7');
            el.setAttribute('stroke-width', '1.2');
            el.removeAttribute('filter');
        });
    });

    // 2. Beri sorotan neon menyala terang ke otot yang dipilih
    const activeGroup = document.getElementById(`hotspot-${muscleKey}`);
    if (activeGroup) {
        activeGroup.querySelectorAll('path, ellipse, rect, circle').forEach(el => {
            el.setAttribute('fill', '#00f2fe');
            el.setAttribute('stroke', '#ffffff');
            el.setAttribute('stroke-width', '2');
            el.setAttribute('filter', 'url(#hudNeonGlow)');
        });
    }

    // 3. Sorot tombol chip di bawah diagram
    const allBtns = document.querySelectorAll('span[onclick^="triggerHUDMuscle"]');
    allBtns.forEach(btn => {
        if (btn.getAttribute('onclick').includes(`'${muscleKey}'`)) {
            btn.className = "cursor-pointer text-[9px] bg-cyan-400 text-slate-950 px-2.5 py-1 rounded-lg font-black shadow-lg shadow-cyan-400/40 border border-cyan-200 transition";
        } else {
            btn.className = "cursor-pointer text-[9px] bg-slate-900/90 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-800 font-bold transition";
        }
    });

    // 4. Perbarui kartu detail di kanan
    if (typeof highlightMuscleGroup === 'function') {
        highlightMuscleGroup(muscleKey);
    }
}

function cleanupThreeJS() {
    // 1. Batalkan loop animasi aktif
    if (animationFrameId3D) {
        cancelAnimationFrame(animationFrameId3D);
        animationFrameId3D = null;
    }

    // 2. Lepaskan OrbitControls
    if (controls3D) {
        controls3D.dispose();
        controls3D = null;
    }

    // 3. Traversal dan dispose seluruh geometry, material, dan tekstur di Scene
    if (scene3D) {
        scene3D.traverse((object) => {
            if (object.isMesh) {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((mat) => {
                            cleanMaterial(mat);
                            mat.dispose();
                        });
                    } else {
                        cleanMaterial(object.material);
                        object.material.dispose();
                    }
                }
            }
        });

        // Kosongkan scene
        while (scene3D.children.length > 0) {
            scene3D.remove(scene3D.children[0]);
        }
        scene3D = null;
    }

    // 4. Dispose WebGLRenderer & hapus elemen canvas dari DOM
    if (renderer3D) {
        renderer3D.dispose();
        if (renderer3D.domElement && renderer3D.domElement.parentNode) {
            renderer3D.domElement.parentNode.removeChild(renderer3D.domElement);
        }
        renderer3D = null;
    }

    // 5. Reset referensi objek & kamera
    camera3D = null;
    muscleMeshMap = {};
}

function cleanMaterial(material) {
    for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && typeof value === 'object' && 'minFilter' in value) {
            value.dispose();
        }
    }
}

		