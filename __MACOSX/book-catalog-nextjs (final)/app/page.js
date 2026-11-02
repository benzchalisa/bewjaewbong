"use client";
// ^ บอก Next.js ว่าไฟล์นี้เป็น Client Component (รันในเบราว์เซอร์)
//   จำเป็นเพราะใช้ useState / useEffect / onClick ซึ่งใช้ใน Server Component ไม่ได้

// ============================================================
// app/page.js — หน้าแรกของเว็บ (URL: /)
// หน้าที่: แสดงรายการหนังสือ ค้นหา/กรอง เพิ่ม แก้ไข ลบ และอัปโหลดภาพปก
// ============================================================

// นำเข้า React Hooks ที่ใช้ในหน้านี้
//   useState  = เก็บค่าที่เปลี่ยนแล้วหน้าจอต้องวาดใหม่
//   useEffect = สั่งให้ทำงานเมื่อหน้าโหลด (เช่น ดึงข้อมูล)
//   useMemo   = จำผลคำนวณไว้ ไม่คำนวณซ้ำถ้าข้อมูลไม่เปลี่ยน
//   useRef    = อ้างอิง element ใน DOM โดยตรง
import { useEffect, useMemo, useRef, useState } from "react";

// ค่าเริ่มต้นของฟอร์มหนังสือ (ใช้ตอนเปิดฟอร์ม "เพิ่มหนังสือ")
const blankBook = { title: "", author: "", publishedYear: new Date().getFullYear(), isAvailable: true };

export default function Home() {
  // ---------------- State (ข้อมูลที่หน้าเว็บจำไว้) ----------------
  const [books, setBooks] = useState([]); // รายการหนังสือทั้งหมดจาก Backend
  const [loading, setLoading] = useState(true); // กำลังโหลดข้อมูลอยู่หรือไม่
  const [error, setError] = useState(""); // ข้อความ error ที่จะแสดงเป็นแถบแดง
  const [query, setQuery] = useState(""); // คำที่พิมพ์ในช่องค้นหา
  const [availability, setAvailability] = useState("all"); // ตัวกรองสถานะ: all / available / unavailable
  const [modalOpen, setModalOpen] = useState(false); // เปิดหน้าต่างฟอร์ม (modal) อยู่หรือไม่
  const [editingId, setEditingId] = useState(null); // id หนังสือที่กำลังแก้ไข (null = กำลังเพิ่มใหม่)
  const [form, setForm] = useState(blankBook); // ข้อมูลในฟอร์ม
  const [coverFile, setCoverFile] = useState(null); // ไฟล์ภาพปกที่เลือก
  const [coverPreview, setCoverPreview] = useState(""); // URL ชั่วคราวสำหรับพรีวิวภาพปก
  const [saving, setSaving] = useState(false); // กำลังบันทึกอยู่หรือไม่ (ใช้ปิดปุ่มกันกดซ้ำ)
  const fileRef = useRef(null); // อ้างอิงช่อง <input type="file"> ที่ซ่อนอยู่

  // ---------------- โหลดรายการหนังสือ ----------------
  async function loadBooks() {
    setLoading(true); setError("");
    try {
      // เรียก API ของ Next.js (/api/books) ซึ่งจะส่งต่อไป Backend อีกที
      const res = await fetch("/api/books", { cache: "no-store" });
      const data = await res.json();

      // ถ้า status ไม่ใช่ 2xx ให้โยน error ออกไปที่ catch
      if (!res.ok) throw new Error(data.message || "ไม่สามารถโหลดรายการหนังสือได้");

      // รองรับทั้งกรณี Backend ตอบเป็น array ตรง ๆ หรือเป็น { books: [...] }
      setBooks(Array.isArray(data) ? data : (data.books || []));
    } catch (e) {
      setError(`${e.message} — ตรวจสอบว่า Backend เปิดอยู่ที่ http://localhost:3000`);
    } finally { setLoading(false); } // ไม่ว่าสำเร็จหรือพลาด ก็เลิกแสดง loading
  }

  // ทำงาน 1 ครั้งตอนหน้าโหลดเสร็จ ([] = ไม่มี dependency) เพื่อดึงข้อมูลหนังสือ
  useEffect(() => { loadBooks(); }, []);

  // ---------------- ค้นหา + กรองสถานะ ----------------
  // useMemo: คำนวณใหม่เฉพาะเมื่อ books, query หรือ availability เปลี่ยน
  const filteredBooks = useMemo(() => books.filter(book => {
    const q = query.trim().toLowerCase(); // คำค้นหา ตัดช่องว่าง + แปลงเป็นตัวพิมพ์เล็ก

    // เงื่อนไขที่ 1: ถ้าไม่ได้พิมพ์อะไรให้ผ่านหมด ไม่งั้นต้องตรงกับ ชื่อ/ผู้เขียน/ปี/ID อย่างน้อย 1 ช่อง
    const matchesText = !q || [book.title, book.author, String(book.publishedYear), String(book.id)]
      .some(v => String(v ?? "").toLowerCase().includes(q));

    // เงื่อนไขที่ 2: ตรงกับตัวกรองสถานะที่เลือก
    const matchesAvailability = availability === "all" ||
      (availability === "available" ? book.isAvailable === true : book.isAvailable === false);

    // ต้องผ่านทั้งสองเงื่อนไขถึงจะแสดง
    return matchesText && matchesAvailability;
  }), [books, query, availability]);

  // ---------------- ฟังก์ชันจัดการฟอร์ม ----------------

  // เปิดฟอร์ม "เพิ่มหนังสือใหม่": ล้างค่าทุกอย่างให้ว่าง
  function openCreate() {
    setEditingId(null); setForm(blankBook); setCoverFile(null); setCoverPreview("");
    setModalOpen(true);
  }

  // เปิดฟอร์ม "แก้ไข": เติมข้อมูลหนังสือเล่มที่เลือกลงในฟอร์ม
  function openEdit(book) {
    setEditingId(book.id);
    setForm({ title: book.title ?? "", author: book.author ?? "", publishedYear: book.publishedYear ?? "", isAvailable: !!book.isAvailable });
    setCoverFile(null); setCoverPreview("");
    setModalOpen(true);
  }

  // เมื่อเลือกไฟล์ภาพปก (จากการคลิกหรือลากวาง)
  function changeFile(file) {
    if (!file) return; // ไม่ได้เลือกอะไร ก็ไม่ต้องทำต่อ

    // รับเฉพาะไฟล์รูปภาพ
    if (!file.type.startsWith("image/")) { setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น"); return; }

    setCoverFile(file);
    // สร้าง URL ชั่วคราวในเบราว์เซอร์ เพื่อแสดงพรีวิวรูปก่อนอัปโหลดจริง
    setCoverPreview(URL.createObjectURL(file));
  }

  // บันทึกหนังสือ (ใช้ทั้งเพิ่มใหม่และแก้ไข)
  async function saveBook(e) {
    e.preventDefault(); // กันฟอร์มรีเฟรชหน้า
    setSaving(true); setError("");
    try {
      // ขั้นที่ 1: ถ้าเลือกภาพปกไว้ ให้อัปโหลดไปที่ /api/upload ก่อน
      let coverUrl = "";
      if (coverFile) {
        const fd = new FormData(); fd.append("file", coverFile); // แพ็กไฟล์เป็น multipart/form-data
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "อัปโหลดภาพไม่สำเร็จ");
        coverUrl = uploadData.url; // เก็บ URL รูปที่อัปโหลดสำเร็จ
      }

      // ขั้นที่ 2: เตรียมข้อมูลหนังสือที่จะส่งไป Backend (แปลงชนิดข้อมูลให้ถูก)
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        publishedYear: Number(form.publishedYear), // ช่อง input ให้ค่าเป็นข้อความ จึงแปลงเป็นตัวเลข
        isAvailable: Boolean(form.isAvailable)
      };

      // ขั้นที่ 3: ถ้ามี editingId = แก้ไข (PUT ไป /api/books/:id) ไม่งั้น = เพิ่มใหม่ (POST ไป /api/books)
      const res = await fetch(editingId ? `/api/books/${editingId}` : "/api/books", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({})); // ถ้า body ไม่ใช่ JSON ให้ใช้ object ว่างแทน
      if (!res.ok) throw new Error(data.message || "บันทึกข้อมูลไม่สำเร็จ");

      // ขั้นที่ 4: สำเร็จ -> ปิด modal ล้างค่า แล้วโหลดรายการใหม่
      setModalOpen(false); setCoverFile(null); setCoverPreview("");
      await loadBooks();

      // แจ้งผู้ใช้ว่าอัปโหลดภาพแล้ว แต่ Backend ยังไม่มีฟิลด์เก็บ URL ภาพปก
      // หมายเหตุ: "\\n" ในโค้ดนี้จะแสดงเป็นตัวอักษร \n จริง ๆ ไม่ใช่ขึ้นบรรทัดใหม่
      //           (ถ้าต้องการขึ้นบรรทัดใหม่ ให้เปลี่ยนเป็น "\n")
      if (coverUrl) alert("บันทึกข้อมูลหนังสือแล้ว และอัปโหลดภาพไว้ที่ " + coverUrl + "\\nหมายเหตุ: API หนังสือเดิมยังไม่มีฟิลด์สำหรับบันทึก URL ภาพปก");
    } catch (e) { setError(e.message); }
    finally { setSaving(false); } // เลิกสถานะ "กำลังบันทึก" เสมอ
  }

  // ลบหนังสือ
  async function deleteBook(book) {
    // ถามยืนยันก่อน ถ้ากดยกเลิกก็หยุด
    if (!window.confirm(`ยืนยันลบหนังสือ “${book.title}” หรือไม่?`)) return;
    setError("");
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "ลบหนังสือไม่สำเร็จ");
      }
      await loadBooks(); // ลบสำเร็จ -> โหลดรายการใหม่
    } catch (e) { setError(e.message); }
  }

  // ---------------- ตัวเลขสถิติบนการ์ด ----------------
  const availableCount = books.filter(b => b.isAvailable === true).length; // จำนวนที่พร้อมให้ยืม
  const unavailableCount = books.filter(b => b.isAvailable === false).length; // จำนวนที่ถูกยืมอยู่

  // ---------------- ส่วนแสดงผล (JSX) ----------------
  return (
    <main className="app-shell">
      {/* ===== แถบเมนูด้านซ้าย (Sidebar) ===== */}
      <aside className="sidebar">
        {/* โลโก้ */}
        <div className="brand"><span className="brand-mark">B</span><span>bookspace<span className="brand-dot">.</span></span></div>
        <div className="side-label">WORKSPACE</div>
        {/* เมนู Book catalog พร้อมจำนวนหนังสือทั้งหมด */}
        <div className="nav-item active"><span className="nav-icon">▤</span> Book catalog <span className="nav-count">{books.length}</span></div>
        {/* กล่องข้อมูลผู้ใช้ล่างสุด */}
        <div className="side-bottom"><div className="avatar">BC</div><div><strong>Bookspace Library</strong><small>Personal workspace</small></div></div>
      </aside>

      {/* ===== พื้นที่หลักด้านขวา ===== */}
      <section className="main-panel">
        {/* แถบด้านบน: breadcrumb + สถานะ API */}
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Book catalog</strong></div>
          <div className="top-right"><span className="status-dot"></span> API workspace <span className="top-avatar">U</span></div>
        </header>

        <div className="content">
          {/* หัวข้อหน้า + ปุ่มเพิ่มหนังสือ */}
          <div className="heading-row">
            <div>
              <div className="eyebrow">YOUR COLLECTION</div>
              <h1>Book catalog <span className="title-emoji">✳</span></h1>
              <p className="subtitle">จัดการคลังหนังสือของคุณได้ในที่เดียว</p>
            </div>
            <button className="primary-btn" onClick={openCreate}><span>＋</span> เพิ่มหนังสือ</button>
          </div>

          {/* การ์ดสถิติ 3 ใบ: ทั้งหมด / พร้อมให้ยืม / ถูกยืมอยู่ */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-top"><span>หนังสือทั้งหมด</span><span className="stat-icon purple">▤</span></div>
              <div className="stat-number">{books.length}</div>
              <div className="stat-foot">รายการในคลัง</div>
            </div>
            <div className="stat-card">
              <div className="stat-top"><span>พร้อมให้ยืม</span><span className="stat-icon green">✓</span></div>
              <div className="stat-number">{availableCount}</div>
              <div className="stat-foot"><span className="green-text">●</span> Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-top"><span>ถูกยืมอยู่</span><span className="stat-icon orange">↗</span></div>
              <div className="stat-number">{unavailableCount}</div>
              <div className="stat-foot">Currently unavailable</div>
            </div>
          </div>

          {/* การ์ดตารางรายการหนังสือ */}
          <section className="catalog-card">
            {/* หัวการ์ด + จำนวนผลลัพธ์หลังกรอง */}
            <div className="catalog-header">
              <div><h2>หนังสือทั้งหมด</h2><p>รายการหนังสือที่อยู่ในระบบ</p></div>
              <span className="results-pill">{filteredBooks.length} รายการ</span>
            </div>

            {/* แถบเครื่องมือ: ช่องค้นหา + ตัวกรองสถานะ + ปุ่มรีเฟรช */}
            <div className="toolbar">
              <div className="search-box">
                <span>⌕</span>
                {/* ช่องค้นหา: พิมพ์แล้วอัปเดต state query ทันที */}
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาชื่อหนังสือ ผู้เขียน หรือ ID..." />
              </div>
              {/* ตัวกรองสถานะ */}
              <select value={availability} onChange={e => setAvailability(e.target.value)} aria-label="กรองสถานะ">
                <option value="all">ทุกสถานะ</option>
                <option value="available">พร้อมให้ยืม</option>
                <option value="unavailable">ถูกยืมอยู่</option>
              </select>
              {/* ปุ่มโหลดข้อมูลใหม่ */}
              <button className="refresh-btn" onClick={loadBooks} title="Refresh">↻</button>
            </div>

            {/* แถบแจ้ง error สีแดง (แสดงเมื่อมี error) พร้อมปุ่ม × ปิด */}
            {error && <div className="error-banner"><span>!</span><div>{error}</div><button onClick={() => setError("")}>×</button></div>}

            {/* เลือกแสดงผล 3 แบบ: กำลังโหลด / ไม่มีข้อมูล / ตารางหนังสือ */}
            {loading ?
              // แบบที่ 1: กำลังโหลด -> แสดงวงกลมหมุน
              <div className="empty-state"><div className="loader"></div><p>กำลังโหลดข้อมูลหนังสือ...</p></div> :
              filteredBooks.length === 0 ?
                // แบบที่ 2: ไม่มีรายการ -> แสดงข้อความ (ต่างกันระหว่าง "ค้นไม่เจอ" กับ "ยังไม่มีหนังสือเลย")
                <div className="empty-state">
                  <div className="empty-icon">▤</div>
                  <h3>{books.length ? "ไม่พบหนังสือที่ค้นหา" : "ยังไม่มีหนังสือในคลัง"}</h3>
                  <p>{books.length ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "เพิ่มหนังสือเล่มแรกเพื่อเริ่มต้นใช้งาน"}</p>
                  {!books.length && <button className="primary-btn" onClick={openCreate}>＋ เพิ่มหนังสือ</button>}
                </div> :
                // แบบที่ 3: มีรายการ -> แสดงตาราง
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>หนังสือ</th><th>ID</th><th>ผู้เขียน</th><th>ปีที่พิมพ์</th><th>สถานะ</th><th className="actions-head">จัดการ</th></tr>
                    </thead>
                    <tbody>
                      {/* วนลูปสร้างแถวของหนังสือแต่ละเล่ม (key ต้องไม่ซ้ำ จึงใช้ book.id) */}
                      {filteredBooks.map((book, index) => <tr key={book.id}>
                        {/* คอลัมน์ชื่อ: ปกจำลองเป็นตัวอักษรแรก (สีวนตาม index % 5) + ชื่อหนังสือ */}
                        <td>
                          <div className="book-cell">
                            <div className={`book-cover cover-${index % 5}`}>{book.title?.slice(0, 1)?.toUpperCase() || "B"}</div>
                            <div><strong>{book.title}</strong><small>Book edition</small></div>
                          </div>
                        </td>
                        {/* คอลัมน์ ID / ผู้เขียน / ปีที่พิมพ์ */}
                        <td><span className="id-text">#{book.id}</span></td><td>{book.author}</td><td>{book.publishedYear}</td>
                        {/* คอลัมน์สถานะ: ป้ายสีเขียว (พร้อมให้ยืม) หรือสีส้ม (ถูกยืมอยู่) */}
                        <td><span className={`status-badge ${book.isAvailable ? "available" : "unavailable"}`}><span></span>{book.isAvailable ? "พร้อมให้ยืม" : "ถูกยืมอยู่"}</span></td>
                        {/* คอลัมน์จัดการ: ปุ่มแก้ไข (✎) และลบ (⌫) */}
                        <td>
                          <div className="row-actions">
                            <button className="icon-btn edit" onClick={() => openEdit(book)} title="แก้ไข">✎</button>
                            <button className="icon-btn delete" onClick={() => deleteBook(book)} title="ลบ">⌫</button>
                          </div>
                        </td>
                      </tr>)}
                    </tbody>
                  </table>
                </div>}

            {/* ท้ายตาราง: สรุปจำนวนที่แสดง + สถานะการเชื่อมต่อ */}
            <div className="table-footer"><span>แสดง {filteredBooks.length} จาก {books.length} รายการ</span><span className="api-label"><span className="status-dot"></span> Connected via API</span></div>
          </section>

          <footer>Made for your reading journey <span>✦</span><span className="footer-right">BOOKSPACE · 2026</span></footer>
        </div>
      </section>

      {/* ===== หน้าต่างฟอร์ม (Modal) เพิ่ม/แก้ไขหนังสือ — แสดงเมื่อ modalOpen เป็น true ===== */}
      {/* คลิกที่พื้นหลังสีเข้มนอกกล่อง (e.target === e.currentTarget) จะปิดหน้าต่าง */}
      {modalOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <section className="modal">
          {/* หัวหน้าต่าง: ข้อความเปลี่ยนตามโหมด (แก้ไข / เพิ่มใหม่) + ปุ่มปิด */}
          <div className="modal-head">
            <div>
              <div className="eyebrow">{editingId ? "UPDATE RECORD" : "NEW RECORD"}</div>
              <h2>{editingId ? "แก้ไขข้อมูลหนังสือ" : "เพิ่มหนังสือใหม่"}</h2>
              <p>กรอกข้อมูลหนังสือให้ครบถ้วน</p>
            </div>
            <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
          </div>

          {/* ฟอร์ม: กด submit จะเรียก saveBook */}
          <form onSubmit={saveBook}>
            {/* ช่องชื่อหนังสือ (required = ต้องกรอก) — {...form, title:...} คือคัดลอกค่าเดิมแล้วเปลี่ยนเฉพาะ title */}
            <label>ชื่อหนังสือ <span>*</span>
              <input required value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="เช่น Clean Code" />
            </label>
            {/* ช่องชื่อผู้เขียน */}
            <label>ชื่อผู้เขียน <span>*</span>
              <input required value={form.author} onChange={e => setForm({...form, author:e.target.value})} placeholder="ชื่อผู้เขียน" />
            </label>

            {/* แถวที่มี 2 ช่อง: ปีที่พิมพ์ + สถานะ */}
            <div className="form-row">
              <label>ปีที่พิมพ์ <span>*</span>
                <input required type="number" min="0" max="9999" value={form.publishedYear} onChange={e => setForm({...form, publishedYear:e.target.value})} />
              </label>
              {/* dropdown สถานะ: ค่าเป็นข้อความ "true"/"false" จึงแปลงกลับเป็น boolean ตอนเก็บ */}
              <label>สถานะหนังสือ
                <select value={String(form.isAvailable)} onChange={e => setForm({...form, isAvailable:e.target.value === "true"})}>
                  <option value="true">พร้อมให้ยืม</option>
                  <option value="false">ถูกยืมอยู่</option>
                </select>
              </label>
            </div>

            {/* ส่วนอัปโหลดภาพปก (ไม่บังคับ) */}
            <div className="upload-label">ภาพปกหนังสือ <span className="optional">(ไม่บังคับ)</span></div>
            {/* กล่องอัปโหลด: คลิกเพื่อเปิดหน้าต่างเลือกไฟล์ หรือลากไฟล์มาวางได้ */}
            {/* onDragOver ต้อง preventDefault ไม่งั้นเบราว์เซอร์จะไม่ยอมให้วางไฟล์ */}
            <div className="upload-box" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); changeFile(e.dataTransfer.files?.[0]); }}>
              {/* ถ้าเลือกรูปแล้วแสดงพรีวิว ถ้ายังไม่เลือกแสดงข้อความชวนอัปโหลด */}
              {coverPreview ? <img src={coverPreview} alt="ตัวอย่างภาพปก" className="cover-preview" /> : <>
                <div className="upload-icon">↑</div>
                <strong>คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</strong>
                <small>PNG, JPG, WEBP · อัปโหลดภาพปก</small>
              </>}
              {/* input ไฟล์จริง ซ่อนไว้ (hidden) แล้วสั่งคลิกผ่าน fileRef แทน */}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => changeFile(e.target.files?.[0])} />
            </div>
            <p className="upload-note">ภาพจะถูกจัดเก็บใน Next.js ส่วนข้อมูลหนังสือบันทึกผ่าน Backend API</p>

            {/* ปุ่มด้านล่างฟอร์ม: ยกเลิก / บันทึก (ปิดปุ่มระหว่างกำลังบันทึก กันกดซ้ำ) */}
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setModalOpen(false)}>ยกเลิก</button>
              <button className="primary-btn" type="submit" disabled={saving}>{saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มหนังสือ"}</button>
            </div>
          </form>
        </section>
      </div>}
    </main>
  );
}
