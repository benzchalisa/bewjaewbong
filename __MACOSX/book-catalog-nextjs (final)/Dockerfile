# ============================================================
# Dockerfile — สูตรสร้าง Docker Image ของเว็บ Next.js
# ใช้แบบ multi-stage (2 ขั้น): ขั้น build ทำของให้เสร็จ แล้วขั้น run หยิบเฉพาะที่จำเป็น
# ทำให้ image สุดท้ายเล็กกว่าและไม่มีเครื่องมือ build ติดไปด้วย
#
# วิธีใช้:
#   docker build -t book-catalog .
#   docker run -p 3001:3000 -e BACKEND_URL=http://host.docker.internal:3000 book-catalog
# ============================================================

# ---------- ขั้นที่ 1: builder — ติดตั้งแพ็กเกจและ build ----------
# node:20-alpine = Node.js 20 บน Alpine Linux (ขนาดเล็ก) Next.js 15 ต้องใช้ Node 18.18 ขึ้นไป
FROM node:20-alpine AS builder

# โฟลเดอร์ทำงานในคอนเทนเนอร์ (คำสั่งต่อจากนี้รันที่ /app)
WORKDIR /app

# ก๊อปปี้เฉพาะไฟล์รายการแพ็กเกจมาก่อน
# เหตุผล: Docker เก็บ cache ทีละชั้น ถ้า package*.json ไม่เปลี่ยน
# การ build ครั้งต่อไปจะข้าม npm ci ได้ ทำให้เร็วขึ้นมาก
COPY package.json package-lock.json ./

# ติดตั้งแพ็กเกจตาม package-lock.json เป๊ะ ๆ (npm ci เหมาะกับ build อัตโนมัติ/Docker มากกว่า npm install)
RUN npm ci

# ก๊อปปี้โค้ดทั้งหมดเข้ามา (ยกเว้นที่ระบุใน .dockerignore)
COPY . .

# สร้าง production build -> ได้โฟลเดอร์ .next
RUN npm run build

# ลบ devDependencies (eslint ฯลฯ) ออก เหลือเฉพาะที่ใช้ตอนรันจริง
RUN npm prune --omit=dev


# ---------- ขั้นที่ 2: runner — ขั้นรันจริง ----------
FROM node:20-alpine AS runner

WORKDIR /app

# NODE_ENV=production ให้ Next.js ทำงานโหมดเร็ว/ปลอดภัย
ENV NODE_ENV=production
# พอร์ตที่ Next.js จะฟังภายในคอนเทนเนอร์ (ตอน docker run ค่อยจับคู่กับพอร์ตเครื่องหลักด้วย -p)
ENV PORT=3000
# ฟังทุก network interface (จำเป็น ไม่งั้นเข้าจากนอกคอนเทนเนอร์ไม่ได้)
ENV HOSTNAME=0.0.0.0
# ที่อยู่ Backend ค่าเริ่มต้น (host.docker.internal = เครื่องหลักที่รัน Docker) เปลี่ยนได้ตอน docker run ด้วย -e
ENV BACKEND_URL=http://host.docker.internal:3000

# หยิบเฉพาะที่จำเป็นจากขั้น builder; --chown ให้ user "node" เป็นเจ้าของไฟล์
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public

# สร้างโฟลเดอร์เก็บรูปที่อัปโหลด และให้ user "node" เขียนไฟล์ลงได้
RUN mkdir -p public/uploads && chown -R node:node public/uploads

# รันด้วย user "node" (ไม่ใช่ root) เพื่อความปลอดภัย
USER node

# บอกว่าคอนเทนเนอร์นี้ใช้พอร์ต 3000 (เป็นแค่เอกสาร ไม่ได้เปิดพอร์ตจริง ต้องใช้ -p)
EXPOSE 3000

# คำสั่งที่รันเมื่อคอนเทนเนอร์เริ่ม = npm start = next start
CMD ["npm", "start"]
