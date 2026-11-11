'use strict';
const $ = s => document.querySelector(s), sh = a => [...a].sort(() => Math.random() - .5);
const CH = [['👨‍💻', 'Network Explorer'], ['👩‍💻', 'Digital Detective'], ['🧑‍🚀', 'Cyber Navigator']];
const BD = ['🏅 PAN Beginner', '🏅 Bluetooth Expert', '🏅 NFC Master', '🏅 Network Detective', '🏅 Cyber Safety Hero', '🏆 PAN MASTER'];
const LV = [['🔍', 'Kenali PAN'], ['🔗', 'Hubungkan Perangkat'], ['🔵', 'Detektif Bluetooth'], ['📡', 'Misi NFC'], ['🟢', 'PAN atau Bukan?'], ['🛠️', 'Selamatkan Jaringan'], ['🌎', 'PAN vs LAN vs MAN vs WAN'], ['🔥', 'Boss: Master Network'], ['📝', 'Asesmen Akhir']];
const S = { name: '', kelas: '', ch: 0, score: 0, lives: 3, combo: 0, done: [], badges: [], mis: 0, snap: 0, cur: 0 };
try { Object.assign(S, JSON.parse(localStorage.getItem('pan_s') || '{}')) } catch (e) { }
const save = () => { try { localStorage.setItem('pan_s', JSON.stringify({ name: S.name, kelas: S.kelas, ch: S.ch, score: S.score, done: S.done, badges: S.badges })) } catch (e) { } };
const view = h => { $('#app').innerHTML = h; window.scrollTo(0, 0) };
const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d } catch (e) { return d } };

/* ---------- suara ---------- */
let AC, sfxOn = true, musicOn = false, mt;
function beep(f, d, ty = 'sine', v = .07) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.type = ty; o.frequency.value = f; g.gain.setValueAtTime(v, AC.currentTime); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + d); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + d) } catch (e) { } }
const sfx = ok => { if (!sfxOn) return; ok ? (beep(660, .12), setTimeout(() => beep(880, .16), 110)) : beep(180, .3, 'sawtooth', .05) };
function toggleMusic() { musicOn = !musicOn; clearInterval(mt); $('#bMus').classList.toggle('active', musicOn); if (musicOn) { const n = [262, 330, 392, 523, 392, 330]; let i = 0; mt = setInterval(() => beep(n[i++ % 6], .4, 'triangle', .025), 450) } }
function toggleSfx() { sfxOn = !sfxOn; $('#bSfx').innerHTML = `<i class="bi bi-volume-${sfxOn ? 'up' : 'mute'}-fill"></i>` }
function theme() { const h = document.documentElement, d = h.dataset.bsTheme == 'dark' ? 'light' : 'dark'; h.dataset.bsTheme = d; localStorage.setItem('pan_t', d) }

/* ---------- HUD & efek ---------- */
function hud() {
  $('#hScore').textContent = S.score; $('#hLives').textContent = '❤️'.repeat(Math.max(S.lives, 0)) || '💔'; $('#hCombo').textContent = '🔥 x' + S.combo;
  const p = Math.round(S.done.length / 9 * 100); $('#hProg').style.width = p + '%'; $('#hProgT').textContent = p + '%';
}
function pop(t) { const e = document.createElement('div'); e.className = 'pop' + (t[0] == '-' ? ' neg' : ''); e.textContent = t; document.body.appendChild(e); setTimeout(() => e.remove(), 1000) }
function confetti(n = 30) { for (let i = 0; i < n; i++) { const e = document.createElement('span'); e.className = 'cf'; e.textContent = ['🎉', '⭐', '✨', '📡', '🔵'][i % 5]; e.style.left = Math.random() * 100 + 'vw'; e.style.animationDelay = Math.random() * .8 + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3500) } }
function modal(t, b, f = '') { $('#mT').innerHTML = t; $('#mB').innerHTML = b; $('#mF').innerHTML = f; bootstrap.Modal.getOrCreateInstance('#mdl').show() }
const al = (c, m) => `<div class="alert alert-${c} fade-in mb-0">${m}</div>`;

/* ---------- skor ---------- */
function res(ok, pts, msg) {
  if (ok) { S.combo++; const g = pts + Math.min(S.combo - 1, 5) * 2; S.score += g; pop('+' + g) }
  else { S.combo = 0; S.lives--; S.mis++; S.score = Math.max(0, S.score - 5); pop('-5') }
  sfx(ok); hud(); $('#fb').innerHTML = al(ok ? 'success' : 'danger', (ok ? '✅ ' : '❌ ') + msg);
  if (S.lives <= 0) { gameOver(); return false }
  return true;
}
function gameOver() { modal('💔 Nyawa Habis', 'Jangan menyerah! Baca petunjuknya, lalu coba level ini lagi.', '<button class="btn btn-outline-secondary" data-bs-dismiss="modal" onclick="map()">Peta Level</button><button class="btn btn-primary" data-bs-dismiss="modal" onclick="S.score=S.snap;start(S.cur)">Coba Lagi</button>') }
function finish(id, b, ex = 20) {
  let t = `+${ex} poin ${id == 8 ? 'Boss Level' : 'misi selesai'}`; S.score += ex;
  if (!S.mis) { S.score += 50; t += '<br>+50 poin: level tanpa kesalahan! 🌟' }
  if (b && !S.badges.includes(b)) S.badges.push(b);
  if (!S.done.includes(id)) S.done.push(id);
  save(); hud(); confetti(25); sfx(1);
  modal('🎉 Level Selesai!', `<p class="fs-5">${t}</p>${b ? `<p class="fs-3">${b}</p>` : ''}`,
    `<button class="btn btn-outline-secondary" data-bs-dismiss="modal" onclick="map()">Peta Level</button>${id < 9 ? `<button class="btn btn-primary" data-bs-dismiss="modal" onclick="start(${id + 1})">Lanjut ▶</button>` : ''}`);
}

/* ---------- layar ---------- */
function home() {
  view(`<section class="hero text-center fade-in">
  <div class="orbit">${['📱', '💻', '⌚', '🎧', '⌨️', '🖱️'].map((e, i) => `<span class="dv d${i}">${e}</span>`).join('')}<div class="core"><i class="bi bi-bluetooth"></i></div></div>
  <h1 class="title">PAN NETWORK<br>ADVENTURE</h1>
  <p class="lead">Misi Menghubungkan Dunia Pribadimu!</p>
  <div class="d-flex flex-wrap gap-2 justify-content-center mb-3"><span class="badge text-bg-primary fs-6"><i class="bi bi-bluetooth"></i> Bluetooth</span><span class="badge text-bg-success fs-6">📡 NFC</span><span class="badge text-bg-info fs-6"><i class="bi bi-wifi"></i> Gelombang jaringan</span></div>
  <div class="d-grid gap-2 col-md-5 mx-auto"><button class="btn btn-lg btn-primary glow" onclick="pick()">▶️ MULAI PETUALANGAN</button><button class="btn btn-lg btn-outline-info" onclick="learn()">📖 PELAJARI PAN</button><button class="btn btn-lg btn-outline-warning" onclick="board()">🏆 PAPAN SKOR</button></div></section>`);
}
function pick() {
  view(`<div class="panel mx-auto fade-in" style="max-width:720px"><h2>Pilih Karakter</h2><div class="row g-3 my-1">${CH.map((c, i) => `<div class="col-4"><input type="radio" class="btn-check" name="ch" id="c${i}" ${i == S.ch ? 'checked' : ''} onchange="S.ch=${i}"><label class="btn btn-outline-primary w-100 char" for="c${i}"><span class="fs-1">${c[0]}</span><br><small>${c[1]}</small></label></div>`).join('')}</div>
  <div class="row g-2"><div class="col-8"><input id="nm" class="form-control" placeholder="Nama" value="${S.name}"></div><div class="col-4"><input id="kl" class="form-control" placeholder="Kelas" value="${S.kelas}"></div></div>
  <button class="btn btn-primary btn-lg w-100 mt-3" onclick="welcome()">Mulai Misi</button></div>`);
}
function welcome() {
  S.name = $('#nm').value.trim() || 'Penjelajah'; S.kelas = $('#kl').value.trim() || '9'; save();
  view(`<div class="panel text-center mx-auto fade-in" style="max-width:720px"><div style="font-size:4rem">${CH[S.ch][0]}</div><h2>Selamat datang, ${CH[S.ch][1]}!</h2>
  <p class="lead">Halo, <b>${S.name}</b>. Misi pertamamu: temukan perangkat yang dapat membentuk jaringan pribadi. Selesaikan 7 level, kalahkan Boss, lalu ikuti asesmen akhir!</p>
  <button class="btn btn-primary btn-lg" onclick="map()">Lihat Peta Misi ▶</button></div>`);
}
function map() {
  S.cur = 0; S.lives = 3; S.combo = 0; hud();
  view(`<h2 class="mb-3 fade-in">Peta Misi</h2><div class="row g-3">${LV.map((l, i) => {
    const id = i + 1, ok = id == 1 || S.done.includes(id - 1), dn = S.done.includes(id);
    return `<div class="col-6 col-md-4 col-lg-3"><button class="lv" ${ok ? '' : 'disabled'} onclick="start(${id})"><div class="fs-1">${ok ? l[0] : '🔒'}</div><b>${id < 8 ? 'LEVEL ' + id : id == 8 ? 'BOSS' : 'AKHIR'}</b><small>${l[1]}</small>${dn ? '<span class="badge text-bg-success mt-1">Selesai ✓</span>' : ''}</button></div>`
  }).join('')}</div><h4 class="mt-4">Pencapaian</h4>${BD.map(b => `<span class="bdg ${S.badges.includes(b) ? 'on' : ''}">${b}</span>`).join('')}`);
}
function start(id) { S.cur = id; S.lives = 3; S.mis = 0; S.combo = 0; S.snap = S.score; hud(); LVF[id](); }
function frame(t, story) {
  view(`<div class="d-flex justify-content-between align-items-center mb-2 fade-in"><button class="btn btn-sm btn-outline-secondary" onclick="map()">⬅ Peta</button><h3 class="m-0 text-center">${t}</h3><span style="width:60px"></span></div>
  <div class="panel"><p class="story">${story}</p><div id="stp" class="mb-2"></div><div id="stage"></div></div><div id="fb" class="mt-3" aria-live="polite"></div>`);
}

/* ---------- mesin game ---------- */
function pickGame(it, pts, done) {
  const n = it.filter(x => x[2]).length; let f = 0;
  $('#stage').innerHTML = `<div class="row g-3">${it.map((x, i) => `<div class="col-6 col-md-3"><button class="dev w-100 h-100" data-i="${i}"><span class="fs-1">${x[0]}</span><b>${x[1]}</b></button></div>`).join('')}</div><p class="mt-3 mb-0">Ditemukan: <b id="fc">0</b> / ${n}</p>`;
  document.querySelectorAll('.dev').forEach(b => b.onclick = () => {
    const x = it[b.dataset.i], ok = !!x[2]; if (b.disabled) return;
    if (!res(ok, pts, (ok ? 'Benar! ' : 'Coba lagi! ') + x[3])) return;
    b.disabled = true; b.classList.add(ok ? 'good' : 'bad');
    if (ok) { f++; $('#fc').textContent = f; if (f == n) setTimeout(done, 1000) }
  });
}
function matchGame(it, zs, pts, done) {
  let sel = -1, left = it.length;
  $('#stage').innerHTML = `<div class="row g-3"><div class="col-md-6">${it.map((x, i) => `<button class="chip mb-2 w-100" draggable="true" data-i="${i}">${x.t}</button>`).join('')}</div><div class="col-md-6">${zs.map(z => `<div class="dz mb-2" tabindex="0" role="button" data-z="${z[0]}"><b>${z[1]}</b><div class="drop"></div></div>`).join('')}</div></div><small class="text-muted">Seret kartu ke kotak, atau ketuk kartu lalu ketuk kotak.</small>`;
  const chips = [...document.querySelectorAll('.chip')], pk = i => { sel = i; chips.forEach((c, j) => c.classList.toggle('sel', j == i)) };
  chips.forEach(c => { c.onclick = () => pk(+c.dataset.i); c.ondragstart = e => { pk(+c.dataset.i); e.dataTransfer.setData('text', 'x') } });
  function place(z) {
    if (sel < 0) { $('#fb').innerHTML = al('info', '👆 Pilih kartu dulu, lalu tentukan kotaknya.'); return }
    const x = it[sel], c = chips[sel], ok = z.dataset.z == x.a;
    if (!res(ok, pts, (ok ? 'Terhubung! ✨ ' : 'Coba lagi! 🔄 ') + (ok ? x.y : x.h))) return;
    if (ok) { c.classList.remove('sel'); c.classList.add('linked'); c.draggable = false; c.disabled = true; z.querySelector('.drop').appendChild(c); sel = -1; if (!--left) setTimeout(done, 1000) }
    else { c.classList.add('shake'); setTimeout(() => c.classList.remove('shake'), 500); pk(-1) }
  }
  document.querySelectorAll('.dz').forEach(z => {
    z.onclick = () => place(z); z.onkeydown = e => { if (e.key == 'Enter' || e.key == ' ') { e.preventDefault(); place(z) } };
    z.ondragover = e => { e.preventDefault(); z.classList.add('over') }; z.ondragleave = () => z.classList.remove('over');
    z.ondrop = e => { e.preventDefault(); z.classList.remove('over'); place(z) };
  });
}
function mcq(qs, pts, done, quiz) {
  let i = 0, ok = 0;
  const show = () => {
    const q = qs[i], o = sh([q[1], q[2], q[3], q[4]].map((t, k) => [t, !k]));
    $('#stage').innerHTML = `<div class="small text-muted">Soal ${i + 1} dari ${qs.length}</div><h4 class="my-2">${q[0]}</h4><div class="d-grid gap-2">${o.map((x, k) => `<button class="btn btn-outline-primary text-start opt"><b>${'ABCD'[k]}.</b> ${x[0]}</button>`).join('')}</div><div id="nx" class="mt-3"></div>`;
    const bs = [...document.querySelectorAll('.opt')];
    bs.forEach((b, k) => b.onclick = () => {
      if (b.disabled) return; const g = o[k][1];
      bs.forEach((x, j) => { x.disabled = true; if (o[j][1]) x.classList.replace('btn-outline-primary', 'btn-success') });
      if (!g) b.classList.replace('btn-outline-primary', 'btn-danger'); else ok++;
      if (quiz) { sfx(g); $('#fb').innerHTML = al(g ? 'success' : 'danger', (g ? '✅ Benar! ' : '❌ Belum tepat. ') + q[5]) }
      else if (!res(g, pts, g ? `<b>BENAR! +${pts} POIN</b> ${q[5]}` : `Belum tepat. ${q[5]}`)) return;
      $('#nx').innerHTML = `<button class="btn btn-primary" id="nb">${i + 1 < qs.length ? 'Lanjut ▶' : 'Selesai ✓'}</button>`;
      $('#nb').onclick = () => { i++; $('#fb').innerHTML = ''; i < qs.length ? show() : done(ok) }; $('#nb').focus();
    });
  };
  show();
}
document.addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA/.test(e.target.tagName) || e.ctrlKey || e.metaKey) return;
  const k = 'abcd'.indexOf(e.key.toLowerCase()), n = '1234'.indexOf(e.key), j = k > -1 ? k : n, b = document.querySelectorAll('.opt')[j];
  if (j > -1 && b && !b.disabled) b.click();
});

/* ---------- level ---------- */
const TQ = (t, y, a, b, c, e) => [t, y, a, b, c, e]; // benar selalu pilihan pertama; urutan diacak saat tampil
const Q3 = [
  TQ('Rina ingin menghubungkan HP dengan earbuds tanpa kabel. Teknologi apa yang paling tepat?', 'Bluetooth', 'LAN', 'WAN', 'MAN', 'Bluetooth adalah teknologi nirkabel jarak pendek yang banyak dipakai untuk menghubungkan perangkat pribadi.'),
  TQ('Berapa jangkauan PAN pada umumnya?', 'Sekitar 1–10 meter', 'Sekitar 1 kilometer', 'Seluas satu kota', 'Antar negara', 'PAN berjangkauan dekat, sekitar di sekitar tubuh pemilik perangkat (kurang lebih 10 meter).'),
  TQ('Sebelum earbuds baru dipakai dengan HP, langkah pertama yang dilakukan adalah…', 'Melakukan pairing', 'Memasang kabel LAN', 'Membeli kuota WAN', 'Memasang router', 'Pairing adalah proses saling mengenalkan dua perangkat Bluetooth agar bisa terhubung.'),
  TQ('Dimas ingin laptopnya memakai internet dari HP. Fitur yang dipakai adalah…', 'Tethering / hotspot pribadi', 'Menara pemancar', 'Kabel serat optik', 'Server sekolah', 'Tethering membagikan koneksi internet HP ke perangkat lain di dekatnya.'),
  TQ('Mengapa smartwatch memakai Bluetooth untuk terhubung ke HP?', 'Hemat baterai dan cukup untuk jarak dekat', 'Karena jangkauannya antar kota', 'Karena wajib memakai kabel', 'Karena butuh server besar', 'Bluetooth hemat daya, cocok untuk perangkat kecil seperti smartwatch.'),
  TQ('Mana yang merupakan kekurangan PAN?', 'Jangkauannya terbatas dan bisa terputus bila terlalu jauh', 'Harus memakai kabel panjang', 'Hanya bisa dipakai di kantor', 'Tidak bisa dipakai di rumah', 'Kekurangan PAN: jangkauan pendek dan jumlah perangkat terbatas.'),
  TQ('HP tiba-tiba menerima permintaan pairing dari perangkat tak dikenal. Sebaiknya…', 'Ditolak', 'Langsung diterima', 'Dibalas dengan kata sandi', 'Dibiarkan Bluetooth menyala terus', 'Perangkat asing bisa berniat jahat. Tolak permintaan yang tidak kamu kenal.'),
  TQ('Kamu ingin mengirim foto ke HP teman lewat Bluetooth, tetapi HP teman tidak muncul. Penyebab paling mungkin?', 'Bluetooth teman belum aktif atau tidak terlihat', 'Kabel LAN putus', 'Router mati', 'Server down', 'Bluetooth kedua perangkat harus aktif dan terlihat agar bisa saling menemukan.')
];
const Q8 = [
  TQ('Saat Bluetooth tidak dipakai, sebaiknya…', 'Dimatikan', 'Dibiarkan menyala terus', 'Dibuat terlihat oleh semua orang', 'Diberi nama aneh', 'Bluetooth yang menyala terus memberi peluang orang asing mencoba terhubung.'),
  TQ('Ada perangkat tak dikenal meminta pairing. Tindakan yang aman adalah…', 'Menolak permintaan itu', 'Menerimanya agar cepat', 'Menyebarkan kode pairing', 'Mematikan antivirus', 'Hanya sambungkan perangkat yang kamu kenal dan percayai.')
];
const QF = [
  TQ('Jaringan komputer yang menghubungkan perangkat pribadi dalam jarak dekat disebut…', 'PAN', 'WAN', 'MAN', 'Internet global', 'PAN (Personal Area Network) adalah jaringan pribadi berjangkauan dekat.'),
  TQ('Fungsi utama PAN adalah…', 'Menghubungkan perangkat pribadi untuk berbagi data atau koneksi', 'Menghubungkan antar negara', 'Menyimpan data di pusat data', 'Menghubungkan seluruh kota', 'PAN memudahkan perangkat milik satu orang saling berbagi data atau internet.'),
  TQ('Contoh PAN dalam kehidupan sehari-hari adalah…', 'Smartwatch terhubung ke HP', 'Jaringan antar kantor cabang', 'Internet satu negara', 'Komputer lab sekolah', 'Smartwatch dan HP dalam jarak dekat membentuk PAN.'),
  TQ('Teknologi nirkabel jarak pendek untuk earbuds dan speaker portabel adalah…', 'Bluetooth', 'Serat optik', 'Kabel koaksial', 'Satelit', 'Bluetooth memakai gelombang radio berdaya rendah untuk jarak dekat.'),
  TQ('NFC paling tepat dipakai untuk…', 'Pembayaran digital dengan menempelkan perangkat', 'Menonton video antar kota', 'Menghubungkan gedung kampus', 'Mengirim email ke luar negeri', 'NFC bekerja pada jarak sangat dekat, beberapa sentimeter saja.'),
  TQ('Menghubungkan HP ke laptop memakai kabel data termasuk PAN lewat…', 'USB', 'WAN', 'Satelit', 'Router ISP', 'Kabel USB menghubungkan perangkat pribadi secara langsung.'),
  TQ('HP membagikan internet ke laptop. Ini disebut…', 'Tethering / hotspot pribadi', 'Streaming', 'Rooting', 'Booting', 'Tethering berbagi koneksi internet HP ke perangkat lain.'),
  TQ('Jangkauan PAN yang umum adalah…', 'Kurang lebih 10 meter', 'Sekitar 10 kilometer', 'Sekitar 100 kilometer', 'Tidak terbatas', 'PAN berjangkauan pendek, sekitar di sekeliling pemiliknya.'),
  TQ('Tindakan aman saat memakai Bluetooth adalah…', 'Menerima pairing hanya dari perangkat yang dikenal', 'Menerima semua permintaan', 'Membagikan kode pairing', 'Menyalakan Bluetooth selamanya', 'Waspada pada permintaan koneksi dari perangkat yang tidak dikenal.'),
  TQ('Perbedaan PAN dan LAN yang benar adalah…', 'PAN untuk perangkat pribadi berjarak dekat, LAN untuk area seperti sekolah atau kantor', 'PAN lebih luas daripada LAN', 'PAN sama dengan WAN', 'LAN hanya untuk satu HP', 'PAN berskala pribadi, LAN mencakup satu gedung atau lingkungan.')
];
const LVF = {
  1() {
    frame('Level 1 — Kenali PAN', 'Pilih perangkat yang dapat digunakan dalam <b>Personal Area Network</b>!');
    pickGame([
      ['📱', 'Smartphone', 1, 'Smartphone menjadi pusat PAN: terhubung ke smartwatch dan earbuds lewat Bluetooth.'],
      ['💻', 'Laptop', 1, 'Laptop dapat terhubung ke HP lewat Bluetooth, USB, atau tethering.'],
      ['⌚', 'Smartwatch', 1, 'Smartwatch dapat terhubung dengan smartphone melalui Bluetooth.'],
      ['🎧', 'Earbuds', 1, 'Earbuds nirkabel memakai Bluetooth pada jarak dekat.'],
      ['⌨️', 'Keyboard Bluetooth', 1, 'Keyboard Bluetooth terhubung langsung ke laptop atau tablet milikmu.'],
      ['🖨️', 'Printer kantor', 0, 'Perhatikan: printer kantor dipakai bersama banyak orang lewat jaringan LAN, bukan jaringan pribadi.'],
      ['📺', 'TV ruang keluarga', 0, 'Perhatikan: TV tidak dibawa-bawa dan biasanya bukan bagian dari jaringan pribadi jarak dekat.'],
      ['🖥️', 'Komputer lab', 0, 'Perhatikan: komputer laboratorium terhubung kabel dalam LAN sekolah.']
    ], 10, () => finish(1, BD[0]));
  },
  2() {
    frame('Level 2 — Hubungkan Perangkat', 'Hubungkan perangkat dengan teknologi yang paling sesuai!');
    matchGame([
      { t: '📱 Smartphone → ⌚ Smartwatch (kirim notifikasi)', a: 'bt', y: 'Smartphone → Smartwatch → Bluetooth.', h: 'Petunjuk: perangkat kecil, jarak dekat, tanpa kabel, hemat daya.' },
      { t: '📱 Smartphone → 🎧 Earbuds (dengar musik)', a: 'bt', y: 'Smartphone → Earbuds → Bluetooth.', h: 'Petunjuk: kamu tidak ingin memakai kabel saat mendengar musik.' },
      { t: '📱 Smartphone → 💻 Laptop (berbagi internet)', a: 'teth', y: 'Smartphone → Laptop → Tethering.', h: 'Petunjuk: yang dibagikan adalah koneksi internet milik HP.' },
      { t: '📱 Smartphone → 💻 Laptop (pindah file lewat kabel data)', a: 'usb', y: 'Smartphone → Laptop → USB.', h: 'Petunjuk: ada kabel fisik yang dipasang.' },
      { t: '📱 Smartphone → 💳 Mesin kasir (bayar dengan menempel)', a: 'nfc', y: 'Smartphone → Mesin kasir → NFC.', h: 'Petunjuk: jaraknya hanya beberapa sentimeter.' }
    ], [['bt', '🔵 Bluetooth'], ['nfc', '🟢 NFC'], ['usb', '🔌 USB'], ['teth', '📶 Tethering']], 15, () => finish(2, null));
  },
  3() { frame('Level 3 — Detektif Bluetooth', 'Baca situasinya, lalu pilih teknologi atau tindakan yang paling tepat. <small>(Tekan A–D atau 1–4)</small>'); mcq(Q3, 20, () => finish(3, BD[1])); },
  4() {
    frame('Level 4 — Misi NFC', 'Dekatkan kedua perangkat untuk melakukan komunikasi menggunakan <b>NFC</b>! Seret HP-mu ke kanan.');
    $('#stage').innerHTML = `<div class="nfc" id="nf"><div class="ph" id="pa" tabindex="0" aria-label="HP-mu, geser dengan panah kanan">📱<small>HP-mu</small></div><div class="waves" id="wv"></div><div class="ph" id="pb">📲<small>HP teman</small></div></div>
    <div class="text-center mt-2">Jarak: <b id="ds"></b> <span class="btn-group ms-2"><button class="btn btn-sm btn-outline-primary" id="bm">◀</button><button class="btn btn-sm btn-outline-primary" id="bp">▶</button></span></div>`;
    const nf = $('#nf'), pa = $('#pa'), pw = 70; let x = 0, dn = 0;
    const upd = () => { const W = nf.clientWidth, mx = W - pw * 2 - 10; x = Math.min(Math.max(0, x), mx); pa.style.left = x + 'px'; const g = mx - x; $('#ds').textContent = Math.round(g / W * 40) + ' cm'; if (!dn && g <= 12) conn() };
    function conn() {
      dn = 1; $('#wv').classList.add('on'); nf.insertAdjacentHTML('beforeend', '<div class="conn">CONNECTED!</div>');
      if (res(true, 20, 'NFC digunakan untuk komunikasi nirkabel jarak sangat dekat, misalnya pembayaran digital atau pertukaran informasi.')) setTimeout(() => finish(4, BD[2]), 1600);
    }
    pa.onpointerdown = e => { pa.setPointerCapture(e.pointerId); const sx = e.clientX, ox = x; pa.onpointermove = m => { x = ox + m.clientX - sx; upd() } };
    pa.onpointerup = () => pa.onpointermove = null;
    pa.onkeydown = e => { if (e.key == 'ArrowRight') { x += 30; upd() } if (e.key == 'ArrowLeft') { x -= 30; upd() } };
    $('#bp').onclick = () => { x += 40; upd() }; $('#bm').onclick = () => { x -= 40; upd() }; upd();
  },
  5() {
    frame('Level 5 — PAN atau Bukan?', 'Masukkan setiap situasi ke kotak <b>PAN</b> atau <b>BUKAN PAN</b>.');
    matchGame([
      { t: 'Smartwatch terhubung ke smartphone', a: 'p', y: 'Perangkat pribadi, jarak dekat: PAN.', h: 'Pikirkan jaraknya dan siapa pemilik perangkatnya.' },
      { t: 'Earbuds terhubung ke smartphone', a: 'p', y: 'Bluetooth antar perangkat pribadi: PAN.', h: 'Perangkat milik satu orang dan sangat berdekatan.' },
      { t: 'Komputer di laboratorium saling terhubung', a: 'n', y: 'Itu LAN, karena banyak komputer dalam satu ruangan atau gedung.', h: 'Banyak komputer bersama, bukan perangkat pribadi satu orang.' },
      { t: 'Smartphone melakukan tethering ke laptop', a: 'p', y: 'HP dan laptop pribadi berdekatan: PAN.', h: 'Keduanya perangkat pribadi yang berdekatan.' },
      { t: 'Jaringan antar gedung sekolah', a: 'n', y: 'Jangkauannya ratusan meter, melebihi PAN.', h: 'Jaraknya jauh lebih luas dari sekitar tubuhmu.' },
      { t: 'Smartphone memakai NFC untuk pembayaran', a: 'p', y: 'Komunikasi jarak sangat dekat: PAN.', h: 'NFC bekerja hanya beberapa sentimeter.' }
    ], [['p', '🟢 PAN'], ['n', '🔴 BUKAN PAN']], 10, () => finish(5, BD[3]));
  },
  6() {
    frame('Level 6 — Selamatkan Jaringan', 'Smartphone milik Raka tidak dapat terhubung dengan earbuds Bluetooth. Pilih <b>langkah yang tepat</b> untuk menyelesaikan masalahnya!');
    pickGame([
      ['🔵', 'Aktifkan Bluetooth di HP', 1, 'Bluetooth harus menyala di HP dan earbuds.'],
      ['📏', 'Dekatkan perangkat', 1, 'Bluetooth berjangkauan pendek, jadi dekatkan kedua perangkat.'],
      ['🎧', 'Nyalakan mode pairing earbuds', 1, 'Earbuds harus dalam mode pairing agar dapat ditemukan.'],
      ['🔋', 'Isi baterai perangkat', 1, 'Baterai yang habis atau lemah membuat koneksi gagal.'],
      ['🔌', 'Pasang kabel LAN', 0, 'Bluetooth bersifat nirkabel, tidak memakai kabel LAN.']
    ], 10, () => finish(6, null));
  },
  7() {
    frame('Level 7 — PAN vs LAN vs MAN vs WAN', 'Pasangkan setiap kasus dengan jenis jaringan yang benar.');
    matchGame([
      { t: 'Smartwatch dengan HP', a: 'p', y: 'Jangkauan beberapa meter: PAN.', h: 'Skalanya paling kecil: pribadi.' },
      { t: 'Jaringan komputer laboratorium sekolah', a: 'l', y: 'Satu gedung atau lingkungan: LAN.', h: 'Bayangkan satu ruangan atau satu gedung.' },
      { t: 'Jaringan antar gedung dalam satu kota', a: 'm', y: 'Mencakup satu kota: MAN.', h: 'Lebih luas dari gedung, tetapi belum antar negara.' },
      { t: 'Internet global', a: 'w', y: 'Mencakup dunia: WAN.', h: 'Skalanya paling luas.' },
      { t: 'Mouse Bluetooth dengan laptop', a: 'p', y: 'Perangkat pribadi berdekatan: PAN.', h: 'Mouse hanya terpakai beberapa puluh sentimeter dari laptop.' }
    ], [['p', '👤 PAN'], ['l', '🏫 LAN'], ['m', '🏙️ MAN'], ['w', '🌎 WAN']], 10, () => finish(7, null));
  },
  8() {
    frame('🔥 BOSS LEVEL: MASTER NETWORK', 'Kamu di rumah dengan smartphone, smartwatch, earbuds, laptop, dan printer. Tentukan perangkat yang dapat membentuk PAN dan teknologi untuk menghubungkannya.');
    const step = (n, t) => $('#stp').innerHTML = `<span class="badge text-bg-danger fs-6">Langkah ${n}/4 · ${t}</span>`;
    step(1, 'Pilih perangkat PAN');
    pickGame([
      ['📱', 'Smartphone', 1, 'Pusat PAN di rumahmu.'], ['⌚', 'Smartwatch', 1, 'Perangkat pribadi yang terhubung ke HP.'],
      ['🎧', 'Earbuds', 1, 'Terhubung nirkabel ke HP.'], ['💻', 'Laptop', 1, 'Dapat terhubung ke HP.'],
      ['🖨️', 'Printer pribadi', 1, 'Printer rumah dapat terhubung lewat USB atau Bluetooth.'],
      ['🖥️', 'Server sekolah', 0, 'Perhatikan: server sekolah bagian dari jaringan yang lebih luas.'], ['📡', 'Router operator internet', 0, 'Perhatikan: itu bagian dari jaringan penyedia internet, bukan jaringan pribadimu.']
    ], 10, () => {
      step(2, 'Tentukan teknologi dan hubungkan');
      matchGame([
        { t: '⌚ Smartwatch ↔ 📱 HP', a: 'bt', y: 'Bluetooth.', h: 'Nirkabel dan hemat daya.' },
        { t: '🎧 Earbuds ↔ 📱 HP', a: 'bt', y: 'Bluetooth.', h: 'Tanpa kabel, jarak dekat.' },
        { t: '💻 Laptop ↔ 📱 HP (butuh internet)', a: 'teth', y: 'Tethering.', h: 'Yang dibagikan adalah internet HP.' },
        { t: '🖨️ Printer ↔ 💻 Laptop (kabel)', a: 'usb', y: 'USB.', h: 'Ada kabel fisik langsung.' }
      ], [['bt', '🔵 Bluetooth'], ['nfc', '🟢 NFC'], ['usb', '🔌 USB'], ['teth', '📶 Tethering']], 10, () => {
        step(4, 'Pertanyaan keamanan'); $('#fb').innerHTML = '';
        mcq(Q8, 10, () => { if (!S.badges.includes(BD[4])) S.badges.push(BD[4]); finish(8, BD[5], 100) });
      });
    });
  },
  9() { frame('📝 Asesmen Akhir', '10 soal tentang PAN. Jawab dengan teliti! <small>(Tekan A–D atau 1–4)</small>'); mcq(QF, 0, r => result(r), true); }
};

/* ---------- hasil, refleksi, papan skor ---------- */
const pred = n => n >= 90 ? '🏆 MASTER' : n >= 80 ? '🥇 SANGAT BAIK' : n >= 70 ? '🥈 BAIK' : n >= 60 ? '🥉 CUKUP' : '📚 AYO BELAJAR LAGI';
function result(r) {
  const n = r * 10; if (!S.done.includes(9)) S.done.push(9); save(); hud();
  const lb = ld('pan_lb', []); lb.push({ n: S.name, k: S.kelas, s: S.score, v: n }); lb.sort((a, b) => b.s - a.s); localStorage.setItem('pan_lb', JSON.stringify(lb.slice(0, 10)));
  confetti(30); sfx(1);
  view(`<div class="panel text-center mx-auto fade-in" style="max-width:640px"><h2>HASIL PETUALANGAN</h2>
  <table class="table fs-5 text-start"><tr><td>Nama</td><td><b>${S.name}</b></td></tr><tr><td>Kelas</td><td><b>${S.kelas}</b></td></tr><tr><td>Skor</td><td><b>${S.score}</b></td></tr><tr><td>Benar</td><td><b>${r} / 10</b> (nilai ${n})</td></tr><tr><td>Predikat</td><td><b>${pred(n)}</b></td></tr></table>
  <div>${S.badges.map(b => `<span class="bdg on">${b}</span>`).join('')}</div>
  <button class="btn btn-primary btn-lg mt-3" onclick="reflect()">Lanjut ke Refleksi 💭</button></div>`);
}
function reflect() {
  const Rq = ['Apa yang kamu pahami tentang PAN?', 'Perangkat apa saja yang dapat membentuk PAN?', 'Teknologi PAN apa yang paling sering kamu gunakan?', 'Mengapa kita harus memperhatikan keamanan ketika menggunakan Bluetooth?', 'Apa perbedaan PAN dengan LAN?'], old = ld('pan_r', []);
  view(`<div class="panel mx-auto fade-in" style="max-width:760px"><h2>💭 REFLEKSI PETUALANGAN</h2>${Rq.map((q, i) => `<label class="form-label mt-3 fw-bold">${i + 1}. ${q}</label><textarea class="form-control" rows="2" id="r${i}">${old[i] || ''}</textarea>`).join('')}
  <button class="btn btn-success btn-lg w-100 mt-4" onclick="localStorage.setItem('pan_r',JSON.stringify([0,1,2,3,4].map(i=>$('#r'+i).value)));ending()">Simpan & Selesai</button></div>`);
}
function ending() {
  confetti(50);
  view(`<div class="panel text-center mx-auto fade-in" style="max-width:720px"><div style="font-size:5rem">🏆</div><h2>🎉 Selamat! Kamu telah menyelesaikan PAN Network Adventure dan sekarang kamu adalah PAN MASTER!</h2>
  <div class="d-grid gap-2 col-md-8 mx-auto mt-3"><button class="btn btn-primary btn-lg" onclick="board()">🏆 Papan Skor</button><button class="btn btn-outline-primary" onclick="resetAll(1)">🔄 Ulangi Permainan</button><button class="btn btn-outline-secondary" onclick="home()">🏠 Menu Utama</button></div></div>`);
}
function board() {
  const lb = ld('pan_lb', []);
  modal('🏆 Papan Skor', lb.length ? `<table class="table"><tr><th>#</th><th>Nama</th><th>Kelas</th><th>Skor</th><th>Nilai</th></tr>${lb.map((x, i) => `<tr><td>${i + 1}</td><td>${x.n}</td><td>${x.k}</td><td>${x.s}</td><td>${x.v}</td></tr>`).join('')}</table>` : '<p>Belum ada skor. Selesaikan petualangan untuk masuk papan skor!</p>');
}
function resetAll(q) {
  if (!q && !confirm('Ulangi permainan dari awal? Progres dan skor sekarang akan dihapus (papan skor tetap tersimpan).')) return;
  Object.assign(S, { score: 0, lives: 3, combo: 0, done: [], badges: [], mis: 0 }); save(); hud(); home();
}

/* ---------- materi belajar ---------- */
function learn() {
  const M = [
    ['Pengertian PAN', 'PAN (<i>Personal Area Network</i>) adalah jaringan pribadi yang menghubungkan perangkat milik satu orang dalam jarak dekat, misalnya HP, smartwatch, earbuds, dan laptop.'],
    ['Fungsi PAN', 'Berbagi data (foto, file), berbagi internet, dan menghubungkan perangkat tambahan seperti earbuds, keyboard, mouse, atau printer.'],
    ['Karakteristik PAN', 'Bersifat pribadi, jangkauan pendek (sekitar 1–10 meter), jumlah perangkat sedikit, hemat daya, dan sering nirkabel.'],
    ['Contoh & perangkat PAN', 'HP dengan smartwatch, HP dengan earbuds, laptop dengan mouse Bluetooth, HP dengan speaker portabel, HP dengan laptop lewat tethering.'],
    ['Bluetooth', 'Teknologi nirkabel jarak pendek berdaya rendah. Perangkat perlu <i>pairing</i> terlebih dahulu. Contoh: earbuds, smartwatch, speaker.'],
    ['NFC', 'Komunikasi nirkabel jarak sangat dekat (beberapa sentimeter). Contoh: pembayaran digital dan pertukaran informasi dengan menempelkan perangkat.'],
    ['USB', 'Koneksi berkabel langsung antar perangkat. Contoh: HP ke laptop untuk memindahkan file atau mengisi daya.'],
    ['Tethering / Hotspot Personal', 'HP membagikan koneksi internetnya ke laptop atau perangkat lain di dekatnya.'],
    ['Jarak jangkauan PAN', 'Kurang lebih 10 meter. Makin jauh, sinyal makin lemah dan koneksi dapat terputus.'],
    ['Kelebihan & kekurangan', '<b>Kelebihan:</b> praktis, murah, hemat daya, mudah dipakai. <b>Kekurangan:</b> jangkauan pendek, kecepatan terbatas, jumlah perangkat sedikit, dapat terganggu sinyal lain.'],
    ['PAN, LAN, MAN, WAN', '<b>PAN</b>: perangkat pribadi (±10 m). <b>LAN</b>: satu gedung/sekolah. <b>MAN</b>: satu kota. <b>WAN</b>: sangat luas, antar kota atau negara (contoh: internet).'],
    ['Keamanan PAN', 'Matikan Bluetooth jika tidak dipakai, tolak pairing dari perangkat tak dikenal, beri nama perangkat yang tidak membocorkan data pribadi, dan perbarui perangkat.']
  ];
  modal('📖 Pelajari PAN', `<div class="accordion" id="acc">${M.map((m, i) => `<div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button ${i ? 'collapsed' : ''}" data-bs-toggle="collapse" data-bs-target="#a${i}">${m[0]}</button></h2><div id="a${i}" class="accordion-collapse collapse ${i ? '' : 'show'}" data-bs-parent="#acc"><div class="accordion-body">${m[1]}</div></div></div>`).join('')}</div>`);
}

/* ---------- mulai ---------- */
const th = localStorage.getItem('pan_t'); if (th) document.documentElement.dataset.bsTheme = th;
hud(); home();
