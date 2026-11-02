// ===== /books : CRUD ตารางหนังสือ + อัพโหลดปก =====
const express = require('express');
const prisma = require('../prisma');
const { HttpError } = require('../errors');
const { parseId, requireText, parseRating } = require('../validate');
const { upload, toCoverUrl, deleteFile } = require('../upload');

const router = express.Router();

// หมายเหตุ: Express 5 ถ้าไม่ส่ง JSON มา req.body จะเป็น undefined จึงใช้ `req.body || {}`

// ---------- READ ทั้งหมด (+ค้นหา ?search=xxx) พร้อมรีวิว ----------
router.get('/', async (req, res) => {
  const { search } = req.query;
  const books = await prisma.book.findMany({
    where: search
      ? { OR: [{ title: { contains: search } }, { author: { contains: search } }] }
      : undefined,
    include: { reviews: true },
    orderBy: { id: 'desc' },
  });
  res.json(books);
});

// ---------- READ รายเล่ม ----------
router.get('/:id', async (req, res) => {
  const book = await prisma.book.findUnique({
    where: { id: parseId(req.params.id) },
    include: { reviews: true },
  });
  if (!book) throw new HttpError(404, 'Book not found');
  res.json(book);
});

// ---------- CREATE (รับ multipart/form-data: title, author, cover=ไฟล์) ----------
router.post('/', upload.single('cover'), async (req, res) => {
  try {
    const body = req.body || {};
    const book = await prisma.book.create({
      data: {
        title: requireText(body.title, 'title'),
        author: requireText(body.author, 'author'),
        coverUrl: toCoverUrl(req.file) ?? (body.coverUrl || null), // ไฟล์ก่อน, ไม่มีก็ใช้ลิงก์ที่ส่งมา
      },
    });
    res.status(201).json(book);
  } catch (err) {
    if (req.file) deleteFile(toCoverUrl(req.file)); // ถ้าพลาด ลบไฟล์ที่เพิ่งอัพโหลดทิ้ง
    throw err;
  }
});

// ---------- UPDATE (ส่งเฉพาะ field ที่อยากแก้ก็ได้; ไม่ส่งไฟล์ = ใช้ปกเดิม) ----------
router.put('/:id', upload.single('cover'), async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const body = req.body || {};

    const old = await prisma.book.findUnique({ where: { id } });
    if (!old) throw new HttpError(404, 'Book not found');

    const data = {};
    if (body.title !== undefined) data.title = requireText(body.title, 'title');
    if (body.author !== undefined) data.author = requireText(body.author, 'author');
    if (req.file) data.coverUrl = toCoverUrl(req.file);
    else if (body.coverUrl !== undefined) data.coverUrl = body.coverUrl || null;

    const book = await prisma.book.update({ where: { id }, data });

    if (data.coverUrl !== undefined && data.coverUrl !== old.coverUrl) {
      deleteFile(old.coverUrl); // เปลี่ยนปกแล้ว ลบไฟล์เก่า
    }
    res.json(book);
  } catch (err) {
    if (req.file) deleteFile(toCoverUrl(req.file));
    throw err;
  }
});

// ---------- DELETE (รีวิวของหนังสือเล่มนี้ถูกลบตามอัตโนมัติ: onDelete: Cascade) ----------
router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const book = await prisma.book.delete({ where: { id } }); // ไม่พบ -> P2025 -> 404
  deleteFile(book.coverUrl);
  res.json({ message: 'Book deleted', id });
});

// ---------- รีวิวของหนังสือ (แบบ nested ตามโจทย์เดิม) ----------
router.get('/:id/reviews', async (req, res) => {
  const bookId = parseId(req.params.id);
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new HttpError(404, 'Book not found');
  res.json(await prisma.review.findMany({ where: { bookId }, orderBy: { id: 'desc' } }));
});

router.post('/:id/reviews', async (req, res) => {
  const body = req.body || {};
  const review = await prisma.review.create({
    data: {
      rating: parseRating(body.rating),
      content: requireText(body.content, 'content'),
      bookId: parseId(req.params.id), // bookId ไม่มีอยู่จริง -> P2003 -> 404
    },
  });
  res.status(201).json(review);
});

module.exports = router;
