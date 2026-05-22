import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { X, KeyRound, Eye, EyeOff, Shield, Copy, CalendarRange, AlertTriangle, RefreshCw } from 'lucide-react';

const SettingsModal = ({ onClose, years = [2569, 2570, 2571, 2572, 2573], currentYear = 2569, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('password'); // 'password' or 'copy_year'
  
  // Tab 1: Password States
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab 2: Copy Year States
  const defaultFrom = years.find(y => y === currentYear - 1) || (years[0] !== currentYear ? years[0] : years[1] || 2569);
  const [fromYear, setFromYear] = useState(defaultFrom);
  const [toYear, setToYear] = useState(currentYear);

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

  const handleCopyYearData = async (e) => {
    e.preventDefault();

    if (fromYear === toYear) {
      return Swal.fire('แจ้งเตือน', 'กรุณาระบุปีต้นทางและปีปลายทางที่แตกต่างกัน', 'warning');
    }

    const result = await Swal.fire({
      title: 'ยืนยันการคัดลอกโครงสร้าง?',
      html: `
        <div class="text-left text-sm space-y-2">
          <p>คุณกำลังจะคัดลอกข้อมูลการจัดวางบุคลากรและข้อคิดเห็นทั้งหมดจาก:</p>
          <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-3 my-2 text-center">
            <span class="font-black text-xl text-indigo-700">ปีการศึกษา ${fromYear} &rarr; ปีการศึกษา ${toYear}</span>
          </div>
          <p class="text-red-500 font-bold flex gap-1 items-start mt-2">
            <span class="shrink-0 mt-0.5">⚠️</span> 
            <span>คำเตือน: ข้อมูลการจัดวางของปีการศึกษา ${toYear} ที่มีอยู่เดิมจะถูก "ลบและเขียนทับด้วยข้อมูลปี ${fromYear}" ทั้งหมด! การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ใช่, คัดลอกและเขียนทับ',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        const res = await axios.post('http://localhost/pnpman/api/copy_year.php', {
          from_year: fromYear,
          to_year: toYear,
        });
        
        if (res.data.status === 'success') {
          Swal.fire({
            title: 'คัดลอกสำเร็จ!',
            text: res.data.message,
            icon: 'success'
          });
          if (onRefresh) onRefresh();
        } else {
          Swal.fire('เกิดข้อผิดพลาด', res.data.message || 'ไม่สามารถคัดลอกข้อมูลได้', 'error');
        }
      } catch (err) {
        Swal.fire('ผิดพลาด', err.response?.data?.message || 'ไม่สามารถคัดลอกโครงสร้างได้เนื่องจากข้อผิดพลาดของเซิร์ฟเวอร์', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transition-all transform scale-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Shield size={20} className="text-indigo-600" />
            ตั้งค่าระบบ
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-150 rounded-full transition-all">
            <X size={22} />
          </button>
        </div>

        {/* Tab Menu */}
        <div className="flex border-b border-gray-100 bg-slate-50/50">
          <button 
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'password'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
            }`}
          >
            <KeyRound size={16} />
            เปลี่ยนรหัสผ่าน
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('copy_year')}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'copy_year'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
            }`}
          >
            <Copy size={16} />
            คัดลอกปีการศึกษา
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Tab 1: Password Form */}
          {activeTab === 'password' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-3 rounded-xl border border-amber-200">
                  <KeyRound size={22} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">เปลี่ยนรหัสผ่านผู้ดูแลระบบ</h3>
                  <p className="text-xs text-gray-500">กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่เพื่อความปลอดภัย</p>
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
                      className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
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
                      className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="อย่างน้อย 4 ตัวอักษร"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPw && newPw.length < 4 && (
                    <p className="text-red-500 text-xs mt-1 font-medium">ต้องมีอย่างน้อย 4 ตัวอักษร</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      confirmPw && confirmPw !== newPw ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300'
                    }`}
                    placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                  />
                  {confirmPw && confirmPw !== newPw && (
                    <p className="text-red-500 text-xs mt-1 font-medium">รหัสผ่านไม่ตรงกัน</p>
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
          )}

          {/* Tab 2: Copy Year Form */}
          {activeTab === 'copy_year' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-3 rounded-xl border border-indigo-200">
                  <CalendarRange size={22} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">คัดลอกโครงสร้างข้ามปีการศึกษา</h3>
                  <p className="text-xs text-gray-500">คัดลอกข้อมูลการจัดวางและหมายเหตุจากปีการศึกษาหนึ่งไปยังอีกปีหนึ่ง</p>
                </div>
              </div>

              <form onSubmit={handleCopyYearData} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">จากปีการศึกษา (ต้นทาง)</label>
                    <select
                      value={fromYear}
                      onChange={e => setFromYear(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>ปีการศึกษา {y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">ไปยังปีการศึกษา (ปลายทาง)</label>
                    <select
                      value={toYear}
                      onChange={e => setToYear(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>ปีการศึกษา {y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {fromYear === toYear && (
                  <p className="text-red-500 text-xs font-bold flex gap-1 items-center">
                    <span>⚠️</span>
                    <span>กรุณาเลือกปีการศึกษาต้นทางและปลายทางให้แตกต่างกัน</span>
                  </p>
                )}

                {/* Warning Card */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800 text-xs leading-relaxed">
                  <AlertTriangle size={22} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5 text-red-950">🚨 ข้อควรระวังและเตือนความปลอดภัย:</span>
                    การดำเนินการนี้จะคัดลอกตำแหน่งงาน, คณะครูในแผนก, บันทึกข้อคิดเห็นของ <strong className="text-indigo-900">ปีการศึกษา {fromYear}</strong> ไปยัง <strong className="text-indigo-900">ปีการศึกษา {toYear}</strong>
                    <div className="mt-1 font-bold text-red-700 bg-white/60 p-2 rounded border border-red-100">
                      ⚠️ ข้อมูลเดิมทั้งหมดในปีการศึกษา {toYear} จะถูกลบถาวรและเขียนทับทันที!
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || fromYear === toYear}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><RefreshCw size={16} className="animate-spin" /> กำลังคัดลอกข้อมูล...</>
                  ) : (
                    <><Copy size={16} /> คัดลอกโครงสร้างและเขียนทับทันที</>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
