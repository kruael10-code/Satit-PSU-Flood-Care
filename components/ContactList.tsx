import React from 'react';
import { Phone, ArrowLeft, Shield, User, Star, Siren } from 'lucide-react';

interface ContactListProps {
  onBack: () => void;
}

const ContactList: React.FC<ContactListProps> = ({ onBack }) => {
  const contacts = [
    { 
      name: 'อ.ที่ปรึกษาชุมนุมหอพัก', 
      tel: '0619149553', 
      icon: <User size={24} className="text-blue-500" />, 
      desc: 'ดูแลนักเรียนหอพัก',
      color: 'bg-blue-50'
    },
    { 
      name: 'รองผู้อำนวยการฝ่ายกิจการ', 
      tel: '089-655-5569', 
      icon: <Star size={24} className="text-orange-500" />, 
      desc: 'กิจการนักเรียน',
      color: 'bg-orange-50'
    },
    { 
      name: 'สายตรง ผอ.', 
      tel: '0873973315', 
      icon: <Star size={24} className="text-purple-500" />, 
      desc: 'ผู้อำนวยการโรงเรียน',
      color: 'bg-purple-50'
    },
    { 
      name: 'รปภ.ม.อ.ปัตตานี', 
      tel: '073313345', 
      icon: <Shield size={24} className="text-green-600" />, 
      desc: 'หน่วยรักษาความปลอดภัย',
      color: 'bg-green-50'
    },
    { 
      name: 'จนท.ตำรวจ', 
      tel: '191', 
      icon: <Siren size={24} className="text-red-600" />, 
      desc: 'แจ้งเหตุด่วนเหตุร้าย',
      color: 'bg-red-50'
    },
  ];

  return (
    <div className="bg-white min-h-screen pb-20 animate-fade-in">
      <div className="bg-green-600 p-4 text-white sticky top-0 z-10 flex items-center gap-3 shadow-md">
        <button onClick={onBack} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={24} />
        </button>
        <div>
            <h2 className="text-xl font-bold font-prompt">เบอร์โทรฉุกเฉิน</h2>
            <p className="text-xs text-green-100">กดที่รายชื่อเพื่อโทรออก</p>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {contacts.map((contact, idx) => (
          <a
            key={idx}
            href={`tel:${contact.tel.replace(/-/g, '')}`}
            className={`flex items-center gap-4 p-4 border border-gray-100 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all ${contact.color}`}
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                {contact.icon}
            </div>
            <div className="flex-1">
                <div className="font-bold text-gray-800 text-lg leading-tight">{contact.name}</div>
                <div className="text-xs text-gray-500 mt-1">{contact.desc}</div>
            </div>
            <div className="bg-green-600 p-2.5 rounded-full text-white shadow-sm">
                <Phone size={20} fill="currentColor" />
            </div>
          </a>
        ))}
      </div>
      
      <div className="px-6 py-4 text-center">
          <p className="text-xs text-gray-400">
            หากติดต่อไม่ได้ ให้ติดต่อ 191 หรือ 1669 (เจ็บป่วยฉุกเฉิน)
          </p>
      </div>
    </div>
  );
};

export default ContactList;