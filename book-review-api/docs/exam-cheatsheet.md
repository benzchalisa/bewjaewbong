# Web Contemporary — Cheat Sheet สอบ CRUD

## 0. กติกา (สำคัญ)
- เปิดเน็ต/ค้นหาได้ แต่ **ห้าม AI / เว็บ AI / extension AI** ถูกเก็บ log + บันทึกหน้าจอ
- ทุจริต = F ทุกวิชา → ปิดแท็บและ extension AI ก่อนเริ่ม
- เปิดโค้ตการบ้านตัวเองดูได้

## 1. Checklist ทำข้อสอบ
1. อ่านโจทย์ให้จบ + ดูตาราง/ฟิลด์ที่ต้องทำ
2. เปิด Swagger → ลอง "Try it out" ทุก endpoint ดู request/response จริง
3. clone backend → ติดตั้ง → ตั้ง `.env`/DB → รันให้ขึ้น
4. เอา HTML/CSS ที่อาจารย์ให้มา → ตรวจ `id` / `name` ของ input, tbody, ปุ่ม
5. วาง `crud-template.js` → แก้ `API_BASE`, endpoint, selector, columns
6. ทดสอบ: เพิ่ม / แก้ (ไม่เลือกไฟล์ใหม่) / แก้ (เลือกไฟล์ใหม่) / ลบ / รูปขึ้น
7. ทำตารางที่ 2 + dropdown ความสัมพันธ์
8. ทำข้อกา

## 2. สิ่งที่ต้องเช็กให้ตรงกับ backend
| เรื่อง | ดูจาก |
|---|---|
| URL ฐาน, พอร์ต | Swagger → Servers |
| ชื่อ field ใน body | Swagger → Schema (ต้องตรงกับ `name="..."` ใน input) |
| ชื่อ field ไฟล์ | Swagger multipart หรือ `FileInterceptor('cover')` / `upload.single('cover')` |
| update เป็น PUT หรือ PATCH | Swagger → ตั้ง `updateMethod` |
| path รูปที่ตอบกลับ | ดู response จริง → ปรับ `imgUrl()` |
| ต้อง enable CORS ไหม | Console ขึ้น CORS error → แก้ backend |

## 3. อัพโหลดไฟล์ (ฝั่ง frontend)
```js
const fd = new FormData(form);   // input type="file" name="cover"
await fetch(url, { method: 'POST', body: fd });  // ห้ามใส่ Content-Type เอง
```
- `<form>` ไม่ต้องมี enctype ถ้าส่งด้วย fetch
- แก้ไขแล้วไม่เลือกไฟล์ → `fd.delete('cover')` (template ทำให้แล้ว)

## 4. ฝั่ง backend ที่เจอบ่อย

**Express + multer**
```js
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static('uploads'));
app.post('/books', upload.single('cover'), (req, res) => {
  const cover = req.file ? req.file.path : null;
  // req.body = ฟิลด์อื่น
});
```

**NestJS**
```ts
@Post()
@UseInterceptors(FileInterceptor('cover', { dest: './uploads' }))
create(@Body() dto: CreateBookDto, @UploadedFile() file: Express.Multer.File) {
  return this.service.create({ ...dto, cover: file?.path });
}
// main.ts
app.enableCors();
app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' }); // NestExpressApplication
```
- ใน `FormData` ค่าที่ส่งเป็น string ทั้งหมด → ตัวเลขต้องแปลง (`@Type(() => Number)` หรือ `Number()`)

## 5. Gen code จาก OpenAPI / Postman
```bash
# client จาก swagger (ไฟล์หรือ URL)
npx @openapitools/openapi-generator-cli generate -i swagger.json -g typescript-fetch -o ./client
npx @openapitools/openapi-generator-cli generate -i http://localhost:3000/api-json -g javascript -o ./client-js

# server stub
npx @openapitools/openapi-generator-cli generate -i swagger.json -g nodejs-express-server -o ./server
npx @openapitools/openapi-generator-cli generate -i swagger.json -g typescript-nestjs -o ./nest-client

# type เฉยๆ
npx openapi-typescript swagger.json -o schema.d.ts
```
- ต้องมี Java ติดตั้งสำหรับ openapi-generator-cli (ถ้าไม่มี ใช้ editor.swagger.io → Generate Client/Server)
- Postman: Import → เลือก request → ไอคอน `</>` → เลือก JavaScript - Fetch → copy
- ลิงก์ spec ของ NestJS มักเป็น `/api-json` หรือ `/swagger-json`

## 6. Debug เร็ว
| อาการ | สาเหตุที่เจอบ่อย |
|---|---|
| CORS error | backend ยังไม่ `enableCors()` |
| 400 / validation | ชื่อ field ไม่ตรง DTO, ส่ง string แทน number |
| 404 | path ผิด (`/book` vs `/books`), พอร์ตผิด |
| ไฟล์ไม่ขึ้นมา | ไม่ได้ serve static, path ผิด → เปิด URL รูปตรงๆ ใน tab ใหม่ |
| ไฟล์ไม่ถูกอัพ | ตั้ง `Content-Type` เอง, ชื่อ field ไฟล์ไม่ตรง |
| ตารางไม่อัปเดต | ลืมเรียก `load()` หลัง save/delete, response ห่อ `{data: []}` |
| ปุ่มแก้ไข/ลบไม่ทำงาน | selector ผิด, `id` ใน row ไม่ใช่ `id` (ตั้ง `idField`) |

เปิด DevTools → **Network** (ดู request/response) + **Console** (ดู error) เสมอ

## 7. ทบทวนข้อกา
- GET อ่าน / POST สร้าง / PUT แทนที่ทั้งหมด / PATCH แก้บางส่วน / DELETE ลบ
- 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error
- REST = ใช้ HTTP method + URL แทน resource, stateless
- JSON = รูปแบบข้อมูล, `JSON.parse` / `JSON.stringify`
- CORS = กลไกของ browser จำกัดการเรียกข้าม origin, แก้ฝั่ง server
- `multipart/form-data` = ใช้ส่งไฟล์
- Swagger/OpenAPI = สเปกเอกสาร API, Postman = เครื่องมือทดสอบ API
- `fetch` คืน Promise, `res.ok`, `await res.json()`
- `localStorage` เก็บ string, ไม่หมดอายุเอง; `sessionStorage` หมดเมื่อปิดแท็บ
- `let/const` block scope, `var` function scope; `===` เทียบแบบไม่แปลงชนิด
- Event delegation = ผูก listener ที่แม่ แล้วใช้ `e.target.closest(...)`
