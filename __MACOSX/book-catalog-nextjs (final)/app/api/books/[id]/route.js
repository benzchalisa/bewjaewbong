// ============================================================
// app/api/books/[id]/route.js — API Route แบบ Dynamic  (URL: /api/books/5 ฯลฯ)
// [id] ในชื่อโฟลเดอร์ = ส่วนที่เปลี่ยนไปตามหนังสือแต่ละเล่ม
// หน้าที่: ส่งต่อคำขอที่เกี่ยวกับหนังสือ "เล่มเดียว" ไปยัง Backend Express
//   GET    /api/books/:id -> ดูข้อมูลหนังสือ 1 เล่ม
//   PUT    /api/books/:id -> แก้ไขข้อมูลหนังสือ
//   DELETE /api/books/:id -> ลบหนังสือ
// ============================================================

import { NextResponse } from "next/server";

// ที่อยู่ Backend (ค่าเริ่มต้น http://localhost:3000)
const backend = process.env.BACKEND_URL || "http://localhost:3000";

// ---------- GET: ดูหนังสือ 1 เล่ม ----------
// พารามิเตอร์ตัวแรก (_request) ไม่ได้ใช้ จึงใส่ _ นำหน้า
// params = ค่าจาก URL เช่น { id: "5" }
export async function GET(_request, { params }) {
  // ใน Next.js 15 params เป็น Promise ต้อง await ก่อนใช้
  const { id } = await params;
  try {
    // เรียก Backend เพื่อขอหนังสือตาม id (ไม่แคช)
    const res = await fetch(`${backend}/books/${id}`, { cache: "no-store" });
    const body = await res.text();

    // ส่งผลลัพธ์จาก Backend กลับไปตามเดิม
    return new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    // ต่อ Backend ไม่ได้ -> 502 Bad Gateway
    return NextResponse.json({ message: "เชื่อมต่อ Backend ไม่ได้" }, { status: 502 });
  }
}

// ---------- PUT: แก้ไขหนังสือ ----------
export async function PUT(request, { params }) {
  const { id } = await params; // เลข id ของหนังสือที่จะแก้
  try {
    // อ่านข้อมูลใหม่ที่หน้าเว็บส่งมา (JSON)
    const body = await request.text();

    // ส่งต่อให้ Backend ด้วยวิธี PUT (แทนที่ข้อมูลเดิม)
    const res = await fetch(`${backend}/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });

    // ส่งคำตอบจาก Backend กลับไปตามเดิม
    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json({ message: "เชื่อมต่อ Backend ไม่ได้" }, { status: 502 });
  }
}

// ---------- DELETE: ลบหนังสือ ----------
export async function DELETE(_request, { params }) {
  const { id } = await params; // เลข id ของหนังสือที่จะลบ
  try {
    // ส่งคำสั่งลบไปที่ Backend (ไม่ต้องมี body)
    const res = await fetch(`${backend}/books/${id}`, { method: "DELETE" });
    const body = await res.text();

    // ส่งผลลัพธ์กลับไปตามเดิม
    return new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json({ message: "เชื่อมต่อ Backend ไม่ได้" }, { status: 502 });
  }
}
