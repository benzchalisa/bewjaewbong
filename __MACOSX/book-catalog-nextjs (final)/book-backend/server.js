// ============================================================
// server.js — Backend ตัวอย่างสำหรับ Book Catalog (Express)
// หน้าที่: เป็น REST API จัดการข้อมูลหนังสือ (เพิ่ม / ดู / แก้ไข / ลบ)
// ข้อมูลเก็บในหน่วยความจำ (ตัวแปร books) ปิดโปรแกรมแล้วข้อมูลจะหาย
//
// วิธีรัน:  node server.js     (ต้อง npm install express ก่อน)
// ============================================================

// นำเข้า Express (เฟรมเวิร์กสร้างเว็บเซิร์ฟเวอร์ของ Node.js)
const express = require("express");

// สร้างแอป Express
const app = express();

// Middleware: ให้ Express อ่าน body ที่ส่งมาเป็น JSON แล้วใส่ใน req.body
// (ถ้าไม่มีบรรทัดนี้ req.body จะเป็น undefined)
app.use(express.json());

// ---------------- ที่เก็บข้อมูล (ชั่วคราว) ----------------
let books = []; // อาร์เรย์เก็บหนังสือทั้งหมด เช่น [{ id: 1, title: "...", ... }]
let nextId = 1; // เลข id ถัดไปที่จะใช้ (เพิ่มขึ้นทีละ 1 ทุกครั้งที่เพิ่มหนังสือ)

// ---------------- GET /books : ดูหนังสือทั้งหมด ----------------
// req = คำขอที่เข้ามา, res = ตัวช่วยตอบกลับ
app.get("/books", (req, res) => res.json(books)); // ส่งอาร์เรย์กลับเป็น JSON

// ---------------- GET /books/:id : ดูหนังสือ 1 เล่ม ----------------
// :id คือส่วนที่เปลี่ยนไป เช่น /books/3 -> req.params.id = "3" (เป็นข้อความ)
app.get("/books/:id", (req, res) => {
  // แปลง id เป็นตัวเลขก่อนเทียบ แล้วหาหนังสือที่ id ตรงกัน
  const book = books.find(b => b.id === Number(req.params.id));

  // ไม่เจอ -> ตอบ 404 Not Found
  if (!book) return res.status(404).json({ message: "ไม่พบหนังสือ" });

  res.json(book); // เจอ -> ส่งข้อมูลหนังสือกลับ
});

// ---------------- POST /books : เพิ่มหนังสือใหม่ ----------------
app.post("/books", (req, res) => {
  // สร้างหนังสือใหม่: ใส่ id อัตโนมัติ (nextId++ = ใช้ค่าปัจจุบันแล้วค่อยบวก 1)
  // ...req.body คือกระจายข้อมูลที่หน้าเว็บส่งมา (title, author, publishedYear, isAvailable)
  const book = { id: nextId++, ...req.body };

  books.push(book); // เก็บลงอาร์เรย์
  res.status(201).json(book); // 201 Created พร้อมส่งหนังสือที่เพิ่งสร้างกลับไป
});

// ---------------- PUT /books/:id : แก้ไขหนังสือ ----------------
app.put("/books/:id", (req, res) => {
  // หา "ตำแหน่ง" ของหนังสือในอาร์เรย์ (ไม่เจอจะได้ -1)
  const i = books.findIndex(b => b.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ message: "ไม่พบหนังสือ" });

  // รวมข้อมูลเดิม + ข้อมูลใหม่ (ข้อมูลใหม่ทับของเดิม)
  // ใส่ id: books[i].id ท้ายสุด เพื่อกันไม่ให้ id ถูกเปลี่ยนโดยไม่ตั้งใจ
  books[i] = { ...books[i], ...req.body, id: books[i].id };

  res.json(books[i]); // ส่งหนังสือที่แก้แล้วกลับไป
});

// ---------------- DELETE /books/:id : ลบหนังสือ ----------------
app.delete("/books/:id", (req, res) => {
  // เก็บเฉพาะหนังสือที่ id "ไม่ตรง" กับที่จะลบ = ตัวที่ตรงจะหายไป
  books = books.filter(b => b.id !== Number(req.params.id));
  res.json({ message: "ลบแล้ว" });
});

// ---------------- เปิดเซิร์ฟเวอร์ ----------------
// พอร์ต 3000 (ต้องตรงกับ BACKEND_URL ฝั่ง Next.js)
// "0.0.0.0" = รับการเชื่อมต่อจากทุกที่ ทำให้ Docker เรียกเข้ามาได้ด้วย
// (ถ้าใช้ "localhost" จะรับได้เฉพาะจากเครื่องเดียวกัน)
app.listen(3000, "0.0.0.0", () => console.log("Backend ที่ http://localhost:3000"));