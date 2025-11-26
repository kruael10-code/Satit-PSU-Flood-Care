import React, { useState } from 'react';
import { Send, MapPin, Loader2, Camera } from 'lucide-react';
import { RiskLevel, StudentReport } from '../types';
import { analyzeReportPriority } from '../services/geminiService';

interface ReportFormProps {
  onSubmit: (report: StudentReport) => void;
  onCancel: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'FOOD' | 'MEDICAL' | 'EVACUATION' | 'OTHER' | 'SAFE_CHECKIN'>('OTHER');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [name, setName] = useState('');
  const [dorm, setDorm] = useState('');

  const getLocation = () => {
    setLocLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocLoading(false);
        },
        () => {
          alert('ไม่สามารถระบุตำแหน่งได้ กรุณาระบุในข้อความ');
          setLocLoading(false);
        }
      );
    } else {
      setLocLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !name) return;

    setLoading(true);
    
    // AI Triage
    const analysis = await analyzeReportPriority(message, category);

    const newReport: StudentReport = {
      id: Date.now().toString(),
      studentName: name,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-สกุล</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อเล่น หรือ ชื่อจริง"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
            />
           </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หอพัก/โซน</label>
            <input
                type="text"
                value={dorm}
                onChange={(e) => setDorm(e.target.value)}
                placeholder="เช่น หอ 8, รูสะมิแล"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
           </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="SAFE_CHECKIN">✅ รายงานตัวปลอดภัย</option>
            <option value="FOOD">🍱 ขาดแคลนอาหาร/น้ำ</option>
            <option value="MEDICAL">💊 เจ็บป่วย/ยา</option>
            <option value="EVACUATION">🚤 ต้องการอพยพ</option>
            <option value="OTHER">📢 อื่นๆ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสถานการณ์</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="เช่น น้ำท่วมสูงเข้าห้อง, ไฟดับมา 2 ชม., ต้องการน้ำดื่ม"
            className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex gap-2">
            <button
            type="button"
            onClick={getLocation}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border ${location ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
            >
            {locLoading ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
            {location ? 'ระบุพิกัดแล้ว' : 'แนบพิกัด GPS'}
            </button>
            <label className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border bg-gray-50 border-gray-200 text-gray-600 cursor-pointer">
                <Camera size={18} />
                แนบรูปภาพ
                <input type="file" className="hidden" accept="image/*" />
            </label>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            ส่งข้อมูล
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
