// ===== ตั้งค่าอัพโหลดไฟล์ (multer) =====
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { HttpError } = require('./errors');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  // ตั้งชื่อไฟล์ใหม่กันชื่อซ้ำ เช่น 1730600000000-123456.jpg
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new HttpError(400, 'Only image files are allowed'));
  },
});

// path ที่เก็บลงฐานข้อมูล เช่น "/uploads/1730600000000-123456.jpg"
function toCoverUrl(file) {
  return file ? `/uploads/${file.filename}` : null;
}

// ลบไฟล์ในดิสก์ (ใช้ตอนลบหนังสือ / เปลี่ยนปก) — ลบเฉพาะไฟล์ที่เราอัพโหลดเอง
function deleteFile(coverUrl) {
  if (!coverUrl || !coverUrl.startsWith('/uploads/')) return;
  fs.unlink(path.join(uploadDir, path.basename(coverUrl)), () => {});
}

module.exports = { upload, toCoverUrl, deleteFile };
