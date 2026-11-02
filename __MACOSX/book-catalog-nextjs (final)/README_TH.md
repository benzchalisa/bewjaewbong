# คู่มือใช้งาน Book Catalog (Next.js)

คู่มือนี้สอน 3 เรื่อง: **ติดตั้งแพ็กเกจ (npm install)**, **เปิดเว็บเซิร์ฟเวอร์**, และ **build / รันด้วย Docker**

---

## 0. ทำความเข้าใจโปรเจกต์ก่อน

โปรเจกต์นี้เป็น **ส่วนหน้าเว็บ (Frontend)** ที่ไม่ได้เก็บข้อมูลหนังสือเอง แต่ส่งต่อไปยัง **Backend (Express)** อีกที

```
เบราว์เซอร์ ──► Next.js (พอร์ต 3001) ──► Express Backend (พอร์ต 3000)
                 หน้าเว็บ + /api/*          เก็บข้อมูลหนังสือจริง
```

> ⚠️ **สำคัญ:** ค่าเริ่มต้นของ Next.js คือพอร์ต 3000 ซึ่ง **ชนกับ Backend** (Backend ก็ใช้ 3000)
> ดังนั้นในคู่มือนี้เรารัน Next.js ที่พอร์ต **3001** ทุกกรณี
>
> โปรเจกต์นี้ **ไม่มีโค้ด Backend รวมอยู่** — ต้องเปิด Express ของคุณที่พอร์ต 3000 ไว้ด้วย
> ถ้ายังไม่เปิด หน้าเว็บจะขึ้นแถบแดง "เชื่อมต่อ Backend ไม่ได้" (ปกติ ไม่ใช่บั๊ก)

### โครงสร้างไฟล์

| ไฟล์ / โฟลเดอร์ | หน้าที่ |
|---|---|
| `package.json` | รายชื่อแพ็กเกจ + คำสั่งลัด (scripts) |
| `package-lock.json` | ล็อกเวอร์ชันแพ็กเกจให้ทุกเครื่องได้ตรงกัน (ห้ามลบ ห้ามแก้เอง) |
| `next.config.mjs` | ตั้งค่า Next.js |
| `.env.example` | ตัวอย่างตัวแปรสภาพแวดล้อม (`BACKEND_URL`) |
| `app/layout.js` | โครงหน้าเว็บหลัก (ครอบทุกหน้า) |
| `app/page.js` | หน้าแรก: ตาราง ค้นหา เพิ่ม/แก้ไข/ลบ |
| `app/globals.css` | CSS ทั้งเว็บ |
| `app/api/books/route.js` | ส่งต่อ GET/POST ไป Backend |
| `app/api/books/[id]/route.js` | ส่งต่อ GET/PUT/DELETE ของหนังสือ 1 เล่ม |
| `app/api/upload/route.js` | รับรูปปก บันทึกลง `public/uploads` |
| `Dockerfile`, `.dockerignore`, `docker-compose.yml` | ไฟล์สำหรับ Docker |

### อธิบาย `package.json` (ใส่คอมเมนต์ในไฟล์ JSON ไม่ได้ จึงอธิบายตรงนี้)

```json
{
  "name": "book-catalog-nextjs",   // ชื่อโปรเจกต์
  "version": "1.0.0",              // เวอร์ชันโปรเจกต์
  "private": true,                 // กันเผลอ publish ขึ้น npm
  "scripts": {
    "dev": "next dev",             // เปิดเซิร์ฟเวอร์โหมดพัฒนา
    "build": "next build",         // สร้างไฟล์สำหรับใช้งานจริง
    "start": "next start",         // เปิดเซิร์ฟเวอร์โหมดใช้งานจริง (ต้อง build ก่อน)
    "lint": "eslint"               // ตรวจคุณภาพโค้ด
  },
  "dependencies": {                // แพ็กเกจที่ต้องใช้ตอนรันจริง
    "next": "15.2.4",              // เฟรมเวิร์ก (ล็อกเวอร์ชันตายตัว)
    "react": "^19.0.0",            // ^ = อัปเดตได้เฉพาะ minor/patch ใน 19.x
    "react-dom": "^19.0.0"
  },
  "devDependencies": {             // แพ็กเกจที่ใช้เฉพาะตอนพัฒนา
    "eslint": "^9",
    "eslint-config-next": "15.2.4"
  }
}
```
> บล็อกด้านบนมี `//` เพื่ออธิบายเท่านั้น ไฟล์จริงห้ามใส่ `//` เพราะ JSON ไม่รองรับ

---

## 1. ติดตั้งแพ็กเกจ (`npm install`)

### สิ่งที่ต้องมี
- **Node.js เวอร์ชัน 18.18 ขึ้นไป** (แนะนำ 20 LTS) ดาวน์โหลดที่ https://nodejs.org
- ตรวจสอบว่าติดตั้งแล้ว:
  ```bash
  node -v
  npm -v
  ```

### ขั้นตอน
```bash
# 1) เข้าไปในโฟลเดอร์โปรเจกต์
cd book-catalog-nextjs

# 2) ติดตั้งแพ็กเกจทั้งหมด
npm install
```

**เกิดอะไรขึ้น?** npm อ่าน `package.json` แล้วดาวน์โหลดแพ็กเกจมาไว้ในโฟลเดอร์ `node_modules/` (ใหญ่ ไม่ต้องส่งต่อหรือ commit)

| คำสั่ง | ใช้เมื่อ |
|---|---|
| `npm install` | ติดตั้งครั้งแรก / เพิ่มแพ็กเกจใหม่ (อาจอัปเดต lock file) |
| `npm ci` | ติดตั้งให้ตรงกับ `package-lock.json` เป๊ะ ๆ (ลบ node_modules แล้วลงใหม่) เหมาะกับ Docker/CI |
| `npm install ชื่อแพ็กเกจ` | เพิ่มแพ็กเกจ เช่น `npm install axios` |

---

## 2. เปิดเว็บเซิร์ฟเวอร์

### 2.1 ตั้งค่า Backend URL (ทำครั้งเดียว)
```bash
# macOS / Linux
cp .env.example .env.local

# Windows (Command Prompt)
copy .env.example .env.local
```
ค่าเริ่มต้นในไฟล์คือ `BACKEND_URL=http://localhost:3000` ซึ่งตรงกับกรณีรัน Express บนเครื่องเดียวกัน

### 2.2 โหมดพัฒนา (Development) — ใช้ตอนเขียนโค้ด
```bash
npm run dev -- -p 3001
```
- เปิดเบราว์เซอร์ไปที่ **http://localhost:3001**
- แก้โค้ดแล้วหน้าเว็บจะ **รีเฟรชให้เองอัตโนมัติ** (Hot Reload)
- `-p 3001` คือสั่งให้ใช้พอร์ต 3001 (เครื่องหมาย `--` แยกอาร์กิวเมนต์ของ npm ออกจากของ Next.js)
- หยุดเซิร์ฟเวอร์: กด **Ctrl + C** ในเทอร์มินัล

### 2.3 โหมดใช้งานจริง (Production) — ไม่ใช้ Docker
```bash
# 1) สร้างไฟล์ที่ optimize แล้ว (ได้โฟลเดอร์ .next)
npm run build

# 2) เปิดเซิร์ฟเวอร์
# macOS / Linux
PORT=3001 npm start

# Windows PowerShell
$env:PORT=3001; npm start
```
เปิด **http://localhost:3001** เช่นเดิม

> หมายเหตุ: ถ้าแก้โค้ดต้อง `npm run build` ใหม่ทุกครั้ง (โหมดนี้ไม่มี Hot Reload)

---

## 3. Docker

### สิ่งที่ต้องมี
ติดตั้ง **Docker Desktop** (Windows/macOS) หรือ Docker Engine (Linux) แล้วตรวจสอบ:
```bash
docker -v
docker compose version
```

### วิธีที่ A: ใช้ Docker Compose (แนะนำ — ง่ายสุด)
```bash
# build + รัน (เห็น log ในหน้าจอ กด Ctrl+C เพื่อหยุด)
docker compose up --build

# หรือรันเบื้องหลัง
docker compose up -d --build

# ดู log
docker compose logs -f

# หยุดและลบคอนเทนเนอร์
docker compose down
```
เปิด **http://localhost:3001**

### วิธีที่ B: ใช้คำสั่ง Docker ตรง ๆ
```bash
# 1) Build image ตั้งชื่อว่า book-catalog (อย่าลืมจุด . ท้ายคำสั่ง = ใช้โฟลเดอร์ปัจจุบัน)
docker build -t book-catalog .

# 2) รันคอนเทนเนอร์
docker run -d --name book-catalog-web \
  -p 3001:3000 \
  -e BACKEND_URL=http://host.docker.internal:3000 \
  --add-host=host.docker.internal:host-gateway \
  -v book_uploads:/app/public/uploads \
  book-catalog
```

| ส่วนของคำสั่ง | ความหมาย |
|---|---|
| `-d` | รันเบื้องหลัง |
| `--name` | ตั้งชื่อคอนเทนเนอร์ |
| `-p 3001:3000` | เปิดพอร์ต 3001 ของเครื่อง ชี้ไปพอร์ต 3000 ในคอนเทนเนอร์ |
| `-e BACKEND_URL=...` | ส่งค่าตัวแปรสภาพแวดล้อมเข้าไป |
| `--add-host=...` | ให้ชื่อ `host.docker.internal` ใช้ได้บน Linux |
| `-v book_uploads:...` | เก็บรูปที่อัปโหลดไว้ใน volume ไม่หายเมื่อลบคอนเทนเนอร์ |

### คำสั่ง Docker ที่ใช้บ่อย
```bash
docker ps                       # ดูคอนเทนเนอร์ที่กำลังรัน
docker ps -a                    # ดูทั้งหมด รวมที่หยุดแล้ว
docker logs -f book-catalog-web # ดู log แบบ real-time
docker stop book-catalog-web    # หยุด
docker start book-catalog-web   # เปิดใหม่
docker rm book-catalog-web      # ลบคอนเทนเนอร์ (ต้องหยุดก่อน)
docker images                   # ดู image ทั้งหมด
docker rmi book-catalog         # ลบ image
docker exec -it book-catalog-web sh   # เข้าไปในคอนเทนเนอร์ (พิมพ์ exit เพื่อออก)
```

### ทำไมต้องใช้ `host.docker.internal`?
ในคอนเทนเนอร์ คำว่า `localhost` หมายถึง **ตัวคอนเทนเนอร์เอง** ไม่ใช่เครื่องของคุณ
ถ้า Express รันอยู่บนเครื่องหลัก ต้องใช้ `host.docker.internal` เพื่อให้คอนเทนเนอร์เรียกออกไปหาเครื่องหลักได้

> ถ้า Backend ก็รันใน Docker ด้วย ให้เพิ่ม service ของ Backend ลงใน `docker-compose.yml`
> แล้วตั้ง `BACKEND_URL=http://ชื่อ-service:3000` แทน

---

## 4. แก้ปัญหาที่พบบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| หน้าเว็บขึ้นแถบแดง "เชื่อมต่อ Backend ไม่ได้" | Express ยังไม่ได้เปิดที่พอร์ต 3000 — เปิด Backend ก่อน แล้วกดปุ่ม ↻ |
| `EADDRINUSE: address already in use :::3001` | มีโปรแกรมอื่นใช้พอร์ตนี้อยู่ — เปลี่ยนเป็นพอร์ตอื่น เช่น `-p 3002` (Docker: `"3002:3000"`) |
| `npm: command not found` | ยังไม่ได้ติดตั้ง Node.js |
| `npm install` ช้า/ล้มเหลว | ตรวจอินเทอร์เน็ต หรือลบ `node_modules` แล้วลองใหม่ |
| Docker: `Cannot connect to the Docker daemon` | ยังไม่ได้เปิด Docker Desktop |
| Docker: ต่อ Backend ไม่ได้ทั้งที่ Express เปิดอยู่ | ตรวจว่า `BACKEND_URL` ใช้ `host.docker.internal` (ไม่ใช่ `localhost`) และ Express ฟังที่ `0.0.0.0` ไม่ใช่เฉพาะ `127.0.0.1` |
| แก้โค้ดแล้ว Docker ไม่เปลี่ยน | ต้อง build ใหม่: `docker compose up --build` |

## 5. ข้อสังเกตเกี่ยวกับโค้ดเดิม (ไม่ได้แก้ให้ เพราะโจทย์คือใส่คอมเมนต์)

1. **ภาพปกยังไม่ถูกบันทึกกับหนังสือ** — รูปถูกอัปโหลดไปที่ `public/uploads` แต่ URL ไม่ได้ส่งไปเก็บที่ Backend (โค้ดมีข้อความแจ้งเรื่องนี้ไว้แล้ว) และตารางยังแสดงปกเป็นตัวอักษรแรกของชื่อ
2. **รูปที่เพิ่งอัปโหลดตอนรันโหมด production อาจเปิดดูไม่ได้ทันที** — Next.js ออกแบบให้ `public/` เป็นไฟล์ที่มีตอน build ถ้าจะแสดงรูปจริง ควรเสิร์ฟรูปผ่าน API route หรือใช้ storage ภายนอก
3. **ข้อความ alert หลังอัปโหลด** — ในโค้ดเป็น `"\\n"` จึงแสดงตัวอักษร `\n` จริง ๆ ถ้าต้องการขึ้นบรรทัดใหม่ให้แก้เป็น `"\n"` (คอมเมนต์ใน `app/page.js` ระบุไว้แล้ว)
4. ไฟล์ `.gitignore` เดิมมี `.env*` ซึ่งกลืน `.env.example` ไปด้วย จึงเพิ่มบรรทัด `!.env.example` ให้ Git เก็บไฟล์ตัวอย่างไว้
