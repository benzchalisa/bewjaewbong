// ===== จุดเริ่มต้นของ server =====
const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./errors');

const app = express();

app.use(cors());          // อนุญาตให้หน้าเว็บ (คนละพอร์ต) เรียก API ได้
app.use(express.json());  // อ่าน body แบบ JSON
// เปิดให้เข้าถึงรูปที่อัพโหลดได้ที่ http://localhost:3000/uploads/ชื่อไฟล์
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/books', require('./routes/books'));
app.use('/reviews', require('./routes/reviews'));

// path ที่ไม่มีอยู่
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
// ต้องวางหลังสุดเสมอ
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
