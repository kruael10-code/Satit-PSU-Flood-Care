import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  PhoneCall, 
  Droplets, 
  CloudRain, 
  Waves, 
  Smile, 
  Frown, 
  Utensils, 
  AlertCircle, 
  ChevronRight, 
  Siren, 
  HeartPulse, 
  Loader2, 
  CheckCircle2, 
  User, 
  Phone, 
  X, 
  MapPin, 
  Camera, 
  Send, 
  Trash2, 
  Clock, 
  MessageSquare, 
  LogOut, 
  Lock,
  Home,
  ShieldAlert,
  Shield,
  Info
} from 'lucide-react';

// --- 1. TYPES ---
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
  phoneNumber?: string;
  dormitory: string;
  timestamp: Date;
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

export type ViewState = 'HOME' | 'REPORT' | 'CHAT' | 'ADMIN' | 'CONTACTS';

// --- 2. SERVICES ---

// 🚨 Google Sheet URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzg0TICyh4Kr07KdPJFXWK8vb4-wlc5BEOmGNKompvZwZNXA2EDyJfJcUtD6G5DcEmKqg/exec';

const sendReportToGoogleSheet = async (data: StudentReport) => {
  try {
    const payload = {
      timestamp: new Date().toLocaleString('th-TH'),
      id: data.id,
      name: data.studentName,
      phone: data.phoneNumber || '-',
      dorm: data.dormitory,
      category: data.category,
      risk: data.riskLevel,
      message: data.message,
      location: data.location ? `${data.location.latitude}, ${data.location.longitude}` : '-',
      status: data.isResolved ? 'Solved' : 'Pending'
    };

    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log("✅ ส่งข้อมูลไป Google Sheet เรียบร้อย!");
  } catch (error) {
    console.error("❌ ส่งไม่ผ่าน:", error);
  }
};

const fetchReportsFromSheet = async (): Promise<StudentReport[]> => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    return data.map((item: any) => ({
        id: String(item.id),
        studentName: item.studentName,
        phoneNumber: item.phoneNumber,
        dormitory: item.dormitory,
        timestamp: new Date(item.timestamp || Date.now()), 
        message: item.message,
        category: item.category,
        riskLevel: item.riskLevel,
        location: item.location,
        isResolved: item.isResolved
    })).reverse();
  } catch (error) {
    console.error("❌ ไม่สามารถดึงข้อมูลจาก Sheet ได้:", error);
    return [];
  }
};

// Storage Service
const STORAGE_KEYS = { REPORTS: 'flood_reports', ANNOUNCEMENTS: 'flood_announcements' };

const getStoredReports = (): StudentReport[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return data ? JSON.parse(data, (key, value) => key === 'timestamp' ? new Date(value) : value) : [];
  } catch { return []; }
};

const saveReports = (reports: StudentReport[]) => {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
};

const getStoredAnnouncements = (): Announcement[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data, (key, value) => key === 'timestamp' ? new Date(value) : value) : [];
  } catch { return []; }
};

const saveAnnouncements = (announcements: Announcement[]) => {
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
};

// Gemini Service (Mock)
const analyzeReportPriority = async (message: string, category: string): Promise<{ riskLevel: RiskLevel }> => {
  const criticalKeywords = ['เจ็บ', 'เลือด', 'หมดสติ', 'ไฟดูด', 'จมน้ำ', 'ติดอยู่', 'อพยพ', 'ด่วนที่สุด'];
  const highKeywords = ['ท่วมสูง', 'ไฟดับ', 'ไม่มีอาหาร', 'ป่วย', 'ยาหมด'];
  
  if (category === 'EVACUATION' || criticalKeywords.some(k => message.includes(k))) return { riskLevel: RiskLevel.CRITICAL };
  if (category === 'MEDICAL' || category === 'FOOD' || highKeywords.some(k => message.includes(k))) return { riskLevel: RiskLevel.HIGH };
  if (category === 'SAFE_CHECKIN') return { riskLevel: RiskLevel.LOW };
  
  return { riskLevel: RiskLevel.MEDIUM };
};

// --- 3. COMPONENTS ---

// NavBar
const NavBar: React.FC<{ currentView: ViewState; setView: (view: ViewState) => void }> = ({ currentView, setView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 max-w-md mx-auto shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-pb">
      <button 
        onClick={() => setView('HOME')}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentView === 'HOME' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <Home size={24} strokeWidth={currentView === 'HOME' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">หน้าหลัก</span>
      </button>

      <button 
        onClick={() => setView('REPORT')}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentView === 'REPORT' ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <ShieldAlert size={24} strokeWidth={currentView === 'REPORT' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">แจ้งเหตุ</span>
      </button>

      <button 
        onClick={() => setView('ADMIN')}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentView === 'ADMIN' ? 'text-blue-800 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <Shield size={24} strokeWidth={currentView === 'ADMIN' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">จนท.</span>
      </button>
    </div>
  );
};

// ContactList
const ContactList: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const contacts = [
    { name: 'อ.ที่ปรึกษา', phone: '061-914-9553', desc: 'อาจารย์ประจำหอพัก' },
    { name: 'รองผู้อำนวยการ', phone: '089-655-5569', desc: 'ฝ่ายบริหารทั่วไป' },
    { name: 'ผอ.โรงเรียน', phone: '087-397-3315', desc: 'ผู้อำนวยการ' },
    { name: 'ตำรวจ (สภ.เมือง)', phone: '191', desc: 'เหตุด่วนเหตุร้าย' },
    { name: 'กู้ภัยปัตตานี', phone: '1669', desc: 'เจ็บป่วยฉุกเฉิน' },
  ];

  return (
    <div className="bg-white min-h-screen pb-20 animate-in slide-in-from-right duration-300">
      <div className="bg-blue-600 p-4 text-white flex items-center gap-3 shadow-md sticky top-0 z-10">
        <button onClick={onBack}><ChevronRight className="rotate-180" /></button>
        <h2 className="font-bold text-lg">เบอร์โทรฉุกเฉิน</h2>
      </div>
      <div className="p-4 space-y-3">
        {contacts.map((c, i) => (
          <a key={i} href={`tel:${c.phone}`} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition active:scale-95">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <Phone size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-800">{c.name}</div>
                <div className="text-xs text-gray-500">{c.desc}</div>
              </div>
            </div>
            <div className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg text-sm">{c.phone}</div>
          </a>
        ))}
      </div>
    </div>
  );
};

// ReportForm
const ReportForm: React.FC<{ onSubmit: (report: StudentReport) => void; onCancel: () => void; }> = ({ onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'FOOD' | 'MEDICAL' | 'EVACUATION' | 'OTHER' | 'SAFE_CHECKIN'>('OTHER');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dorm, setDorm] = useState('');

  const getLocation = () => {
    setLocLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocLoading(false);
        },
        () => {
          alert('ไม่สามารถระบุตำแหน่งได้ กรุณาระบุในข้อความ');
          setLocLoading(false);
        }
      );
    } else { setLocLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { alert('⚠️ กรุณากรอก "ชื่อ-สกุล" ให้เรียบร้อยก่อนส่งข้อมูลครับ!'); return; }
    if (!phone.trim()) { alert('⚠️ กรุณากรอก "เบอร์โทรศัพท์" เพื่อให้เจ้าหน้าที่ติดต่อกลับได้ครับ!'); return; }
    if (!message) return;

    setLoading(true);
    const analysis = await analyzeReportPriority(message, category);
    const newReport: StudentReport = {
      id: Date.now().toString(),
      studentName: name,
      phoneNumber: phone,
      dormitory: dorm || 'Unspecified',
      timestamp: new Date(),
      message,
      category,
      riskLevel: analysis.riskLevel,
      location: location ? { latitude: location.lat, longitude: location.lng } : undefined,
      isResolved: false,
    };
    onSubmit(newReport);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in max-w-md mx-auto mt-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">แจ้งเหตุ / ขอความช่วยเหลือ</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-สกุล <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ระบุชื่อ-สกุล" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
           </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หอพัก/โซน</label>
            <input type="text" value={dorm} onChange={(e) => setDorm(e.target.value)} placeholder="เช่น หอ 8" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
           </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxx" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="SAFE_CHECKIN">✅ รายงานตัวปลอดภัย</option>
            <option value="FOOD">🍱 ขาดแคลนอาหาร/น้ำ</option>
            <option value="MEDICAL">💊 เจ็บป่วย/ยา</option>
            <option value="EVACUATION">🚤 ต้องการอพยพ</option>
            <option value="OTHER">📢 อื่นๆ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสถานการณ์</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="เช่น น้ำท่วมสูงเข้าห้อง, ไฟดับมา 2 ชม., ต้องการน้ำดื่ม" className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="flex gap-2">
            <button type="button" onClick={getLocation} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border ${location ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
            {locLoading ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />} {location ? 'ระบุพิกัดแล้ว' : 'แนบพิกัด GPS'}
            </button>
            <label className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border bg-gray-50 border-gray-200 text-gray-600 cursor-pointer">
                <Camera size={18} /> แนบรูปภาพ <input type="file" className="hidden" accept="image/*" />
            </label>
        </div>
        <div className="pt-2 flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">ยกเลิก</button>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />} ส่งข้อมูล
          </button>
        </div>
      </form>
    </div>
  );
};

// AdminDashboard
const AdminDashboard: React.FC<{ 
  reports: StudentReport[]; 
  announcements: Announcement[];
  resolveReport: (id: string) => void;
  deleteReport: (id: string) => void;
  postAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
}> = ({ reports, announcements, resolveReport, deleteReport, postAnnouncement, deleteAnnouncement }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'ANNOUNCE'>('REPORTS');
  const [newAnnounce, setNewAnnounce] = useState({ title: '', content: '', type: 'INFO' });

  useEffect(() => {
    if (localStorage.getItem('floodCareAdminAuth') === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '94001') {
      setIsAuthenticated(true); setError('');
      localStorage.setItem('floodCareAdminAuth', 'true');
    } else { setError('รหัสผ่านไม่ถูกต้อง'); }
  };

  const handleLogout = () => {
      localStorage.removeItem('floodCareAdminAuth');
      setIsAuthenticated(false); setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><Lock size={32} /></div>
            <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบเจ้าหน้าที่</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl text-center text-lg tracking-widest" placeholder="รหัสผ่าน" autoFocus />
            {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    );
  }

  const sortedReports = [...reports].sort((a, b) => {
    const riskScore = { [RiskLevel.CRITICAL]: 4, [RiskLevel.HIGH]: 3, [RiskLevel.MEDIUM]: 2, [RiskLevel.LOW]: 1 };
    if (riskScore[b.riskLevel] !== riskScore[a.riskLevel]) return riskScore[b.riskLevel] - riskScore[a.riskLevel];
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  const unresolvedCount = reports.filter(r => !r.isResolved).length;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
         <h2 className="font-bold text-gray-800 text-lg">จัดการข้อมูล</h2>
         <button onClick={handleLogout} className="text-xs text-red-500 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition"><LogOut size={14} /> ออกจากระบบ</button>
      </div>
      <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6 border border-gray-100">
        <button onClick={() => setActiveTab('REPORTS')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'REPORTS' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>แจ้งเหตุ ({unresolvedCount})</button>
        <button onClick={() => setActiveTab('ANNOUNCE')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ANNOUNCE' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>ประกาศข่าว</button>
      </div>

      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          {unresolvedCount > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                <div className="bg-red-100 p-2 rounded-full text-red-600"><Phone size={20} /></div>
                <div><h3 className="font-bold text-red-800 text-sm">มีเหตุฉุกเฉิน/รอการช่วยเหลือ</h3><p className="text-xs text-red-600">โปรดตรวจสอบและประสานงานทันที</p></div>
            </div>
          )}
          {sortedReports.map((report) => (
            <div key={report.id} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 transition-all ${report.isResolved ? 'opacity-60 border-gray-300' : report.riskLevel === RiskLevel.CRITICAL ? 'border-red-500' : report.riskLevel === RiskLevel.HIGH ? 'border-orange-500' : report.riskLevel === RiskLevel.MEDIUM ? 'border-yellow-400' : 'border-green-500'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.riskLevel === RiskLevel.CRITICAL ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{report.riskLevel}</span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} />{new Date(report.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="mb-3">
                 <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{report.studentName}</h3>
                 <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin size={12} /> {report.dormitory || 'ไม่ระบุพิกัด'}</div>
                 <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100"><MessageSquare size={14} className="inline mr-1 text-gray-400"/>{report.message}</div>
                 {report.location && (<a href={`https://maps.google.com/?q=${report.location.latitude},${report.location.longitude}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"><MapPin size={12} /> ดูพิกัด GPS</a>)}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                {report.phoneNumber && report.phoneNumber !== 'ไม่ระบุ' ? (
                     <a href={`tel:${report.phoneNumber}`} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm active:scale-95"><Phone size={16} /> โทรกลับ</a>
                ) : (<button disabled className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"><Phone size={16} /> ไม่มีเบอร์</button>)}
                <button onClick={() => resolveReport(report.id)} className={`p-2 rounded-lg border transition ${report.isResolved ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400'}`}><CheckCircle size={20} /></button>
                <button onClick={() => deleteReport(report.id)} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
          {reports.length === 0 && (<div className="text-center py-10 text-gray-400"><CheckCircle size={48} className="mx-auto mb-2 opacity-20" /><p>ยังไม่มีการแจ้งเหตุ</p></div>)}
        </div>
      )}
      {activeTab === 'ANNOUNCE' && (
        <div className="space-y-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-3">สร้างประกาศใหม่</h3>
                <input className="w-full mb-2 p-2 border rounded-lg text-sm" placeholder="หัวข้อประกาศ" value={newAnnounce.title} onChange={e => setNewAnnounce({...newAnnounce, title: e.target.value})}/>
                <textarea className="w-full mb-2 p-2 border rounded-lg text-sm h-20" placeholder="รายละเอียด..." value={newAnnounce.content} onChange={e => setNewAnnounce({...newAnnounce, content: e.target.value})}/>
                <div className="flex gap-2 mb-3">
                    {['INFO', 'WARNING', 'EMERGENCY'].map(type => (<button key={type} onClick={() => setNewAnnounce({...newAnnounce, type: type as any})} className={`flex-1 py-1 text-xs rounded border ${newAnnounce.type === type ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>{type}</button>))}
                </div>
                <button onClick={() => { if(!newAnnounce.title) return; postAnnouncement({ id: Date.now().toString(), title: newAnnounce.title, content: newAnnounce.content, type: newAnnounce.type as any, timestamp: new Date() }); setNewAnnounce({ title: '', content: '', type: 'INFO' }); alert('ประกาศแล้ว'); }} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">โพสต์ประกาศ</button>
             </div>
             <div className="space-y-2">
                {announcements.map(ann => (<div key={ann.id} className="bg-white p-3 rounded-lg shadow-sm border flex justify-between items-center"><div><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold mr-2 ${ann.type === 'EMERGENCY' ? 'bg-red-100 text-red-600' : ann.type === 'WARNING' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{ann.type}</span><span className="font-bold text-sm text-gray-700">{ann.title}</span><div className="text-xs text-gray-500 mt-1">{ann.content}</div></div><button onClick={() => deleteAnnouncement(ann.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></div>))}
             </div>
        </div>
      )}
    </div>
  );
};

// --- 4. MAIN APP COMPONENT (ส่วนหลักของแอพ) ---

// ✨ แก้ไข: เพิ่ม WEATHER_DATA กลับมาที่นี่แล้ว
const WEATHER_DATA = {
  seaLevel: "2.8 ม.",
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
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickStatus, setQuickStatus] = useState<'SAFE' | 'ANXIOUS' | 'HUNGRY' | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');

  // ระบบ Auto-Sync ข้อมูล
  useEffect(() => {
    // 1. โหลดจากเครื่องก่อน (เพื่อให้แสดงผลเร็ว)
    setReports(getStoredReports());
    setAnnouncements(getStoredAnnouncements());

    // 2. ดึงข้อมูลจาก Google Sheet (Sync)
    const syncData = async () => {
        const onlineReports = await fetchReportsFromSheet();
        if (onlineReports.length > 0) {
            setReports(onlineReports);
            saveReports(onlineReports); // อัพเดตลงเครื่องด้วย
        }
    };
    syncData(); // ดึงครั้งแรกทันที

    // ตั้งเวลาดึงใหม่ทุก 10 วินาที (Real-time Sync)
    const interval = setInterval(syncData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { saveReports(reports); }, [reports]);
  useEffect(() => { saveAnnouncements(announcements); }, [announcements]);
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReportSubmit = (report: StudentReport) => {
    setReports(prev => [...prev, report]);
    sendReportToGoogleSheet(report);
    setView('HOME');
    alert('ส่งข้อมูลเรียบร้อย เจ้าหน้าที่กำลังตรวจสอบ');
  };

  const resolveReport = (id: string) => { setReports(prev => prev.map(r => r.id === id ? { ...r, isResolved: true } : r)); };
  const deleteReport = (id: string) => { setReports(prev => prev.filter(r => r.id !== id)); };
  const postAnnouncement = (announcement: Announcement) => { setAnnouncements(prev => [announcement, ...prev]); };
  const deleteAnnouncement = (id: string) => { setAnnouncements(prev => prev.filter(a => a.id !== id)); };

  const initiateQuickReport = (status: 'SAFE' | 'ANXIOUS' | 'HUNGRY') => {
    setQuickStatus(status); setQuickName(''); setQuickPhone(''); setShowQuickModal(true);
  };

  const confirmQuickReport = () => {
    if (!quickName.trim()) { alert("กรุณาระบุชื่อ-สกุล"); return; }
    if (!quickPhone.trim()) { alert("กรุณาระบุเบอร์โทรศัพท์"); return; }

    let report: StudentReport = {
        id: Date.now().toString(),
        studentName: quickName,
        phoneNumber: quickPhone,
        dormitory: 'ไม่ระบุ',
        timestamp: new Date(),
        message: '',
        category: 'OTHER',
        riskLevel: RiskLevel.LOW,
        isResolved: false
    };

    switch (quickStatus) {
        case 'SAFE': report.message = 'รายงานตัว: ปลอดภัยดีครับ/ค่ะ'; report.category = 'SAFE_CHECKIN'; report.riskLevel = RiskLevel.LOW; break;
        case 'ANXIOUS': report.message = 'รู้สึกกังวล/เครียด ต้องการคำปรึกษา'; report.category = 'OTHER'; report.riskLevel = RiskLevel.MEDIUM; break;
        case 'HUNGRY': report.message = 'ขาดแคลนอาหาร/น้ำดื่ม'; report.category = 'FOOD'; report.riskLevel = RiskLevel.HIGH; break;
    }

    setReports(prev => [...prev, report]);
    sendReportToGoogleSheet(report);
    setShowQuickModal(false);
    alert("✅ บันทึกข้อมูลเรียบร้อยครับ");
  };

  const handleSOS = async () => {
    if (!confirm("ยืนยันแจ้งเหตุฉุกเฉิน (SOS)? \nระบบจะส่งพิกัดและแจ้งเตือนอาจารย์ทันที")) return;
    setSosLoading(true);
    let location = undefined;
    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => { navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }); });
        location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    } catch (e) { console.error("SOS Location failed", e); }

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
    sendReportToGoogleSheet(sosReport);
    setSosLoading(false);
    setShowSOSDialog(true);
  };

  const renderHome = () => (
    <div className="px-4 pt-4 pb-24 max-w-md mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div><h1 className="text-xl font-bold text-blue-900 leading-tight font-prompt">Satit PSU <br/>Flood Care</h1><p className="text-xs text-gray-500">รูสะมิแล, ปัตตานี</p></div>
        <div className="text-right"><div className="text-2xl font-mono font-bold text-gray-800 leading-none">{currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div><div className="text-xs text-gray-500">{currentTime.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })}</div></div>
      </div>
      
      {/* Monitor Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-20"><Waves size={100} /></div>
        <div className="flex justify-between items-end mb-4 relative z-10">
            <div><h2 className="text-sm font-medium text-blue-100 flex items-center gap-1"><Droplets size={14}/> ปริมาณฝนสะสม</h2><div className="text-3xl font-bold">{WEATHER_DATA.rainToday}</div><span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{WEATHER_DATA.rainStatus}</span></div>
            <div className="text-right"><h2 className="text-sm font-medium text-blue-100 flex items-center justify-end gap-1"><Waves size={14}/> ระดับน้ำทะเล</h2><div className="text-2xl font-bold">{WEATHER_DATA.seaLevel}</div><div className="text-xs text-blue-200">หนุนสูงกว่าปกติ</div></div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
             <div className="flex justify-between items-center text-xs text-blue-100 mb-2"><span>พยากรณ์ 7 วันข้างหน้า</span><ChevronRight size={14} /></div>
             <div className="flex justify-between gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {WEATHER_DATA.forecast.map((day, idx) => (<div key={idx} className="flex flex-col items-center min-w-[36px]"><span className="text-[10px] mb-1">{day.day}</span><div className="mb-1">{day.icon}</div><span className="text-[10px] font-bold">{day.temp}</span></div>))}
             </div>
        </div>
      </div>

      {/* ✨ Modern Quick Status Section */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-blue-50 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
            รายงานสถานะด่วน
        </h3>
        <div className="grid grid-cols-3 gap-3">
            {/* Safe Button */}
            <button 
                onClick={() => initiateQuickReport('SAFE')}
                className="relative group flex flex-col items-center gap-2 p-3 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 active:scale-95"
            >
                <div className="p-3 rounded-full bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Smile size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-green-700">ปลอดภัยดี</span>
            </button>

            {/* Anxious Button */}
            <button 
                onClick={() => initiateQuickReport('ANXIOUS')}
                className="relative group flex flex-col items-center gap-2 p-3 rounded-2xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 active:scale-95"
            >
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Frown size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-yellow-700">รู้สึกกังวล</span>
            </button>

            {/* Hungry Button */}
            <button 
                onClick={() => initiateQuickReport('HUNGRY')}
                className="relative group flex flex-col items-center gap-2 p-3 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 active:scale-95"
            >
                <div className="p-3 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Utensils size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-orange-700">ขาดอาหาร</span>
            </button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3">
         <button onClick={() => setView('REPORT')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-blue-50 transition active:scale-95"><div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><AlertCircle size={24} /></div><div className="text-left"><div className="font-bold text-gray-800 text-sm">แจ้งเหตุอื่นๆ</div><div className="text-xs text-gray-500">แบบฟอร์มละเอียด</div></div></button>
         <button onClick={() => setView('CONTACTS')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-green-50 transition active:scale-95"><div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0"><PhoneCall size={24} /></div><div className="text-left"><div className="font-bold text-gray-800 text-sm">เบอร์ฉุกเฉิน</div><div className="text-xs text-gray-500">ติดต่อ จนท.</div></div></button>
      </div>

      {/* SOS Button */}
      <button onClick={handleSOS} disabled={sosLoading} className="w-full bg-red-600 text-white rounded-2xl py-4 shadow-lg shadow-red-200 active:scale-95 transition-transform flex items-center justify-center gap-3 group mt-2 disabled:opacity-70">{sosLoading ? (<Loader2 size={24} className="animate-spin" />) : (<><div className="relative"><div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div><Bell size={24} className="relative z-10" /></div><div className="text-left"><div className="text-lg font-bold leading-none">S O S</div><div className="text-xs opacity-90">ขอความช่วยเหลือฉุกเฉิน</div></div></>)}</button>
      
      {/* Announcements */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm"><span className="w-1 h-4 bg-blue-500 rounded-full"></span> ประกาศจากโรงเรียน</h3>
        <div className="space-y-3">
            {announcements.map((ann) => (<div key={ann.id} className={`text-sm border-l-2 pl-3 ${ann.type === 'EMERGENCY' ? 'border-red-500' : ann.type === 'WARNING' ? 'border-orange-500' : 'border-blue-500'}`}><div className="flex justify-between items-start"><p className="font-semibold text-gray-700 text-sm">{ann.title}</p><span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(ann.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div><p className="text-gray-500 text-xs mt-1">{ann.content}</p></div>))}
             {announcements.length === 0 && (<div className="text-center text-xs text-gray-400 py-2">ยังไม่มีประกาศใหม่</div>)}
        </div>
      </div>

      {/* ✨ Footer Credit */}
      <div className="text-center py-6 pb-8">
        <div className="inline-flex items-center justify-center gap-2 opacity-60">
            <div className="h-px w-8 bg-gray-300"></div>
            <span className="text-[10px] text-gray-400 font-medium">พัฒนาโดย ฝ่ายกิจการนักเรียน</span>
            <div className="h-px w-8 bg-gray-300"></div>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 font-medium tracking-wider">PSU-DS @2025</p>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-prompt">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
        {view === 'HOME' && renderHome()}
        {view === 'REPORT' && (<div className="px-4 pt-6 pb-20"><ReportForm onSubmit={handleReportSubmit} onCancel={() => setView('HOME')} /></div>)}
        {view === 'ADMIN' && (<AdminDashboard reports={reports} announcements={announcements} resolveReport={resolveReport} deleteReport={deleteReport} postAnnouncement={postAnnouncement} deleteAnnouncement={deleteAnnouncement}/>)}
        {view === 'CONTACTS' && (<ContactList onBack={() => setView('HOME')} />)}
        
        {/* SOS Modal */}
        {showSOSDialog && (<div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300"><div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"><div className="bg-red-600 p-5 text-white text-center relative overflow-hidden"><div className="animate-ping w-24 h-24 bg-red-400 rounded-full absolute top-[-20px] left-1/2 -translate-x-1/2 opacity-30"></div><Siren size={48} className="mx-auto mb-2 relative z-10" /><h2 className="text-2xl font-bold relative z-10">ส่งสัญญาณแล้ว!</h2></div><div className="p-5"><div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5"><h3 className="text-green-800 font-bold text-sm mb-2 flex items-center gap-2"><CheckCircle2 size={16} /> ระบบแจ้งเตือนเรียบร้อย</h3><ul className="text-xs text-gray-600 space-y-1 ml-6 list-disc"><li>อ.ที่ปรึกษา (061-914-9553)</li><li>รองผู้อำนวยการ (089-655-5569)</li><li>ผอ.โรงเรียน (087-397-3315)</li></ul></div><p className="text-center text-gray-800 font-bold mb-3">ต้องการความช่วยเหลือทางใด?</p><div className="space-y-3"><a href="tel:191" className="block w-full bg-red-600 text-white py-4 rounded-xl text-xl font-bold text-center shadow-lg hover:bg-red-700 hover:shadow-red-200 transition-all flex items-center justify-center gap-3 active:scale-95"><Siren size={24} /> โทร 191</a><a href="tel:1669" className="block w-full bg-green-600 text-white py-4 rounded-xl text-xl font-bold text-center shadow-lg hover:bg-green-700 hover:shadow-green-200 transition-all flex items-center justify-center gap-3 active:scale-95"><HeartPulse size={24} /> โทร 1669</a></div><div className="text-center pt-4"><button onClick={() => setShowSOSDialog(false)} className="text-gray-400 underline text-sm hover:text-gray-600">ปิดหน้าต่างนี้</button></div></div></div></div>)}
        
        {/* Quick Report Modern Modal */}
        {showQuickModal && (<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm"><div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"><div className={`p-5 text-white flex justify-between items-center ${quickStatus === 'SAFE' ? 'bg-green-500' : quickStatus === 'ANXIOUS' ? 'bg-yellow-500' : 'bg-orange-500'}`}><div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-full">{quickStatus === 'SAFE' ? <Smile size={24}/> : quickStatus === 'ANXIOUS' ? <Frown size={24}/> : <Utensils size={24}/>}</div><div><div className="text-xs opacity-90">ยืนยันสถานะ</div><div className="text-lg font-bold">{quickStatus === 'SAFE' ? 'ปลอดภัยดี' : quickStatus === 'ANXIOUS' ? 'รู้สึกกังวล' : 'ขาดอาหาร'}</div></div></div><button onClick={() => setShowQuickModal(false)} className="bg-white/20 p-1 rounded-full hover:bg-white/40 transition"><X size={20} /></button></div><div className="p-6 space-y-4"><div><label className="text-sm font-bold text-gray-700 mb-1 block">ชื่อ-สกุล <span className="text-red-500">*</span></label><div className="relative"><User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={quickName} onChange={e => setQuickName(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" placeholder="เช่น สมชาย ใจดี" autoFocus/></div></div><div><label className="text-sm font-bold text-gray-700 mb-1 block">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label><div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="tel" value={quickPhone} onChange={e => setQuickPhone(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" placeholder="เช่น 081-234-5678"/></div></div><div className="pt-2 flex gap-3"><button onClick={() => setShowQuickModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">ยกเลิก</button><button onClick={confirmQuickReport} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg shadow-gray-200 active:scale-95 transition ${quickStatus === 'SAFE' ? 'bg-green-500 hover:bg-green-600' : quickStatus === 'ANXIOUS' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-orange-500 hover:bg-orange-600'}`}>ยืนยันข้อมูล</button></div></div></div></div>)}
      </div>
      <NavBar currentView={view} setView={setView} />
    </div>
  );
};

export default App;