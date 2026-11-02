// ============================================================
// app/api/upload/route.js — API อัปโหลดรูปปกหนังสือ  (URL: POST /api/upload)
// หน้าที่: รับไฟล์รูปจากหน้าเว็บ -> ตรวจสอบ -> บันทึกลง public/uploads -> ตอบ URL กลับ
// ============================================================

import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises"; // สร้างโฟลเดอร์ / เขียนไฟล์
import path from "node:path"; // จัดการ path ของไฟล์ให้ถูกต้องทุกระบบปฏิบัติการ
import { randomUUID } from "node:crypto"; // สร้างรหัสสุ่มไม่ซ้ำ ใช้ตั้งชื่อไฟล์

// บังคับให้รันบน Node.js runtime (ต้องใช้ fs เขียนไฟล์ ซึ่ง Edge runtime ทำไม่ได้)
export const runtime = "nodejs";

export async function POST(request) {
  try {
    // อ่านข้อมูลฟอร์มแบบ multipart/form-data ที่หน้าเว็บส่งมา
    const formData = await request.formData();
    const file = formData.get("file"); // ดึงไฟล์จากฟิลด์ชื่อ "file"

    // ตรวจที่ 1: ต้องมีไฟล์ และต้องเป็นไฟล์จริง (มีเมธอด arrayBuffer)
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ message: "ไม่พบไฟล์ที่อัปโหลด" }, { status: 400 });
    }

    // ตรวจที่ 2: ต้องเป็นรูปภาพเท่านั้น (MIME type ขึ้นต้นด้วย image/)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "อนุญาตเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    }

    // ตรวจที่ 3: ขนาดไม่เกิน 5 MB (5 * 1024 * 1024 ไบต์)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "ไฟล์ต้องมีขนาดไม่เกิน 5 MB" }, { status: 400 });
    }

    // หานามสกุลไฟล์ (เช่น .png) ถ้าไม่มีให้ใช้ .png
    // แล้วลบอักขระแปลก ๆ ออก เหลือเฉพาะ จุด, a-z, 0-9 เพื่อความปลอดภัย
    const ext = (path.extname(file.name).toLowerCase() || ".png").replace(/[^.a-z0-9]/g, "");

    // ตั้งชื่อไฟล์ใหม่เป็นรหัสสุ่ม กันชื่อซ้ำและกันการเดาชื่อไฟล์
    const filename = `${randomUUID()}${ext}`;

    // โฟลเดอร์ปลายทาง: <โฟลเดอร์โปรเจกต์>/public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // สร้างโฟลเดอร์ถ้ายังไม่มี (recursive = ไม่ error ถ้ามีอยู่แล้ว)
    await mkdir(uploadDir, { recursive: true });

    // แปลงไฟล์เป็น Buffer แล้วเขียนลงดิสก์
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

    // สำเร็จ: ตอบ 201 Created พร้อม URL ที่เปิดดูรูปได้ เช่น /uploads/xxxx.png
    return NextResponse.json({ message: "อัปโหลดสำเร็จ", url: `/uploads/${filename}` }, { status: 201 });
  } catch {
    // เกิดข้อผิดพลาดที่ไม่คาดคิด (เช่น เขียนไฟล์ไม่ได้เพราะไม่มีสิทธิ์) -> 500
    return NextResponse.json({ message: "เกิดข้อผิดพลาดระหว่างอัปโหลดไฟล์" }, { status: 500 });
  }
}
