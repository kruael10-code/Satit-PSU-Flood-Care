import { StudentReport } from '../types';

// 🚨 สำคัญมาก: Web App URL จาก Google Script ของคุณ (ตรวจสอบว่าถูกต้องแล้ว)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzg0TICyh4Kr07KdPJFXWK8vb4-wlc5BEOmGNKompvZwZNXA2EDyJfJcUtD6G5DcEmKqg/exec';

// ฟังก์ชันส่งข้อมูล (ขาไป)
export const sendReportToGoogleSheet = async (data: StudentReport) => {
  try {
    // แปลงข้อมูลให้เป็น Format ที่ Google Sheet เข้าใจง่ายๆ
    const payload = {
      timestamp: new Date().toLocaleString('th-TH'), // วันเวลาไทย
      id: data.id,
      name: data.studentName,
      phone: data.phoneNumber || '-',     // เบอร์โทร (ถ้าไม่มีใส่ -)
      dorm: data.dormitory,
      category: data.category,
      risk: data.riskLevel,
      message: data.message,
      location: data.location ? `${data.location.latitude}, ${data.location.longitude}` : '-',
      status: data.isResolved ? 'Solved' : 'Pending'
    };

    // ส่งข้อมูลออกไป
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // จำเป็นต้องใส่ตัวนี้ เพื่อไม่ให้ Browser บล็อก
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("✅ ส่งข้อมูลไป Google Sheet เรียบร้อย!");
  } catch (error) {
    console.error("❌ ส่งไม่ผ่าน:", error);
  }
};

// ✨ ฟังก์ชันดึงข้อมูล (ขากลับ) - เพิ่มใหม่ตามที่ขอค่ะ
export const fetchReportsFromSheet = async (): Promise<StudentReport[]> => {
  try {
    // เรียกไปที่ URL เดิม (Google Script จะทำงานที่ฟังก์ชัน doGet)
    const response = await fetch(GOOGLE_SCRIPT_URL);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    // แปลงข้อมูลที่ได้กลับมาเป็นรูปแบบ StudentReport ที่แอพเข้าใจ
    return data.map((item: any) => ({
        id: item.id,
        studentName: item.studentName,
        phoneNumber: item.phoneNumber,
        dormitory: item.dormitory,
        // แปลง Timestamp กลับเป็น Date Object
        timestamp: new Date(item.timestamp || Date.now()), 
        message: item.message,
        category: item.category,
        riskLevel: item.riskLevel,
        location: item.location,
        isResolved: item.isResolved
    })).reverse(); // เรียงเอาข้อมูลล่าสุดขึ้นก่อน (ถ้า Sheet เรียงเก่าไปใหม่)

  } catch (error) {
    console.error("❌ ไม่สามารถดึงข้อมูลจาก Sheet ได้:", error);
    return []; // ถ้า Error ให้ส่งอาเรย์ว่างกลับไปก่อน แอพจะได้ไม่พัง
  }
};