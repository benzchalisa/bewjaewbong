// ===== ฟังก์ชันตรวจข้อมูลที่ส่งเข้ามา =====
const { HttpError } = require('./errors');

// แปลง "5" -> 5 และเช็กว่าเป็นจำนวนเต็มบวก
function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, 'id must be a positive integer');
  }
  return id;
}

// ข้อความที่ห้ามว่าง เช่น title, author, content
function requireText(value, fieldName) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new HttpError(400, `${fieldName} is required`);
  return text;
}

// rating ต้องเป็นจำนวนเต็ม 1-5  (ข้อมูลจาก FormData เป็น string จึงต้องแปลงเป็น Number)
function parseRating(value) {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, 'rating must be an integer between 1 and 5');
  }
  return rating;
}

module.exports = { parseId, requireText, parseRating };
