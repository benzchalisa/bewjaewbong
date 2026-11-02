/* ============================================================
   CRUD TEMPLATE (vanilla JS) — ใช้ได้กับหลายตาราง + อัพโหลดไฟล์
   วิธีใช้: แก้ API_BASE, แล้วเรียก createCrud({...}) ท้ายไฟล์ ต่อ 1 ตาราง
   ต้องปรับ selector / name ให้ตรงกับ HTML ที่อาจารย์ให้
   ============================================================ */

const API_BASE = 'http://localhost:3000';   // <-- แก้ให้ตรงกับ backend

// ---------- helper ----------
async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, options);
  if (!res.ok) {
    let msg = res.status + ' ' + res.statusText;
    try { const e = await res.json(); msg += ' - ' + (e.message || JSON.stringify(e)); } catch (_) {}
    alert('Error: ' + msg);
    throw new Error(msg);
  }
  // DELETE บาง backend ส่ง body ว่าง
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// แสดงรูป (ถ้า backend ส่ง path แบบ "uploads/xxx.jpg" ให้เติม API_BASE)
function imgUrl(p) {
  if (!p) return '';
  return /^https?:\/\//.test(p) ? p : `${API_BASE}/${String(p).replace(/^\/+/, '')}`;
}
function imgTag(p, w = 50) {
  return p ? `<img src="${imgUrl(p)}" width="${w}" alt="">` : '-';
}
function esc(s) {                           // กัน HTML แตก
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// เติม <select> จากอีกตาราง (เช่น หมวดหมู่) — เรียกก่อน/หลัง load ก็ได้
async function fillSelect(selectSelector, endpoint, valueKey = 'id', labelKey = 'name') {
  const sel = document.querySelector(selectSelector);
  const data = await api(endpoint);
  sel.innerHTML = '<option value="">-- เลือก --</option>' +
    data.map(d => `<option value="${esc(d[valueKey])}">${esc(d[labelKey])}</option>`).join('');
}

// ---------- ตัวหลัก ----------
function createCrud({
  endpoint,            // เช่น '/books'
  tbodySelector,       // เช่น '#book-tbody'
  formSelector,        // เช่น '#book-form'
  columns,             // [{ key:'title' }, { render: r => imgTag(r.cover) }, ...]
  idField = 'id',
  hasFile = true,      // true = ส่ง FormData (multipart), false = ส่ง JSON
  cancelSelector = null,   // ปุ่มยกเลิกแก้ไข (ถ้ามี)
  searchSelector = null,   // ช่องค้นหา (ถ้ามี) กรองฝั่ง client
  updateMethod = 'PUT',    // บางข้อสอบใช้ PATCH
}) {
  const tbody = document.querySelector(tbodySelector);
  const form = document.querySelector(formSelector);
  let rows = [];
  let editingId = null;

  function render(list) {
    tbody.innerHTML = list.map(r => `
      <tr>
        ${columns.map(c => `<td>${c.render ? c.render(r) : esc(r[c.key])}</td>`).join('')}
        <td>
          <button type="button" data-act="edit" data-id="${r[idField]}">แก้ไข</button>
          <button type="button" data-act="del"  data-id="${r[idField]}">ลบ</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="99">ไม่มีข้อมูล</td></tr>';
  }

  async function load() {
    rows = await api(endpoint);
    if (!Array.isArray(rows)) rows = rows.data || rows.items || [];  // เผื่อ response ห่อ
    applySearch();
  }

  function applySearch() {
    const q = searchSelector ? document.querySelector(searchSelector).value.trim().toLowerCase() : '';
    render(q ? rows.filter(r => JSON.stringify(r).toLowerCase().includes(q)) : rows);
  }

  function resetForm() {
    form.reset();
    editingId = null;
    const btn = form.querySelector('[type=submit]');
    if (btn) btn.textContent = 'บันทึก';
  }

  function fillForm(row) {
    editingId = row[idField];
    [...form.elements].forEach(el => {
      if (!el.name || el.type === 'file') return;           // ไฟล์เติมค่าไม่ได้
      let v = row[el.name];
      if (v === undefined && row[el.name + 'Id'] !== undefined) v = row[el.name + 'Id'];
      if (v && typeof v === 'object') v = v[idField];         // relation object -> id
      if (el.type === 'checkbox') el.checked = !!v;
      else el.value = v ?? '';
    });
    const btn = form.querySelector('[type=submit]');
    if (btn) btn.textContent = 'อัปเดต';
    form.scrollIntoView({ behavior: 'smooth' });
  }

  async function save(e) {
    e.preventDefault();
    const fd = new FormData(form);
    // ตอนแก้ไขแล้วไม่ได้เลือกไฟล์ใหม่ -> ไม่ส่งไฟล์ (กันไฟล์เก่าถูกทับด้วยค่าว่าง)
    [...form.elements].forEach(el => {
      if (el.type === 'file' && el.name && (!el.files || el.files.length === 0)) fd.delete(el.name);
    });

    const url = editingId ? `${endpoint}/${editingId}` : endpoint;
    const method = editingId ? updateMethod : 'POST';
    const options = { method };

    if (hasFile) {
      options.body = fd;                      // ห้ามตั้ง Content-Type เอง!
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(Object.fromEntries(fd));
    }
    await api(url, options);
    resetForm();
    await load();
  }

  // ---------- event ----------
  form.addEventListener('submit', save);
  tbody.addEventListener('click', async e => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const id = btn.dataset.id;
    const row = rows.find(r => String(r[idField]) === id);
    if (btn.dataset.act === 'edit') fillForm(row);
    if (btn.dataset.act === 'del') {
      if (!confirm('ยืนยันการลบ?')) return;
      await api(`${endpoint}/${id}`, { method: 'DELETE' });
      if (String(editingId) === id) resetForm();
      await load();
    }
  });
  if (cancelSelector) document.querySelector(cancelSelector).addEventListener('click', resetForm);
  if (searchSelector) document.querySelector(searchSelector).addEventListener('input', applySearch);

  load();
  return { load, resetForm };
}

/* ============================================================
   ตัวอย่างการใช้ — แก้ selector / field ให้ตรงกับ HTML ข้อสอบ
   ============================================================ */

// ตาราง 1: หมวดหมู่ / catalog (ไม่มีไฟล์ -> JSON)
const categories = createCrud({
  endpoint: '/categories',
  tbodySelector: '#category-tbody',
  formSelector: '#category-form',
  hasFile: false,
  columns: [{ key: 'id' }, { key: 'name' }],
});

// ตาราง 2: หนังสือ (มีรูปปก -> FormData) มี <input type="file" name="cover">
const books = createCrud({
  endpoint: '/books',
  tbodySelector: '#book-tbody',
  formSelector: '#book-form',
  hasFile: true,
  searchSelector: '#search',            // ลบบรรทัดนี้ถ้าไม่มีช่องค้นหา
  columns: [
    { key: 'id' },
    { key: 'title' },
    { key: 'author' },
    { render: r => esc(r.category?.name ?? r.categoryId ?? '-') },
    { render: r => imgTag(r.cover) },
  ],
});

// เติม dropdown หมวดหมู่ในฟอร์มหนังสือ (<select name="categoryId">)
fillSelect('#book-form [name=categoryId]', '/categories', 'id', 'name');
