# GIT-GUIDE — ต้องทำอะไรบ้าง

## 0. ไฟล์ในโปรเจกต์ทำอะไรบ้าง

**ราก**

| ไฟล์ | ทำอะไร |
|---|---|
| `README.md` | คู่มือหลักสำหรับอ่านในห้องสอบ: วิธีรัน, โครงสร้าง, ตาราง endpoint, ตัวอย่าง curl, วิธีอัพโหลดทำงาน, สูตรเพิ่มตารางใหม่, ตารางแก้ปัญหา |
| `GIT-GUIDE.md` | ไฟล์นี้: ขั้นตอนขึ้น git และสิ่งที่ต้องทำก่อน-ระหว่างสอบ |
| `package.json` / `package-lock.json` | รายการ library (express, prisma, multer, cors) และคำสั่งรัน เช่น `npm run dev` |
| `.env` | บอก path ฐานข้อมูล `file:./dev.db` |
| `.gitignore` | บอก git ไม่ต้องเก็บ `node_modules` และไฟล์ที่อัพโหลด |

**prisma/**

| ไฟล์ | ทำอะไร |
|---|---|
| `schema.prisma` | นิยามตาราง Book และ Review (ไม่ได้แก้จากของเดิม) |
| `dev.db` | ฐานข้อมูล SQLite เดิมของคุณ |

**src/ (backend)**

| ไฟล์ | ทำอะไร |
|---|---|
| `index.js` | จุดเริ่ม server: ต่อ cors, json, เสิร์ฟรูปจาก `/uploads`, ต่อ routes |
| `prisma.js` | สร้างตัวเชื่อมฐานข้อมูลตัวเดียวให้ทุกไฟล์ใช้ร่วมกัน |
| `routes/books.js` | CRUD หนังสือ + อัพโหลดปก + รีวิวแบบ nested (`/books/:id/reviews`) |
| `routes/reviews.js` | CRUD รีวิวแบบ flat (`/reviews`) ใช้กับ `crud-template.js` ได้ตรงๆ |
| `upload.js` | ตั้งค่ารับไฟล์ภาพ (ไม่เกิน 5 MB), ตั้งชื่อไฟล์ใหม่, ลบไฟล์ปกเก่า |
| `validate.js` | ตรวจข้อมูลที่ส่งมา: id เป็นเลข, ข้อความไม่ว่าง, rating 1-5 |
| `errors.js` | จัดการ error ทั้งระบบที่เดียว แปลงเป็น 400/404/500 พร้อมข้อความ |

**อื่นๆ**

| ไฟล์/โฟลเดอร์ | ทำอะไร |
|---|---|
| `uploads/` | เก็บรูปปกที่อัพโหลด (มี `.gitkeep` ให้ git เก็บโฟลเดอร์ว่างไว้) |
| `frontend/crud-template.js` | JS ฝั่งหน้าเว็บ ทำ CRUD + อัพโหลดไฟล์ ใช้กับหลายตาราง แก้แค่ `API_BASE`, endpoint, selector แล้วต่อกับ HTML/CSS ของอาจารย์ |
| `docs/exam-cheatsheet.md` | เช็กลิสต์ลำดับทำข้อสอบ, snippet อัพโหลดฝั่ง backend, คำสั่ง gen code จาก Swagger/Postman, ตาราง debug, สรุปข้อกา — เปิดดูระหว่างสอบ |

**ถ้าเวลาไม่พอ อ่านแค่นี้:**
1. หัวข้อ A-B ในไฟล์นี้ (ขึ้น git แล้วลอง clone มารันจริงสักรอบ)
2. `README.md` หัวข้อ 4 (endpoint) และหัวข้อ 6 (สูตรเพิ่มตารางใหม่)
3. `frontend/crud-template.js` ลองต่อกับ HTML ดูว่าต้องแก้ตรงไหน

---

## A. ขึ้น Git (ทำตอนนี้ ก่อนสอบ)

1. แตก zip แล้วเข้าโฟลเดอร์โปรเจกต์
   ```bash
   cd book-review-api
   ```
2. สร้าง repo เปล่าบน GitHub (ชื่อเช่น `book-review-api`) **ไม่ต้องติ๊ก** Add README / .gitignore
   - แนะนำ **Private** เพราะมี `.env` และเป็นงานของวิชา
3. รันคำสั่ง
   ```bash
   git init
   git add .
   git commit -m "Book review API: full CRUD + cover upload"
   git branch -M main
   git remote add origin https://github.com/<username>/book-review-api.git
   git push -u origin main
   ```
   (ใช้ GitHub Desktop ก็ได้: File → Add local repository → Publish repository)
4. เช็กบน GitHub ว่ามีไฟล์ครบ: `src/`, `prisma/` (มี `dev.db` + `schema.prisma`), `frontend/`, `docs/`, `README.md`, `.env`, `package.json`
   - `node_modules/` และไฟล์ใน `uploads/` ถูก ignore ไว้แล้ว (ไม่ขึ้น git เป็นเรื่องปกติ)

## B. ทดสอบก่อนวันสอบ/ก่อนเข้าห้อง (สำคัญที่สุด)

ลอง clone มาใหม่ในโฟลเดอร์อื่น เหมือนที่จะทำในห้องสอบ:
```bash
git clone https://github.com/<username>/book-review-api.git test-clone
cd test-clone
npm install
npx prisma generate
npx prisma db push
npm run dev
```
แล้วทดสอบด้วย curl ตัวอย่างใน `README.md` (เพิ่มหนังสือพร้อมปก, แก้, ลบ, เพิ่มรีวิว) ถ้าผ่านหมด แปลว่า repo พร้อมใช้

ถ้ามี error ให้ดูตารางแก้ปัญหาใน `README.md` หัวข้อ 8

## C. วันสอบ (ในห้อง)

ลำดับที่แนะนำ:
1. `git clone` repo ของตัวเอง (หรือ repo ที่อาจารย์ให้) → `npm install` → `npx prisma generate` → `npx prisma db push` → `npm run dev`
2. เปิด Swagger ของอาจารย์ ดู endpoint/ชื่อ field ที่โจทย์ต้องการ แล้วเทียบกับ `README.md` ตารางหัวข้อ 4
3. ถ้าตารางในข้อสอบไม่ใช่ Book/Review → ทำตาม **สูตรเพิ่มตารางใหม่** ใน `README.md` หัวข้อ 6
4. หน้าเว็บ: เอา HTML/CSS ของอาจารย์ + `frontend/crud-template.js` แก้ `API_BASE`, endpoint, selector, ชื่อ field ให้ตรง (ดูหัวข้อ 7 ใน README)
5. ทดสอบทุกปุ่ม: เพิ่ม / แก้ (ไม่เลือกไฟล์ใหม่) / แก้ (เลือกไฟล์ใหม่) / ลบ / รูปขึ้น
6. เปิด `docs/exam-cheatsheet.md` ดูเช็กลิสต์ ข้อกา และตาราง debug

## D. ข้อควรระวัง
- ห้ามใช้ AI / เว็บ AI / extension AI ระหว่างสอบ (มีการเก็บ log และบันทึกหน้าจอ) — ใช้ได้เฉพาะโค้ตและไฟล์ที่เตรียมไว้ใน repo + การค้นหาปกติ
- `.env` ใน repo มีแค่ `DATABASE_URL="file:./dev.db"` ไม่มีความลับ ถ้าเพิ่ม key/รหัสผ่านทีหลังให้เอา `.env` ออกจาก git (`echo .env >> .gitignore` และ `git rm --cached .env`)
- แก้ `schema.prisma` เมื่อไร ต้องรัน `npx prisma db push` และ `npx prisma generate` ใหม่ทุกครั้ง
- ถ้าอาจารย์ให้ backend repo มาให้ clone ของเขาก่อน แล้วค่อยก๊อปโค้ตที่ต้องใช้จาก repo นี้ไปปรับ (สูตร route/upload/validate ใช้ซ้ำได้)
- commit บ่อยๆ ระหว่างทำ: `git add . && git commit -m "ข้อความ"` เผื่อแก้พังจะย้อนกลับได้ (`git restore <ไฟล์>`)
