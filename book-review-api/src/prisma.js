// สร้าง PrismaClient ตัวเดียว แล้วให้ไฟล์อื่น require ไปใช้ร่วมกัน
const { PrismaClient } = require('@prisma/client');

module.exports = new PrismaClient();
