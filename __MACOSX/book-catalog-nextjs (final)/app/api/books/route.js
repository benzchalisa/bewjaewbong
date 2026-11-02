// ============================================================
// app/api/books/route.js — API Route ของ Next.js  (URL: /api/books)
// หน้าที่: เป็น "ตัวกลาง (proxy)" รับคำขอจากหน้าเว็บ แล้วส่งต่อไปยัง Backend Express
//   GET  /api/books  -> ขอรายการหนังสือทั้งหมด
//   POST /api/books  -> เพิ่มหนังสือใหม่
// ============================================================

import { NextResponse } from "next/server";

// ที่อยู่ Backend อ่านจากตัวแปร BACKEND_URL (ดูไฟล์ .env.example)
// ถ้าไม่ได้ตั้งค่า จะใช้ http://localhost:3000 เป็นค่าเริ่มต้น
const backend = process.env.BACKEND_URL || "http://localhost:3000";

// ---------- GET: ดึงรายการหนังสือทั้งหมด ----------
export async function GET() {
  try {
    // เรียก Backend จริง; cache: "no-store" = ไม่แคช ให้ได้ข้อมูลล่าสุดทุกครั้ง
    const res = await fetch(`${backend}/books`, { cache: "no-store" });

    // อ่านผลลัพธ์เป็นข้อความดิบ (ยังไม่แปลง JSON) เพื่อส่งต่อให้หน้าเว็บตามเดิม
    const body = await res.text();

    // ส่งต่อทั้งเนื้อหา, status code และ Content-Type จาก Backend กลับไปให้หน้าเว็บ
    return new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    // ถ้าต่อ Backend ไม่ได้ (เช่น ยังไม่ได้เปิด Express) ตอบ 502 Bad Gateway
    return NextResponse.json(
      { message: "เชื่อมต่อ Backend ไม่ได้ กรุณาเปิด Express ที่พอร์ต 3000" },
      { status: 502 }
    );
  }
}

// ---------- POST: เพิ่มหนังสือใหม่ ----------
// request = คำขอที่หน้าเว็บส่งมา (มี JSON ของหนังสือใน body)
export async function POST(request) {
  try {
    // อ่าน body ของคำขอเป็นข้อความดิบ
    const body = await request.text();

    // ส่งต่อให้ Backend ด้วยวิธี POST พร้อมบอกว่าเป็น JSON
    const res = await fetch(`${backend}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    // อ่านคำตอบจาก Backend แล้วส่งต่อกลับไปให้หน้าเว็บ
    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    // ต่อ Backend ไม่ได้ -> 502
    return NextResponse.json({ message: "เชื่อมต่อ Backend ไม่ได้" }, { status: 502 });
  }
}
