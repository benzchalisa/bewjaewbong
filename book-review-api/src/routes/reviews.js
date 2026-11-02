// ===== /reviews : CRUD ตารางรีวิว (แบบ flat ใช้คู่กับ crud-template.js ได้ตรงๆ) =====
const express = require('express');
const prisma = require('../prisma');
const { HttpError } = require('../errors');
const { parseId, requireText, parseRating } = require('../validate');

const router = express.Router();

// READ ทั้งหมด (+กรองตามหนังสือ ?bookId=1) พร้อมข้อมูลหนังสือ
router.get('/', async (req, res) => {
  const { bookId } = req.query;
  const reviews = await prisma.review.findMany({
    where: bookId ? { bookId: parseId(bookId) } : undefined,
    include: { book: true },
    orderBy: { id: 'desc' },
  });
  res.json(reviews);
});

// READ รายอัน
router.get('/:id', async (req, res) => {
  const review = await prisma.review.findUnique({
    where: { id: parseId(req.params.id) },
    include: { book: true },
  });
  if (!review) throw new HttpError(404, 'Review not found');
  res.json(review);
});

// CREATE  body: { bookId, rating, content }  (JSON หรือ form-data ก็ได้)
router.post('/', async (req, res) => {
  const body = req.body || {};
  const review = await prisma.review.create({
    data: {
      bookId: parseId(body.bookId),
      rating: parseRating(body.rating),
      content: requireText(body.content, 'content'),
    },
  });
  res.status(201).json(review);
});

// UPDATE (ส่งเฉพาะ field ที่จะแก้)
router.put('/:id', async (req, res) => {
  const body = req.body || {};
  const data = {};
  if (body.rating !== undefined) data.rating = parseRating(body.rating);
  if (body.content !== undefined) data.content = requireText(body.content, 'content');

  const review = await prisma.review.update({
    where: { id: parseId(req.params.id) },
    data,
  });
  res.json(review);
});

// DELETE
router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  await prisma.review.delete({ where: { id } });
  res.json({ message: 'Review deleted', id });
});

module.exports = router;
