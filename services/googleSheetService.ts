import { StudentReport } from '../types';

// 🚨 สำคัญมาก: เอา Web App URL จาก Google Script มาใส่ตรงนี้ครับ
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwBSZTAgshzbrH8C8y-yGPqbi_2JOQYLfucAUUJdcIAaLyqwylZIpY7K0aujK2F3envQ/exec';

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