export enum RiskLevel {
  LOW = 'SAFE',
  MEDIUM = 'CAUTION',
  HIGH = 'DANGER',
  CRITICAL = 'CRITICAL'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface StudentReport {
  id: string;
  studentName: string;
  // ✨ เพิ่มบรรทัดนี้ครับ (ใส่ ? ไว้เพื่อให้ข้อมูลเก่าที่ไม่เคยมีเบอร์ไม่ Error)
  phoneNumber?: string; 
  dormitory: string;
  timestamp: Date; // In storage this will be string, needs conversion
  location?: Coordinates;
  message: string;
  category: 'FOOD' | 'MEDICAL' | 'EVACUATION' | 'OTHER' | 'SAFE_CHECKIN';
  riskLevel: RiskLevel;
  imageUrl?: string;
  isResolved: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  type: 'INFO' | 'WARNING' | 'EMERGENCY';
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger';
  timestamp: string;
}

export type ViewState = 'HOME' | 'REPORT' | 'CHAT' | 'ADMIN' | 'CONTACTS';