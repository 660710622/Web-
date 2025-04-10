const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const bookingsFile = path.join(__dirname, 'bookings.json');
const usersFile = path.join(__dirname, 'users.json');

app.use(express.static(path.join(__dirname, 'public'))); // ให้เข้าถึงไฟล์ html, css, js
app.use(express.json()); // รองรับ JSON payload

function readUsers() {
  if (!fs.existsSync(usersFile)) return {};
  return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}

function writeUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

// อ่านข้อมูลการจองจากไฟล์ JSON

function readBookings() {
  if (!fs.existsSync(bookingsFile)) return {};
  return JSON.parse(fs.readFileSync(bookingsFile, 'utf8'));
}

function writeBookings(data) {
  fs.writeFileSync(bookingsFile, JSON.stringify(data, null, 2));
}

// API: ดึงข้อมูลการจองทั้งหมด
app.get('/api/bookings', (req, res) => {
  const bookings = readBookings();
  res.json(bookings);
});

// API: จองจุด
app.post('/api/book', (req, res) => {
  const { spot, name } = req.body;
  if (!spot || !name) return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });

  // ตรวจสอบก่อนว่า spot ถูกจองไปแล้วหรือยัง
  const bookings = readBookings();
  if (bookings[spot]) {
    return res.status(400).json({ message: 'จุดนี้ถูกจองแล้ว!' });
  }

  bookings[spot] = name; // บันทึกชื่อคนจอง
  writeBookings(bookings);

  res.json({ message: `จองจุด ${spot} สำเร็จโดย ${name}` });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post('/api/register', (req, res) => {
  const { name, phone, password } = req.body;
  const users = readUsers();

  if (users[phone]) {
    return res.status(400).json({ message: 'เบอร์นี้ลงทะเบียนแล้ว' });
  }

  users[phone] = { name, password };
  writeUsers(users);

  res.json({ message: 'ลงทะเบียนสำเร็จ' });
});

app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  const users = readUsers();

  if (!users[phone] || users[phone].password !== password) {
    return res.status(401).json({ message: 'เบอร์หรือรหัสผ่านไม่ถูกต้อง' });
  }

  res.json({ message: 'เข้าสู่ระบบสำเร็จ', name: users[phone].name });
});

app.post('/api/book', (req, res) => {
  const { spot, name } = req.body;
  const bookings = readBookings();

  if (!spot || !name) return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });
  if (bookings[spot]) return res.status(400).json({ message: 'จุดนี้ถูกจองแล้ว' });

  bookings[spot] = name;
  writeBookings(bookings);

  res.json({ message: 'จองสำเร็จ', spot });
});

app.post('/api/book', (req, res) => {
  const { spot, name } = req.body;
  if (!spot || !name) return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });

  // ตรวจสอบก่อนว่า spot ถูกจองไปยัง
  const bookings = readBookings();
  if (bookings[spot]) {
    return res.status(400).json({ message: 'จุดนี้ถูกจองแล้ว!' });
  }

  bookings[spot] = name; // ✔️ บันทึกชื่อคนจอง
  writeBookings(bookings);

  res.json({ message: `จองจุด ${spot} สำเร็จโดย ${name}` });
});

app.get('/api/qr-payment', (req, res) => {
  const spot = req.query.spot || '';
  const price = req.query.price || '0';
  
  const imagePath = path.join(__dirname, 'public', 'images', 'payment-qr.png');
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    // หากไม่มีรูป ส่ง fallback image หรือ error
    res.status(404).send('QR Code image not found');
  }
});