function showForm(formId){
    document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
    document.getElementById(formId).classList.add("active");
}

// ฟังก์ชันตรวจสอบเบอร์โทรศัพท์
function validatePhone(phone) {
    // ตรวจสอบว่าเบอร์โทรศัพท์ขึ้นต้นด้วย 0 และมี 10 หลักเท่านั้น
    return /^0\d{9}$/.test(phone);
}

// ฟังก์ชันตรวจสอบรหัสผ่าน
function validatePassword(password) {
    // ตรวจสอบความยาว 8-12 ตัวอักษร
    if (password.length < 8 || password.length > 12) {
        return false;
    }
    
    // ตรวจสอบว่ามีตัวเลขอย่างน้อย 1 ตัว
    if (!/\d/.test(password)) {
        return false;
    }
    
    // ตรวจสอบว่ามีอักขระพิเศษ (/, _, @, #) อย่างน้อย 1 ตัว
    if (!/[\/\_\@\#]/.test(password)) {
        return false;
    }
    
    return true;
}

document.querySelector('#register-form form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const phone = form.phone.value;
    const password = form.password.value;
    
    // ตรวจสอบเบอร์โทรศัพท์
    if (!validatePhone(phone)) {
        alert('กรุณาป้อนเบอร์โทรศัพท์ที่ขึ้นต้นด้วย 0 และมีจำนวน 10 หลักเท่านั้น');
        return;
    }
    
    // ตรวจสอบรหัสผ่าน
    if (!validatePassword(password)) {
        alert('รหัสผ่านต้องมีความยาว 8-12 ตัวอักษร และต้องมีตัวเลขและอักขระพิเศษ (/, _, @, #) อย่างน้อย 1 ตัวต่อประเภท');
        return;
    }
    
    const data = {
      name: name,
      phone: phone,
      password: password
    };
  
    try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      
        const result = await res.json();
        alert(result.message);
        
        if (res.ok) {
            showForm('login-form');
        }
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
        console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', error);
    }
});
  
document.querySelector('#login-form form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const phone = form.phone.value;
    const password = form.password.value;
    
    // ตรวจสอบเบอร์โทรศัพท์
    if (!validatePhone(phone)) {
        alert('กรุณาป้อนเบอร์โทรศัพท์ที่ขึ้นต้นด้วย 0 และมีจำนวน 10 หลักเท่านั้น');
        return;
    }
    
    // ตรวจสอบรหัสผ่าน
    if (!validatePassword(password)) {
        alert('รหัสผ่านต้องมีความยาว 8-12 ตัวอักษร และต้องมีตัวเลขและอักขระพิเศษ (/, _, @, #) อย่างน้อย 1 ตัวต่อประเภท');
        return;
    }
    
    const data = {
      phone: phone,
      password: password
    };
  
    try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      
        const result = await res.json();
        if (res.ok) {
            alert(`สวัสดี ${result.name}`);
            // เก็บทั้ง username และ user object
            localStorage.setItem('username', result.name);
            localStorage.setItem('user', JSON.stringify({
                name: result.name,
                phone: data.phone
            }));
            window.location.href = 'index.html';
        } else {
            alert(result.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง');
        }
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
        console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error);
    }
});