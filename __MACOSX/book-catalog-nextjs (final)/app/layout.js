// ============================================================
// app/layout.js — Layout หลักของทั้งเว็บ (ครอบทุกหน้า)
// ใน Next.js App Router ทุกหน้าจะถูกส่งเข้ามาเป็น {children} ตรงนี้
// ============================================================

// นำเข้า CSS ส่วนกลาง (มีผลกับทุกหน้า)
import "./globals.css";

// metadata = ข้อมูลที่ Next.js ใส่ใน <head> ให้อัตโนมัติ
export const metadata = {
  title: "Bookspace | Book Catalog", // ข้อความบนแท็บเบราว์เซอร์
  description: "Manage your book collection", // คำอธิบายเว็บ (ใช้กับ SEO)
};

// RootLayout = คอมโพเนนต์ที่ห่อทุกหน้า
// children = เนื้อหาของหน้าที่กำลังแสดง (ในที่นี้คือ app/page.js)
export default function RootLayout({ children }) {
  return (
    // lang="th" บอกเบราว์เซอร์ว่าเว็บนี้เป็นภาษาไทย
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
