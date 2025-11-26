import { StudentReport, Announcement, RiskLevel } from '../types';

const REPORTS_KEY = 'satit_flood_reports';
const ANNOUNCEMENTS_KEY = 'satit_flood_announcements';

// Helper to revive dates from JSON
const dateReviver = (key: string, value: any) => {
  if (key === 'timestamp' && typeof value === 'string') {
    return new Date(value);
  }
  return value;
};

export const getStoredReports = (): StudentReport[] => {
  const data = localStorage.getItem(REPORTS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data, dateReviver);
  } catch (e) {
    console.error("Error parsing reports", e);
    return [];
  }
};

export const saveReports = (reports: StudentReport[]) => {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

export const getStoredAnnouncements = (): Announcement[] => {
  const data = localStorage.getItem(ANNOUNCEMENTS_KEY);
  if (!data) {
    // Default initial announcements
    return [
      {
        id: '1',
        title: '📢 แจ้งงดการเรียนการสอน',
        content: 'โรงเรียนหยุดทำการ 1 วัน เนื่องจากน้ำท่วมขังเส้นทางจราจร',
        timestamp: new Date(Date.now() - 600000),
        type: 'WARNING'
      }
    ];
  }
  try {
    return JSON.parse(data, dateReviver);
  } catch (e) {
    return [];
  }
};

export const saveAnnouncements = (announcements: Announcement[]) => {
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
};

export const clearAllData = () => {
    localStorage.removeItem(REPORTS_KEY);
    localStorage.removeItem(ANNOUNCEMENTS_KEY);
};