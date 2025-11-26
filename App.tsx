import React, { useState, useEffect } from 'react';
import { ViewState, StudentReport, RiskLevel, Announcement } from './types';
import NavBar from './components/NavBar';
import ReportForm from './components/ReportForm';
import AdminDashboard from './components/AdminDashboard';
// ❌ เอา import ChatInterface ออกแล้ว
import ContactList from './components/ContactList';
import { Bell, PhoneCall, Droplets, CloudRain, Waves, Smile, Frown, Utensils, AlertCircle, ChevronRight, Siren, HeartPulse, Loader2, CheckCircle2 } from 'lucide-react';
import { getStoredReports, saveReports, getStoredAnnouncements, saveAnnouncements } from './services/storageService';
import { sendReportToGoogleSheet } from './services/googleSheetService';

// Mock Weather Data for Pattani/Rusamilae
const WEATHER_DATA = {
  seaLevel: "2.8 ม.", // Removed (รทก.)
  rainToday: "120 มม.",
  rainStatus: "ตกหนักมาก",
  forecast: [
    { day: 'วันนี้', icon: <CloudRain size={16} className="text-blue-500" />, temp: '28°', rain: '90%' },
    { day: 'พรุ่งนี้', icon: <CloudRain size={16} className="text-blue-500" />, temp: '27°', rain: '80%' },
    { day: 'พุธ', icon: <CloudRain size={16} className="text-blue-400" />, temp: '29°', rain: '60%' },
    { day: 'พฤหัส', icon: <Droplets size={16} className="text-blue-300" />, temp: '30°', rain: '40%' },
    { day: 'ศุกร์', icon: <CloudRain size={16} className="text-gray-400" />, temp: '31°', rain: '30%' },
    { day: 'เสาร์', icon: <Smile size={16} className="text-yellow-500" />, temp: '32°', rain: '10%' },
    { day: 'อาทิตย์', icon: <Smile size={16} className="text-yellow-500" />, temp: '33°', rain: '0%' },
  ]
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // SOS States
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  // Load data from LocalStorage on mount
  useEffect(() => {
    setReports(getStoredReports());
    setAnnouncements(getStoredAnnouncements());
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveReports(reports);
  }, [reports]);

  useEffect(() => {
    saveAnnouncements(announcements);
  }, [announcements]);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReportSubmit = (report: StudentReport) => {
    setReports(prev => [...prev, report]);
    // Send to Google Sheet
    sendReportToGoogleSheet(report);
    
    setView('HOME');
    alert('ส่งข้อมูลเรียบร้อย เจ้าหน้าที่กำลังตรวจสอบ');
  };

  const resolveReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, isResolved: true } : r));
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const postAnnouncement = (announcement: Announcement) => {
    setAnnouncements(prev => [announcement, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleQuickStatus = (status: 'SAFE' | 'ANXIOUS' | 'HUNGRY') => {
    let report: StudentReport = {
        id: Date.now().toString(),
        studentName: 'นักเรียน (รายงานด่วน)',
        dormitory: 'ไม่ระบุ',
        timestamp: new Date(),
        message: '',
        category: 'OTHER',
        riskLevel: RiskLevel.LOW,
        isResolved: false
    };

    switch (status) {
        case 'SAFE':
            report.message = 'รายงานตัว: ปลอดภัยดีครับ/ค่ะ';
            report.category = 'SAFE_CHECKIN';
            report.riskLevel = RiskLevel.LOW;
            alert("บันทึกสถานะ: ปลอดภัย ✅");
            break;
        case 'ANXIOUS':
            report.message = 'รู้สึกกังวล/เครียด ต้องการคำปรึกษา';
            report.category = 'OTHER';
            report.riskLevel = RiskLevel.MEDIUM;
            alert("บันทึกสถานะ: กังวล (เจ้าหน้าที่จะติดต่อกลับ) ⚠️");
            break;
        case 'HUNGRY':
            report.message = 'ขาดแคลนอาหาร/น้ำดื่ม';
            report.category = 'FOOD';
            report.riskLevel = RiskLevel.HIGH;
            alert("บันทึกสถานะ: ต้องการอาหาร 🍱");
            break;
    }
    setReports(prev => [...prev, report]);
    // Send to Google Sheet
    sendReportToGoogleSheet(report);
  };

  const handleSOS = async () => {
    if (!confirm("ยืนยันแจ้งเหตุฉุกเฉิน (SOS)? \nระบบจะส่งพิกัดและแจ้งเตือนอาจารย์ทันที")) return;

    setSosLoading(true);

    // 1. Attempt to get GPS Location
    let location = undefined;
    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
    } catch (e) {
        console.error("SOS Location failed", e);
    }

    // 2. Create Critical Report (Silent Alarm to System)
    const sosReport: StudentReport = {
        id: Date.now().toString(),
        studentName: 'SOS SIGNAL',
        dormitory: location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'GPS Failed',
        timestamp: new Date(),
        message: '🚨 ขอความช่วยเหลือฉุกเฉิน (SOS BUTTON) \nพิกัด: ' + (location ? `https://maps.google.com/?q=${location.latitude},${location.longitude}` : 'N/A'),
        category: 'EVACUATION',
        riskLevel: RiskLevel.CRITICAL,
        isResolved: false,
        location: location
    };

    setReports(prev => [...prev, sosReport]);
    // Send to Google Sheet
    sendReportToGoogleSheet(sosReport);

    setSosLoading(false);
    
    // 3. Open Emergency Action Modal
    setShowSOSDialog(true);
  };

  const renderHome = () => (
    <div className="px-4 pt-4 pb-24 max-w-md mx-auto space-y-5 animate-fade-in">
      {/* Header with Time */}
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-xl font-bold text-blue-900 leading-tight font-prompt">Satit PSU <br/>Flood Care</h1>
            <p className="text-xs text-gray-500">รูสะมิแล, ปัตตานี</p>
        </div>
        <div className="text-right">
             <div className="text-2xl font-mono font-bold text-gray-800 leading-none">
                {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
             </div>
             <div className="text-xs text-gray-500">
                {currentTime.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })}
             </div>
        </div>
      </div>

      {/* Flood Monitor Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-20">
             <Waves size={100} />
        </div>
        
        <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
                <h2 className="text-sm font-medium text-blue-100 flex items-center gap-1">
                    <Droplets size={14}/> ปริมาณฝนสะสม (วันนี้)
                </h2>
                <div className="text-3xl font-bold">{WEATHER_DATA.rainToday}</div>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{WEATHER_DATA.rainStatus}</span>
            </div>
            <div className="text-right">
                 <h2 className="text-sm font-medium text-blue-100 flex items-center justify-end gap-1">
                    <Waves size={14}/> ระดับน้ำทะเล
                </h2>
                <div className="text-2xl font-bold">{WEATHER_DATA.seaLevel}</div>
                <div className="text-xs text-blue-200">หนุนสูงกว่าปกติ</div>
            </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
             <div className="flex justify-between items-center text-xs text-blue-100 mb-2">
                <span>พยากรณ์ 7 วันข้างหน้า</span>
                <ChevronRight size={14} />
             </div>
             <div className="flex justify-between gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {WEATHER_DATA.forecast.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center min-w-[36px]">
                        <span className="text-[10px] mb-1">{day.day}</span>
                        <div className="mb-1">{day.icon}</div>
                        <span className="text-[10px] font-bold">{day.temp}</span>
                    </div>
                ))}
             </div>
        </div>
      </div>

      {/* Quick Check-in Buttons */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 ml-1">รายงานสถานะด่วน</h3>
        <div className="grid grid-cols-3 gap-3">
            <button 
                onClick={() => handleQuickStatus('SAFE')}
                className="bg-white border-2 border-green-100 hover:border-green-400 hover:bg-green-50 rounded-xl p-3 flex flex-col items-center gap-2 transition-all shadow-sm"
            >
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <Smile size={24} />
                </div>
                <span className="text-xs font-semibold text-gray-700">ปลอดภัยดี</span>
            </button>

            <button 
                onClick={() => handleQuickStatus('ANXIOUS')}
                className="bg-white border-2 border-yellow-100 hover:border-yellow-400 hover:bg-yellow-50 rounded-xl p-3 flex flex-col items-center gap-2 transition-all shadow-sm"
            >
                <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                    <Frown size={24} />
                </div>
                <span className="text-xs font-semibold text-gray-700">รู้สึกกังวล</span>
            </button>

            <button 
                onClick={() => handleQuickStatus('HUNGRY')}
                className="bg-white border-2 border-orange-100 hover:border-orange-400 hover:bg-orange-50 rounded-xl p-3 flex flex-col items-center gap-2 transition-all shadow-sm"
            >
                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                    <Utensils size={24} />
                </div>
                <span className="text-xs font-semibold text-gray-700">ขาดอาหาร</span>
            </button>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-3">
         <button 
            onClick={() => setView('REPORT')}
            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-blue-50 transition"
         >
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} />
            </div>
            <div className="text-left">
                <div className="font-bold text-gray-800 text-sm">แจ้งเหตุอื่นๆ</div>
                <div className="text-xs text-gray-500">แบบฟอร์มละเอียด</div>
            </div>
         </button>
         
         <button 
            onClick={() => setView('CONTACTS')}
            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-green-50 transition"
         >
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <PhoneCall size={20} />
            </div>
            <div className="text-left">
                <div className="font-bold text-gray-800 text-sm">เบอร์ฉุกเฉิน</div>
                <div className="text-xs text-gray-500">ติดต่อ จนท.</div>
            </div>
         </button>
      </div>

      {/* SOS Button */}
      <button 
        onClick={handleSOS}
        disabled={sosLoading}
        className="w-full bg-red-600 text-white rounded-xl py-4 shadow-lg shadow-red-200 active:scale-95 transition-transform flex items-center justify-center gap-3 group mt-2 disabled:opacity-70"
      >
        {sosLoading ? (
            <Loader2 size={24} className="animate-spin" />
        ) : (
            <>
                <div className="relative">
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>
                    <Bell size={24} className="relative z-10" />
                </div>
                <div className="text-left">
                    <div className="text-lg font-bold leading-none">S O S</div>
                    <div className="text-xs opacity-90">ขอความช่วยเหลือฉุกเฉิน</div>
                </div>
            </>
        )}
      </button>

      {/* Announcements */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            ประกาศจากโรงเรียน
        </h3>
        <div className="space-y-3">
            {announcements.map((ann) => (
                <div key={ann.id} className={`text-sm border-l-2 pl-3 ${
                    ann.type === 'EMERGENCY' ? 'border-red-500' :
                    ann.type === 'WARNING' ? 'border-orange-500' : 'border-blue-500'
                }`}>
                    <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-700 text-sm">{ann.title}</p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {new Date(ann.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{ann.content}</p>
                </div>
            ))}
             {announcements.length === 0 && (
                <div className="text-center text-xs text-gray-400 py-2">ยังไม่มีประกาศใหม่</div>
            )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-prompt">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
        {view === 'HOME' && renderHome()}
        {view === 'REPORT' && (
            <div className="px-4 pt-6 pb-20">
                <ReportForm onSubmit={handleReportSubmit} onCancel={() => setView('HOME')} />
            </div>
        )}
        {/* ❌ เอาส่วนแสดงผล ChatInterface ออกแล้ว */}
        {view === 'ADMIN' && (
            <AdminDashboard 
                reports={reports} 
                announcements={announcements}
                resolveReport={resolveReport} 
                deleteReport={deleteReport}
                postAnnouncement={postAnnouncement}
                deleteAnnouncement={deleteAnnouncement}
            />
        )}
        {view === 'CONTACTS' && (
            <ContactList onBack={() => setView('HOME')} />
        )}

        {/* SOS Emergency Modal */}
        {showSOSDialog && (
            <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
                <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                    <div className="bg-red-600 p-5 text-white text-center relative overflow-hidden">
                        <div className="animate-ping w-24 h-24 bg-red-400 rounded-full absolute top-[-20px] left-1/2 -translate-x-1/2 opacity-30"></div>
                        <Siren size={48} className="mx-auto mb-2 relative z-10" />
                        <h2 className="text-2xl font-bold relative z-10">ส่งสัญญาณแล้ว!</h2>
                    </div>
                    
                    <div className="p-5">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
                            <h3 className="text-green-800 font-bold text-sm mb-2 flex items-center gap-2">
                                <CheckCircle2 size={16} /> ระบบแจ้งเตือนเรียบร้อย
                            </h3>
                            <ul className="text-xs text-gray-600 space-y-1 ml-6 list-disc">
                                <li>อ.ที่ปรึกษา (061-914-9553)</li>
                                <li>รองผู้อำนวยการ (089-655-5569)</li>
                                <li>ผอ.โรงเรียน (087-397-3315)</li>
                            </ul>
                        </div>

                        <p className="text-center text-gray-800 font-bold mb-3">ต้องการความช่วยเหลือทางใด?</p>
                        
                        <div className="space-y-3">
                            <a href="tel:191" className="block w-full bg-red-600 text-white py-4 rounded-xl text-xl font-bold text-center shadow-lg hover:bg-red-700 hover:shadow-red-200 transition-all flex items-center justify-center gap-3 active:scale-95">
                                <Siren size={24} />
                                โทร 191 (ตำรวจ)
                            </a>

                            <a href="tel:1669" className="block w-full bg-green-600 text-white py-4 rounded-xl text-xl font-bold text-center shadow-lg hover:bg-green-700 hover:shadow-green-200 transition-all flex items-center justify-center gap-3 active:scale-95">
                                <HeartPulse size={24} />
                                โทร 1669 (แพทย์ฉุกเฉิน)
                            </a>
                        </div>

                        <div className="text-center pt-4">
                            <button onClick={() => setShowSOSDialog(false)} className="text-gray-400 underline text-sm hover:text-gray-600">
                                ปิดหน้าต่างนี้
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
      <NavBar currentView={view} setView={setView} />
    </div>
  );
};

export default App;