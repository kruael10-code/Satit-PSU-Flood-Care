import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  LogOut, 
  Phone, 
  Clock, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  Trash2 
} from 'lucide-react';
import { StudentReport, Announcement, RiskLevel } from '../types'; 

// --- Helper Functions (ใส่ไว้ตรงนี้เพื่อให้ทำงานได้ทันที) ---
const safeDate = (date: any) => {
  if (!date) return new Date();
  return date instanceof Date ? date : new Date(date);
};

const formatTimeSafe = (date: any) => {
  try {
    const d = safeDate(date);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '--:--';
  }
};
// -------------------------------------------------------

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

  // การเรียงลำดับที่ปลอดภัย (Safe Sorting)
  const sortedReports = [...reports].sort((a, b) => {
    const riskScore: Record<string, number> = { 'CRITICAL': 4, 'DANGER': 3, 'CAUTION': 2, 'SAFE': 1 };
    const scoreA = riskScore[a.riskLevel] || 0;
    const scoreB = riskScore[b.riskLevel] || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return safeDate(b.timestamp).getTime() - safeDate(a.timestamp).getTime();
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
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.riskLevel === RiskLevel.CRITICAL ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{report.riskLevel || 'UNKNOWN'}</span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} />{formatTimeSafe(report.timestamp)}</span>
              </div>
              <div className="mb-3">
                 <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{report.studentName}</h3>
                 <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin size={12} /> {report.dormitory || 'ไม่ระบุพิกัด'}</div>
                 <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100"><MessageSquare size={14} className="inline mr-1 text-gray-400"/>{report.message}</div>
                 
                 {report.location && (
                    <a href={`https://www.google.com/maps?q=${report.location.latitude},${report.location.longitude}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded">
                        <MapPin size={12} /> ดูพิกัด GPS
                    </a>
                 )}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                {report.phoneNumber && report.phoneNumber !== 'ไม่ระบุ' && report.phoneNumber !== '-' ? (
                     <a href={`tel:${report.phoneNumber}`} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm active:scale-95"><Phone size={16} /> โทรกลับ</a>
                ) : (<button disabled className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"><Phone size={16} /> ไม่มีเบอร์</button>)}
                
                <button onClick={() => resolveReport(report.id)} className={`p-2 rounded-lg border transition ${report.isResolved ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400'}`}><CheckCircle2 size={20} /></button>
                
                <button onClick={() => deleteReport(report.id)} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
          {reports.length === 0 && (<div className="text-center py-10 text-gray-400"><CheckCircle2 size={48} className="mx-auto mb-2 opacity-20" /><p>ยังไม่มีการแจ้งเหตุ</p></div>)}
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

export default AdminDashboard;