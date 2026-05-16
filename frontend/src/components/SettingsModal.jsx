import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { X, KeyRound, Eye, EyeOff, Shield } from 'lucide-react';

const SettingsModal = ({ onClose }) => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPw || !newPw || !confirmPw) {
      return Swal.fire('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง', 'warning');
    }
    if (newPw.length < 4) {
      return Swal.fire('แจ้งเตือน', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร', 'warning');
    }
    if (newPw !== confirmPw) {
      return Swal.fire('แจ้งเตือน', 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน', 'warning');
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post('http://localhost/pnpman/api/change_password.php', {
        current_password: currentPw,
        new_password: newPw,
      });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      Swal.fire({ title: 'เปลี่ยนรหัสผ่านสำเร็จ!', text: 'กรุณาใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งถัดไป', icon: 'success' });
    } catch (err) {
      Swal.fire('ผิดพลาด', err.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-indigo-50 to-white">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Shield size={20} className="text-indigo-500" />
            ตั้งค่าระบบ
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
            <X size={22} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-3 rounded-xl border border-amber-200">
              <KeyRound size={22} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">เปลี่ยนรหัสผ่าน</h3>
              <p className="text-xs text-gray-500">กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">รหัสผ่านปัจจุบัน</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">รหัสผ่านใหม่</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="อย่างน้อย 4 ตัวอักษร"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {newPw && newPw.length < 4 && (
                <p className="text-red-500 text-xs mt-1">ต้องมีอย่างน้อย 4 ตัวอักษร</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                  confirmPw && confirmPw !== newPw ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
              />
              {confirmPw && confirmPw !== newPw && (
                <p className="text-red-500 text-xs mt-1">รหัสผ่านไม่ตรงกัน</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !currentPw || !newPw || !confirmPw || newPw !== confirmPw || newPw.length < 4}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> กำลังบันทึก...</>
              ) : (
                <><KeyRound size={16} /> เปลี่ยนรหัสผ่าน</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
