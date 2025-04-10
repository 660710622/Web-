document.addEventListener('DOMContentLoaded', () => {
  const user = localStorage.getItem('username');
  if (!user) {
    alert('กรุณาเข้าสู่ระบบก่อน');
    window.location.href = 'login.html';
    return;
  }

  // เพิ่ม QR Code Modal เข้าไปใน body
  document.body.insertAdjacentHTML('beforeend', `
    <div id="paymentModal" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.6);">
      <div style="background:#fff; margin:10% auto; padding:20px; border-radius:10px; width:90%; max-width:400px; text-align:center;">
        <span id="closeModal" style="float:right; cursor:pointer; font-size:24px;">&times;</span>
        <h2>ชำระเงินสำหรับการจอง</h2>
        <p>ยืนยันการจอง: <span id="spot-name"></span></p>
        <p>ราคา: <span id="spot-price"></span> บาท</p>
        <div style="margin:15px 0; padding:10px; background:#f8f8f8; border-radius:8px;">
          <img id="qr-code" src="" alt="QR Code" style="width:200px; margin:0 auto; display:block;">
          <p>กรุณาสแกน QR Code เพื่อชำระเงิน</p>
        </div>
        <button id="confirm-payment" style="padding:10px 20px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">
          ยืนยันการชำระเงิน
        </button>
      </div>
    </div>
  `);

  // ตัวแปรเก็บค่าการจอง
  let currentSpot = null;
  const prices = { 'P': 150, 'C': 300 };  // ราคาที่จอดรถ/กางเต็นท์

  // ดึง elements จาก DOM
  const modal = document.getElementById('paymentModal');
  const closeBtn = document.getElementById('closeModal');
  const confirmBtn = document.getElementById('confirm-payment');

  // ปิด modal
  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  // ยืนยันการชำระเงิน
  confirmBtn.onclick = async () => {
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spot: currentSpot, name: user })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        // อัพเดต UI ให้แสดงว่าจุดนี้ถูกจองแล้ว
        const spots = document.querySelectorAll('.spot');
        for (let spot of spots) {
          if (spot.innerText === currentSpot) {
            spot.classList.add('booked');
            spot.style.backgroundColor = '#FF0000';
            spot.disabled = true;
            spot.title = `จองโดย: ${user}`;
            break;
          }
        }
        modal.style.display = 'none';
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error booking:', error);
      alert('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่');
    }
  };

  // โหลดข้อมูลการจอง
  fetch('/api/bookings')
    .then(res => res.json())
    .then(bookings => {
      document.querySelectorAll('.spot').forEach(btn => {
        if (bookings[btn.innerText]) {
          btn.classList.add('booked');
          btn.style.backgroundColor = '#FF0000';
          btn.disabled = true;
          btn.title = `จองโดย: ${bookings[btn.innerText]}`;
        }
      });
    })
    .catch(error => console.error('Error loading bookings:', error));
    
  // เพิ่ม event listener สำหรับการจอง
  document.querySelectorAll('.spot').forEach(spot => {
    spot.addEventListener('click', () => {
      if (confirm(`ยืนยันการจอง ${spot.innerText} ใช่หรือไม่?`)) {
        currentSpot = spot.innerText;
        const spotType = currentSpot.charAt(0); // P หรือ C
        
        // แสดงข้อมูลใน modal
        document.getElementById('spot-name').textContent = currentSpot;
        document.getElementById('spot-price').textContent = prices[spotType];
        document.getElementById('qr-code').src = `/api/qr-payment?spot=${currentSpot}&price=${prices[spotType]}`;
        
        // แสดง modal
        modal.style.display = 'block';
      }
    });
  });
});




