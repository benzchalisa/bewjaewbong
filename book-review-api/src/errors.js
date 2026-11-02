// ===== จัดการ error ทั้งระบบไว้ที่เดียว =====

// error ที่เราโยนเองพร้อม status code  เช่น throw new HttpError(404, 'Book not found')
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ถูกเรียกอัตโนมัติเมื่อมี error ใน route (Express 5 จับ error จาก async ให้เอง)
function errorHandler(err, req, res, next) {
  // 1) error ที่เราโยนเอง
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  // 2) Prisma: แก้/ลบ record ที่ไม่มีอยู่
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  // 3) Prisma: foreign key ผิด (เช่น bookId ที่ไม่มีหนังสือ)
  if (err.code === 'P2003') {
    return res.status(404).json({ error: 'Related record (book) not found' });
  }
  // 4) multer: ไฟล์ใหญ่เกิน / field ไฟล์ชื่อผิด
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  // 5) JSON ที่ส่งมาพัง
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { HttpError, errorHandler };
