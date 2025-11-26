import { StudentReport } from '../types';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwjvdtkvW5NZVM3ZihQOyErJdk-WPdWnSJ370OZOpow5XEsnGGPplPTEf5T2JlLacNADw/exec";

export const sendReportToGoogleSheet = async (report: StudentReport) => {
  try {
    // เตรียมข้อมูลให้เป็น Flat Object สำหรับลงตาราง
    const data = {
      timestamp: new Date(report.timestamp).toLocaleString('th-TH'),
      studentName: report.studentName,
      dormitory: report.dormitory,
      category: report.category,
      riskLevel: report.riskLevel,
      message: report.message,
      location: report.location ? `${report.location.latitude}, ${report.location.longitude}` : 'ไม่ระบุ',
      mapLink: report.location ? `https://maps.google.com/?q=${report.location.latitude},${report.location.longitude}` : '',
      isResolved: report.isResolved ? 'Solved' : 'Pending',
      reportId: report.id
    };

    // ส่งข้อมูลแบบ text/plain เพื่อหลีกเลี่ยง CORS Preflight check ของ Google Script
    // ใช้ mode: 'no-cors' เพื่อให้ส่งได้แม้ Script ไม่ได้ return header ที่ถูกต้องมา
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: {
        "Content-Type": "text/plain", 
      },
      body: JSON.stringify(data),
    });

    console.log("Report sent to Google Sheet successfully");
  } catch (error) {
    console.error("Error sending to Google Sheet:", error);
    // ไม่ throw error เพื่อให้ App ทำงานต่อได้แม้เน็ตจะมีปัญหาชั่วคราว
  }
};