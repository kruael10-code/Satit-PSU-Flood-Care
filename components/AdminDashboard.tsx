import React, { useState } from 'react';
import { StudentReport, RiskLevel, Announcement } from '../types';
import { MapPin, CheckCircle, Phone, Trash2, Lock, Megaphone, Send, LogOut } from 'lucide-react';

interface AdminDashboardProps {
  reports: StudentReport[];
  announcements: Announcement[];
  resolveReport: (id: string) => void;
  deleteReport: (id: string) => void;
  postAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    reports, 
    announcements,
    resolveReport, 
    deleteReport,
    postAnnouncement,
    deleteAnnouncement
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'BROADCAST'>('REPORTS');

  // Announcement Form State
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceType, setAnnounceType] = useState<'INFO' | 'WARNING' | 'EMERGENCY'>('INFO');

  const criticalCount = reports.filter(r => r.riskLevel === RiskLevel.CRITICAL && !r.isResolved).length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin' || password === '94001') {
        setIsAuthenticated(true);
    } else {
        alert('รหัสผ่านผิด (Hint: admin)');
    }
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
      e.preventDefault();
      if(!announceTitle || !announceContent) return;
      
      postAnnouncement({
          id: Date.now().toString(),
          title: announceTitle,
          content: announceContent,
          timestamp: new Date(),
          type: announceType
      });
      setAnnounceTitle('');
      setAnnounceContent('');
      alert('โพสต์ประกาศเรียบร้อย');
  };

  const getRiskColor = (level: RiskLevel) => {
    switch(level) {
        case RiskLevel.CRITICAL: return 'bg-red-100 border-red-500 text-red-800';
        case RiskLevel.HIGH: return 'bg-orange-100 border-orange-500 text-orange-800';
        case RiskLevel.MEDIUM: return 'bg-yellow-100 border-yellow-500 text-yellow-800';
        default: return 'bg-green-100 border-green-500 text-green-800';
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] px-6">
            <div className="bg-blue-600 p-4 rounded-full mb-4">
                <Lock className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h2>
            <p className="text-gray-500 mb-6 text-center">สำหรับเจ้าหน้าที่/อาจารย์ เท่านั้น</p>
            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่าน (admin)"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
                    เข้าสู่ระบบ
                </button>
            </form>
        </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">ศูนย์บัญชาการ</h2>
            <p className="text-xs text-gray-500">โรงเรียนสาธิต ม.สงขลานครินทร์</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-gray-400 hover:text-red-500">
            <LogOut size={20} />
        </button>
      </div>

      <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm">
        <button 
            onClick={() => setActiveTab('REPORTS')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'REPORTS' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
        >
            แจ้งเหตุ ({reports.filter(r => !r.isResolved).length})
        </button>
        <button 
            onClick={() => setActiveTab('BROADCAST')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'BROADCAST' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
        >
            ประกาศข่าว
        </button>
      </div>

      {activeTab === 'REPORTS' && (
          <div className="space-y-4">
             {criticalCount > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl animate-pulse flex items-center gap-3">
                    <div className="bg-red-600 text-white p-2 rounded-full">
                        <Phone size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-red-800">มีเหตุฉุกเฉิน {criticalCount} รายการ</div>
                        <div className="text-xs text-red-600">โปรดตรวจสอบและประสานงานทันที</div>
                    </div>
                </div>
             )}

            {reports.slice().reverse().map((report) => (
            <div key={report.id} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white relative ${report.isResolved ? 'opacity-60 grayscale' : ''} ${getRiskColor(report.riskLevel).replace('bg-', 'border-').split(' ')[1]}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRiskColor(report.riskLevel)}`}>
                                {report.riskLevel}
                            </span>
                            <span className="text-xs text-gray-500">
                                {new Date(report.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <h4 className="font-bold text-gray-800">{report.studentName} <span className="text-sm font-normal text-gray-500">({report.dormitory})</span></h4>
                    </div>
                    <div className="flex gap-1">
                        {!report.isResolved && (
                            <button 
                                onClick={() => resolveReport(report.id)}
                                className="text-green-600 hover:bg-green-50 p-2 rounded-full"
                                title="รับทราบ/แก้ปัญหาแล้ว"
                            >
                                <CheckCircle size={20} />
                            </button>
                        )}
                        <button 
                            onClick={() => {
                                if(confirm('ลบรายงานนี้?')) deleteReport(report.id);
                            }}
                            className="text-gray-400 hover:bg-red-50 hover:text-red-500 p-2 rounded-full"
                            title="ลบรายงาน"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
                
                <p className="mt-2 text-gray-700 text-sm">{report.message}</p>
                
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 border-t pt-2">
                    <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {report.location ? 'มีพิกัด GPS' : 'ไม่ระบุพิกัด'}
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 font-medium cursor-pointer">
                        <Phone size={14} />
                        ติดต่อกลับ
                    </div>
                </div>
            </div>
            ))}
            {reports.length === 0 && (
                <div className="text-center text-gray-400 py-10">
                    ยังไม่มีการแจ้งเหตุเข้ามา
                </div>
            )}
          </div>
      )}

      {activeTab === 'BROADCAST' && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Megaphone size={20} className="text-blue-600" />
                      สร้างประกาศใหม่
                  </h3>
                  <form onSubmit={handlePostAnnouncement} className="space-y-3">
                      <div>
                          <label className="text-xs text-gray-500">หัวข้อประกาศ</label>
                          <input 
                            type="text" 
                            value={announceTitle}
                            onChange={(e) => setAnnounceTitle(e.target.value)}
                            className="w-full p-2 border rounded-lg" 
                            placeholder="เช่น จุดรับของบริจาค, แจ้งระดับน้ำ"
                            required
                          />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500">เนื้อหา</label>
                          <textarea 
                            value={announceContent}
                            onChange={(e) => setAnnounceContent(e.target.value)}
                            className="w-full p-2 border rounded-lg h-24" 
                            placeholder="รายละเอียด..."
                            required
                          />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500">ความสำคัญ</label>
                          <select 
                            value={announceType}
                            onChange={(e) => setAnnounceType(e.target.value as any)}
                            className="w-full p-2 border rounded-lg"
                          >
                              <option value="INFO">ℹ️ ข่าวสารทั่วไป (สีฟ้า)</option>
                              <option value="WARNING">⚠️ แจ้งเตือน (สีส้ม)</option>
                              <option value="EMERGENCY">🚨 ฉุกเฉิน/สำคัญมาก (สีแดง)</option>
                          </select>
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700">
                          <Send size={16} />
                          โพสต์ประกาศ
                      </button>
                  </form>
              </div>

              <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">ประกาศที่โพสต์แล้ว</h3>
                  <div className="space-y-3">
                      {announcements.map(ann => (
                          <div key={ann.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
                              <div>
                                  <div className={`text-xs font-bold px-2 py-0.5 rounded w-fit mb-1 ${
                                      ann.type === 'EMERGENCY' ? 'bg-red-100 text-red-700' : 
                                      ann.type === 'WARNING' ? 'bg-orange-100 text-orange-700' : 
                                      'bg-blue-100 text-blue-700'
                                  }`}>
                                      {ann.type}
                                  </div>
                                  <div className="font-bold text-gray-800 text-sm">{ann.title}</div>
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">{ann.content}</div>
                              </div>
                              <button 
                                onClick={() => {
                                    if(confirm('ลบประกาศนี้?')) deleteAnnouncement(ann.id);
                                }}
                                className="text-gray-300 hover:text-red-500"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;