# Book Review API — README (อ่านในห้องสอบ)

Express 5 + Prisma + SQLite  |  2 ตาราง: **Book** (หนังสือ + ปก) 1 ── หลาย **Review** (รีวิว)

---

## 1. เริ่มรัน (3 คำสั่ง)

```bash
npm install
npx prisma generate      # สร้าง Prisma Client (ทำทุกครั้งหลัง clone หรือแก้ schema)
npx prisma db push       # สร้าง/อัปเดตตารางใน prisma/dev.db ให้ตรงกับ schema
npm run dev              # รันที่ http://localhost:3000  (แก้โค้ตแล้วรีสตาร์ทเอง)
```
- `.env` ต้องมี `DATABASE_URL="file:./dev.db"`  (path นับจากโฟลเดอร์ `prisma/`)
- ดูข้อมูลในตาราง: `npx prisma studio`
- เปลี่ยนพอร์ต: ใส่ `PORT=4000` ใน `.env`

---

## 2. โครงสร้างโปรเจกต์

```
prisma/schema.prisma   นิยามตาราง (Book, Review)
src/index.js           เริ่ม server, ต่อ middleware, ต่อ routes
src/prisma.js          สร้าง PrismaClient ตัวเดียวใช้ร่วมกัน
src/routes/books.js    CRUD หนังสือ + อัพโหลดปก + รีวิวแบบ nested
src/routes/reviews.js  CRUD รีวิว (แบบ flat)
src/upload.js          ตั้งค่า multer (รับไฟล์, ลบไฟล์)
src/validate.js        ตรวจข้อมูล (parseId, requireText, parseRating)
src/errors.js          HttpError + ตัวจัดการ error กลาง
uploads/               ไฟล์ปกที่อัพโหลด (เสิร์ฟที่ /uploads/ชื่อไฟล์)
frontend/crud-template.js  JS ฝั่งหน้าเว็บ (fetch CRUD + อัพโหลด) ใช้คู่กับ HTML ของอาจารย์
docs/exam-cheatsheet.md    สรุปเช็กลิสต์/ข้อกา/gen code จาก Swagger
GIT-GUIDE.md           ขั้นตอนขึ้น git และสิ่งที่ต้องทำก่อน-ระหว่าง-หลังสอบ
```

**เส้นทางของ request:**
`Client → index.js (cors, json) → routes/xxx.js → (validate) → prisma → DB`
ถ้ามี error → `errors.js` แปลงเป็น status + JSON ให้เอง

---

## 3. Schema (prisma/schema.prisma)

```prisma
model Book {
  id          Int      @id @default(autoincrement())
  title       String
  author      String
  publishedAt DateTime @default(now())
  coverUrl    String?                 // path ของรูปปก, ว่างได้ (?)
  reviews     Review[]                // 1 หนังสือ มีได้หลายรีวิว
}
model Review {
  id      Int    @id @default(autoincrement())
  rating  Int
  content String
  bookId  Int                          // foreign key
  book    Book   @relation(fields: [bookId], references: [id], onDelete: Cascade)
}
```
- `onDelete: Cascade` = ลบหนังสือ → รีวิวของเล่มนั้นหายตาม
- แก้ schema แล้วต้องรัน `npx prisma db push` และ `npx prisma generate`

---

## 4. Endpoints ทั้งหมด

| Method | Path | ทำอะไร | Body |
|---|---|---|---|
| GET | `/books` | ดูหนังสือทั้งหมด + รีวิว (`?search=คำ`) | - |
| GET | `/books/:id` | ดูหนังสือ 1 เล่ม | - |
| POST | `/books` | เพิ่มหนังสือ | form-data: `title`, `author`, `cover`(ไฟล์) |
| PUT | `/books/:id` | แก้หนังสือ (ส่งเฉพาะที่จะแก้) | form-data เหมือนข้างบน |
| DELETE | `/books/:id` | ลบหนังสือ (+รีวิว +ไฟล์ปก) | - |
| GET | `/books/:id/reviews` | รีวิวของหนังสือเล่มนั้น | - |
| POST | `/books/:id/reviews` | เพิ่มรีวิวให้หนังสือ | JSON: `rating`, `content` |
| GET | `/reviews` | รีวิวทั้งหมด (`?bookId=1`) | - |
| GET | `/reviews/:id` | รีวิว 1 อัน | - |
| POST | `/reviews` | เพิ่มรีวิว | JSON: `bookId`, `rating`, `content` |
| PUT | `/reviews/:id` | แก้รีวิว | JSON: `rating` และ/หรือ `content` |
| DELETE | `/reviews/:id` | ลบรีวิว | - |

**Status ที่ตอบ:** 200 ปกติ, 201 สร้างสำเร็จ, 400 ข้อมูลไม่ถูกต้อง, 404 ไม่พบ, 500 server พัง
(ทุก error ตอบเป็น `{ "error": "ข้อความ" }`)

### ตัวอย่างทดสอบด้วย curl
```bash
# เพิ่มหนังสือพร้อมปก
curl -X POST http://localhost:3000/books -F "title=Dune" -F "author=Herbert" -F "cover=@./cover.jpg"
# แก้ชื่อ (ปกเดิมยังอยู่)
curl -X PUT http://localhost:3000/books/1 -F "title=Dune 2"
# เพิ่มรีวิว
curl -X POST http://localhost:3000/books/1/reviews -H "Content-Type: application/json" -d '{"rating":5,"content":"ดีมาก"}'
# ลบ
curl -X DELETE http://localhost:3000/books/1
```

---

## 5. อัพโหลดไฟล์ทำงานยังไง

1. ฝั่งหน้าเว็บส่ง `FormData` (มี `<input type="file" name="cover">`)  → **ห้ามตั้ง Content-Type เอง**
2. `upload.single('cover')` (multer) รับไฟล์ → เซฟลง `uploads/` ด้วยชื่อใหม่ → ใส่ `req.file`
3. ฟิลด์อื่น (title, author) อยู่ใน `req.body` — **ค่าทุกตัวเป็น string**
4. เก็บ path ลง DB: `coverUrl = "/uploads/17306-123.jpg"`
5. หน้าเว็บแสดงรูป: `<img src="http://localhost:3000" + coverUrl>`
6. ชื่อ `'cover'` ใน `upload.single('cover')` ต้อง **ตรงกับ `name="cover"` ใน input** ไม่งั้นได้ error `Unexpected field`
7. แก้ไขแล้วไม่เลือกไฟล์ใหม่ → ปกเดิมยังอยู่; เลือกไฟล์ใหม่ → ปกเก่าถูกลบทิ้ง
8. จำกัด: เฉพาะไฟล์ภาพ, ไม่เกิน 5 MB (แก้ได้ใน `upload.js`)

---

## 6. สูตรเพิ่ม "ตารางใหม่" (เช่น Category) — ทำตามลำดับ

1. **schema.prisma** เพิ่ม model  → `npx prisma db push` → `npx prisma generate`
   ```prisma
   model Category {
     id    Int    @id @default(autoincrement())
     name  String
     books Book[]
   }
   // ใน Book เพิ่ม:  categoryId Int?   category Category? @relation(fields:[categoryId], references:[id])
   ```
2. สร้าง `src/routes/categories.js` โดย **copy จาก `reviews.js`** แล้วเปลี่ยน `prisma.review` → `prisma.category` และ field ให้ตรง
3. ใน `src/index.js` เพิ่ม: `app.use('/categories', require('./routes/categories'));`
4. ถ้ามีไฟล์: copy ส่วน `upload.single('cover')` + `toCoverUrl` + `deleteFile` จาก `books.js`
5. ลองด้วย curl / Swagger / Postman ก่อนค่อยต่อหน้าเว็บ

**สูตรใน route (จำ 5 แบบนี้พอ):**
```js
prisma.xxx.findMany({ where, include, orderBy })   // อ่านทั้งหมด
prisma.xxx.findUnique({ where: { id } })            // อ่าน 1 อัน (ไม่เจอได้ null)
prisma.xxx.create({ data })                         // เพิ่ม
prisma.xxx.update({ where: { id }, data })          // แก้ (ไม่เจอ -> P2025 -> 404)
prisma.xxx.delete({ where: { id } })                // ลบ (ไม่เจอ -> P2025 -> 404)
```

---

## 7. ต่อกับหน้าเว็บ

- ใช้ `crud-template.js` ได้เลย: `API_BASE = 'http://localhost:3000'`
  - หนังสือ: `endpoint:'/books'`, ปกอยู่ที่ฟิลด์ **`coverUrl`** → `render: r => imgTag(r.coverUrl)`
  - รีวิว: `endpoint:'/reviews'`, `hasFile:false` (ส่ง JSON), dropdown หนังสือ: `fillSelect('[name=bookId]','/books','id','title')`
- ถ้าส่ง JSON: `headers:{'Content-Type':'application/json'}` + `JSON.stringify(...)`
- CORS เปิดไว้แล้วใน `index.js` (`app.use(cors())`)

---

## 8. แก้ปัญหาที่เจอบ่อย

| อาการ | วิธีแก้ |
|---|---|
| `Cannot find module '.prisma/client'` | รัน `npx prisma generate` |
| `no such table: Book` | รัน `npx prisma db push` |
| `Environment variable not found: DATABASE_URL` | ไม่มี `.env` หรือสะกดผิด |
| `Unexpected field` (MulterError) | ชื่อ field ไฟล์ไม่ตรง `'cover'` |
| `req.body` ว่าง / undefined | ลืม `express.json()` หรือส่งผิด Content-Type; Express 5 body เป็น undefined ถ้าไม่ส่ง → ใช้ `req.body \|\| {}` |
| 400 `rating must be...` | rating ต้องเป็นเลข 1-5 |
| 404 ตอนเพิ่มรีวิว | `bookId` ไม่มีหนังสืออยู่จริง |
| CORS error ในเบราว์เซอร์ | ตรวจว่ามี `app.use(cors())` และเรียกพอร์ตถูก |
| รูปไม่ขึ้น | เปิด `http://localhost:3000/uploads/ชื่อไฟล์` ตรงๆ ดู; เช็ก `express.static` |
| พอร์ตชน (`EADDRINUSE`) | เปลี่ยน `PORT` หรือปิดโปรเซสเก่า |

---

## 9. สิ่งที่ปรับจากโค้ตเดิม
- แยกจากไฟล์เดียว (`index.js`) เป็นหลายไฟล์ ไฟล์ละหน้าที่
- เพิ่ม **GET/PUT/DELETE** ของหนังสือ และ **CRUD รีวิวครบ** (เดิมมีแค่ GET/POST หนังสือ + POST รีวิว)
- เพิ่ม **อัพโหลดปก** (multer) และลบไฟล์เมื่อลบ/เปลี่ยนปก
- แก้ตรวจ rating: เดิม `"abc"` ผ่านได้ ตอนนี้ต้องเป็นจำนวนเต็ม 1-5
- ใช้ตัวจัดการ error กลาง แทน `try/catch` ซ้ำทุก route (Express 5 จับ error จาก async ให้เอง)
- ไม่แตะ schema → `dev.db` เดิมใช้ต่อได้
