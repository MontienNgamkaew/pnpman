import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { DragDropContext } from '@hello-pangea/dnd';
import StaffPool from './components/StaffPool';
import OrgChart from './components/OrgChart';
import PersonnelModal from './components/PersonnelModal';
import LoginModal from './components/LoginModal';
import PersonnelAdminModal from './components/PersonnelAdminModal';
import SettingsModal from './components/SettingsModal';
import DashboardStats from './components/DashboardStats';
import PrintReport from './components/PrintReport';
import { Lock, LogOut, Users, Download, Trash2, Edit3, Save, Copy, Settings, Search, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

// Role placement rules based on main_title
const ROLE_RULES = {
  'ผู้อำนวยการ': ['ผู้อำนวยการวิทยาลัย'],
  'รองผู้อำนวยการ': ['รองผู้อำนวยการฝ่าย'],
  'ข้าราชการครู': ['หัวหน้างาน', 'ผู้ช่วยหัวหน้างาน', 'หัวหน้าแผนกวิชา'],
  'พนักงานราชการครู': ['หัวหน้างาน', 'ผู้ช่วยหัวหน้างาน', 'หัวหน้าแผนกวิชา'],
  'ครูพิเศษสอน': ['หัวหน้างาน', 'ผู้ช่วยหัวหน้างาน', 'หัวหน้าแผนกวิชา'],
  'เจ้าหน้าที่': ['เจ้าหน้าที่งาน'],
};

function canPlaceRole(mainTitle, targetRole) {
  const trimmed = (mainTitle || '').trim();
  const allowed = ROLE_RULES[trimmed];
  if (!allowed) return true; // If not in rules, allow
  return allowed.includes(targetRole);
}

function App() {
  const [departments, setDepartments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [academicYear, setAcademicYear] = useState(2569);
  
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightPersonId, setHighlightPersonId] = useState(null);

  const isAdmin = !!token;

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('adminToken', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('adminToken');
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost/pnpman/api/get_data.php?year=${academicYear}`);
      setDepartments(res.data.data.departments);
      setJobs(res.data.data.jobs);
      setPersonnel(res.data.data.personnel);
      setAssignments(res.data.data.assignments);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [academicYear]);

  const handleRemoveAssignment = async (personnelId, jobId, role) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณต้องการลบตำแหน่งนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบเลย',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        await axios.post('http://localhost/pnpman/api/remove_assignment.php', {
          personnel_id: personnelId,
          job_id: jobId,
          role: role,
          academic_year: academicYear,
        });
        fetchData();
        Swal.fire({ title: 'ลบสำเร็จ!', icon: 'success', timer: 1200, showConfirmButton: false });
      } catch (error) {
        Swal.fire('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถลบได้', 'error');
      }
    }
  };

  const handleClearAll = async () => {
    const result = await Swal.fire({
      title: 'เคลียร์ทั้งหมด?',
      html: `<p>คุณต้องการลบการจัดวาง<strong>ทั้งหมด</strong>ของปีการศึกษา <strong>${academicYear}</strong> หรือไม่?</p><p class="text-sm text-gray-500 mt-2">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'เคลียร์ทั้งหมด',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.post('http://localhost/pnpman/api/clear_assignments.php', {
          academic_year: academicYear,
        });
        fetchData();
        Swal.fire({ title: 'เคลียร์สำเร็จ!', text: res.data.message, icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (error) {
        Swal.fire('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถเคลียร์ได้', 'error');
      }
    }
  };

  const handleDragEnd = async (result) => {
    if (!isAdmin || !editMode) return;
    
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    if (source.droppableId === 'staff-pool' && destination.droppableId.startsWith('job|')) {
      const personId = parseInt(draggableId.replace('person-', ''));
      const parts = destination.droppableId.split('|');
      const jobId = parseInt(parts[1]);
      const role = parts[2];

      const person = personnel.find(p => p.id === personId);
      
      // Check role placement rules
      if (person && !canPlaceRole(person.main_title, role)) {
        Swal.fire({
          title: 'ไม่สามารถวางได้',
          html: `<strong>${person.name}</strong> (${person.main_title})<br/>ไม่สามารถวางในตำแหน่ง <strong>${role}</strong> ได้`,
          icon: 'error',
          confirmButtonColor: '#6366f1',
        });
        return;
      }

      // Optimistic update
      const tempId = Date.now();
      setAssignments(prev => [...prev, { id: tempId, personnel_id: personId, job_id: jobId, role, academic_year: academicYear }]);

      try {
        const res = await axios.post('http://localhost/pnpman/api/assign_job.php', {
          personnel_id: personId, job_id: jobId, role, academic_year: academicYear,
        });
        if (res.data.status !== 'success') {
          setAssignments(prev => prev.filter(a => a.id !== tempId));
        } else {
          fetchData();
        }
      } catch (error) {
        setAssignments(prev => prev.filter(a => a.id !== tempId));
        Swal.fire('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถมอบหมายงานได้', 'error');
      }
    }
  };

  const handleLogin = (newToken) => {
    setToken(newToken);
    setShowLogin(false);
    Swal.fire({ title: 'เข้าสู่ระบบสำเร็จ!', icon: 'success', timer: 1200, showConfirmButton: false });
  };

  const handleLogout = () => {
    setToken(null);
    setEditMode(false);
    Swal.fire({ title: 'ออกจากระบบแล้ว', icon: 'info', timer: 1000, showConfirmButton: false });
  };

  const handleSave = () => {
    setEditMode(false);
    Swal.fire({ title: 'บันทึกเรียบร้อย!', text: 'ข้อมูลได้ถูกบันทึกเรียบร้อยแล้ว', icon: 'success', timer: 1500, showConfirmButton: false });
  };

  const handleCopyYear = async () => {
    const prevYear = academicYear - 1;
    const result = await Swal.fire({
      title: 'คัดลอกจากปีก่อน',
      html: `<div style="text-align:left; font-size:14px;">
        <p>คัดลอกการจัดวางทั้งหมดจาก:</p>
        <p style="font-size:18px; font-weight:bold; color:#4f46e5; margin:8px 0;">ปีการศึกษา ${prevYear} → ${academicYear}</p>
        <p class="text-sm text-gray-500" style="margin-top:8px;">⚠️ ข้อมูลการจัดวางปี ${academicYear} ที่มีอยู่จะถูกแทนที่</p>
      </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'คัดลอกเลย',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.post('http://localhost/pnpman/api/copy_year.php', {
          from_year: prevYear,
          to_year: academicYear,
        });
        fetchData();
        Swal.fire({ title: 'คัดลอกสำเร็จ!', text: res.data.message, icon: 'success' });
      } catch (error) {
        Swal.fire('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถคัดลอกได้', 'error');
      }
    }
  };

  if (loading && departments.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const years = [2569, 2570, 2571, 2572, 2573];

  // Search + highlight
  const searchResults = searchQuery.trim()
    ? personnel.filter(p => p.name.includes(searchQuery.trim()))
    : [];

  const handleSearchSelect = (person) => {
    setHighlightPersonId(person.id);
    setSearchQuery('');
    // Auto-clear highlight after 4 seconds
    setTimeout(() => setHighlightPersonId(null), 4000);
  };

  // PDF export — preview in new tab + save
  const handleExportPDF = () => {
    const reportEl = document.getElementById('printable-report');
    if (!reportEl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire('แจ้งเตือน', 'กรุณาอนุญาตให้เปิด Popup ในบราวเซอร์', 'warning');
      return;
    }

    // Gather all stylesheets
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(el => el.outerHTML).join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>ผังโครงสร้าง — ปีการศึกษา ${academicYear}</title>
        ${styles}
        <style>
          * { font-family: 'TH Sarabun New', 'TH SarabunPSK', 'Sarabun', sans-serif !important; }
          body { margin: 0; background: #f3f4f6; }
          #printable-report { display: block !important; position: relative !important; background: white; max-width: 297mm; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
          .print-toolbar {
            position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
            background: linear-gradient(135deg, #6b1525, #8b1a2b);
            padding: 12px 24px; display: flex; align-items: center; justify-content: space-between;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          .print-toolbar h3 { color: white; margin: 0; font-size: 16px; font-weight: 700; }
          .print-toolbar .btn-group { display: flex; gap: 10px; }
          .print-toolbar button {
            padding: 8px 20px; border: none; border-radius: 8px; font-size: 14px;
            font-weight: 700; cursor: pointer; transition: all 0.2s;
            font-family: 'TH Sarabun New', 'TH SarabunPSK', 'Sarabun', sans-serif !important;
          }
          .btn-save { background: #22c55e; color: white; }
          .btn-save:hover { background: #16a34a; transform: translateY(-1px); }
          .btn-close { background: rgba(255,255,255,0.2); color: white; }
          .btn-close:hover { background: rgba(255,255,255,0.3); }
          #printable-report { margin-top: 60px; }
          @media print {
            .print-toolbar { display: none !important; }
            body { background: white; }
            #printable-report { margin-top: 0; box-shadow: none; max-width: none; }
            body * { visibility: visible; }
          }
        </style>
      </head>
      <body>
        <div class="print-toolbar">
          <h3>📄 ตัวอย่างผังโครงสร้าง — ปีการศึกษา ${academicYear}</h3>
          <div class="btn-group">
            <button class="btn-save" onclick="window.print()">💾 บันทึกเป็น PDF</button>
            <button class="btn-close" onclick="window.close()">✕ ปิดหน้านี้</button>
          </div>
        </div>
        ${reportEl.outerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Excel export
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [["โครงสร้างการบริหารงาน วิทยาลัยการอาชีพพนมไพร"], ["ปีการศึกษา " + academicYear], []];
    summaryData.push(["ฝ่าย", "งาน/แผนก", "ตำแหน่ง", "ชื่อบุคลากร", "ตำแหน่งหลัก", "หมายเหตุ"]);

    departments.forEach(dept => {
      const deptJobs = jobs.filter(j => j.department_id === dept.id);
      deptJobs.forEach(job => {
        const jobAssignments = assignments.filter(a => a.job_id === job.id);
        if (jobAssignments.length === 0) {
          summaryData.push([dept.name, job.name, "- ว่าง -", "", "", ""]);
        } else {
          jobAssignments.forEach((a, i) => {
            const person = personnel.find(p => p.id === a.personnel_id);
            summaryData.push([
              i === 0 ? dept.name : "",
              i === 0 ? job.name : "",
              a.role,
              person?.name || "ไม่พบ",
              person?.main_title || "",
              a.comment || ""
            ]);
          });
        }
      });
    });
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{wch:30},{wch:35},{wch:20},{wch:25},{wch:20},{wch:30}];
    XLSX.utils.book_append_sheet(wb, ws1, "โครงสร้าง");

    // Sheet 2: Personnel list
    const personnelData = [["ลำดับ", "ชื่อ-นามสกุล", "ตำแหน่งหลัก", "จำนวนงานที่รับ"]];
    personnel.forEach((p, i) => {
      const count = assignments.filter(a => a.personnel_id === p.id).length;
      personnelData.push([i + 1, p.name, p.main_title || "ไม่ระบุ", count]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(personnelData);
    ws2['!cols'] = [{wch:8},{wch:30},{wch:20},{wch:15}];
    XLSX.utils.book_append_sheet(wb, ws2, "บุคลากร");

    XLSX.writeFile(wb, `โครงสร้าง_ปี${academicYear}.xlsx`);
    Swal.fire({ title: 'ส่งออก Excel สำเร็จ!', icon: 'success', timer: 1200, showConfirmButton: false });
  };

  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col">
      {/* Header */}
      <header className="header-gradient rounded-2xl p-5 mb-6 flex justify-between items-center z-10 relative flex-wrap gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-full border-2 border-white/50 shadow-md object-cover bg-white" />
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-sm">
              ระบบบริหารจัดการโครงสร้างสถานศึกษาอาชีวศึกษา
            </h1>
            <p className="text-rose-100 text-sm font-medium">วิทยาลัยการอาชีพพนมไพร</p>
            <div className="flex items-center gap-3 mt-2">
              <select 
                value={academicYear} 
                onChange={e => setAcademicYear(parseInt(e.target.value))}
                className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm border border-white/30 outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                {years.map(y => <option key={y} value={y} className="text-gray-800">ปีการศึกษา {y}</option>)}
              </select>
              
              {isAdmin && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${editMode ? 'bg-amber-400 text-amber-900 animate-pulse' : 'bg-white/20 text-white border border-white/30'}`}>
                  {editMode ? '✏️ กำลังแก้ไข' : '🔒 Admin Mode'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handleExportPDF}
            className="btn-header bg-white/15 hover:bg-white/25 text-white border border-white/20"
          >
            <Download size={16} /> PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="btn-header bg-emerald-500/80 hover:bg-emerald-600 text-white border border-emerald-400/30"
          >
            <FileSpreadsheet size={16} /> Excel
          </button>
          
          {isAdmin && (
            <>
              {editMode ? (
                <>
                  <button onClick={handleSave} className="btn-header bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 shadow-lg">
                    <Save size={16} /> บันทึก
                  </button>
                  <button onClick={handleClearAll} className="btn-header bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 shadow-lg">
                    <Trash2 size={16} /> เคลียร์ทั้งหมด
                  </button>
                  <button onClick={handleCopyYear} className="btn-header bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/30 shadow-lg">
                    <Copy size={16} /> คัดลอกจากปีก่อน
                  </button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} className="btn-header bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30 shadow-lg">
                  <Edit3 size={16} /> แก้ไข
                </button>
              )}
              <button onClick={() => setShowAdmin(true)} className="btn-header bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30 shadow-lg">
                <Users size={16} /> จัดการบุคลากร
              </button>
              <button onClick={() => setShowSettings(true)} className="btn-header bg-white/15 hover:bg-white/25 text-white border border-white/20">
                <Settings size={16} /> ตั้งค่า
              </button>
              <button onClick={handleLogout} className="btn-header bg-white/15 hover:bg-white/25 text-white border border-white/20">
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </>
          )}

          {!isAdmin && (
            <button onClick={() => setShowLogin(true)} className="btn-header bg-white/20 hover:bg-white/30 text-white border border-white/30">
              <Lock size={16} /> เข้าสู่ระบบ
            </button>
          )}
        </div>
      </header>

      {/* Search Bar (below header) */}
      <div className="mb-3 relative">
        <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-2.5 focus-within:ring-2 focus-within:ring-rose-400 focus-within:border-rose-400 transition-all">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setHighlightPersonId(null); }}
            placeholder="ค้นหาบุคลากร..."
            className="flex-1 bg-transparent outline-none text-sm ml-2 placeholder-gray-400"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setHighlightPersonId(null); }} className="text-gray-400 hover:text-gray-600 text-xs font-bold">✕</button>
          )}
        </div>
        {/* Search Results Dropdown */}
        {searchQuery.trim() && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border shadow-xl z-50 max-h-60 overflow-y-auto">
            {searchResults.map(p => {
              const pAssignments = assignments.filter(a => a.personnel_id === p.id);
              return (
                <button key={p.id} onClick={() => handleSearchSelect(p)}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors border-b last:border-b-0 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.main_title || 'ไม่ระบุตำแหน่ง'}</p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">{pAssignments.length} งาน</span>
                </button>
              );
            })}
          </div>
        )}
        {searchQuery.trim() && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border shadow-xl z-50 p-4 text-center text-gray-400 text-sm">
            ไม่พบบุคลากรที่ชื่อ "{searchQuery}"
          </div>
        )}
      </div>

      {/* Dashboard */}
      <DashboardStats personnel={personnel} assignments={assignments} jobs={jobs} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          <div className="w-full lg:w-80 flex flex-col transition-all duration-300 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-120px)]">
            <StaffPool 
              personnel={personnel} 
              assignments={assignments}
              onPersonClick={setSelectedPerson} 
              isAdmin={isAdmin}
              editMode={editMode}
            />
          </div>

          <div className="flex-1 glass-panel rounded-2xl p-5 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md">
            <OrgChart 
              departments={departments} 
              jobs={jobs} 
              assignments={assignments} 
              personnel={personnel}
              onPersonClick={setSelectedPerson}
              isAdmin={isAdmin}
              editMode={editMode}
              onRemoveAssignment={handleRemoveAssignment}
              highlightPersonId={highlightPersonId}
              onRefresh={fetchData}
              academicYear={academicYear}
            />
          </div>
        </div>
      </DragDropContext>

      {/* Modals */}
      {selectedPerson && (
        <PersonnelModal
          person={selectedPerson}
          assignments={assignments.filter(a => a.personnel_id === selectedPerson.id)}
          jobs={jobs}
          departments={departments}
          onClose={() => setSelectedPerson(null)}
          onRefresh={fetchData}
          isAdmin={isAdmin}
          editMode={editMode}
          academicYear={academicYear}
        />
      )}
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
      {showAdmin && <PersonnelAdminModal personnel={personnel} onClose={() => setShowAdmin(false)} onRefresh={fetchData} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      
      <PrintReport 
        personnel={personnel} jobs={jobs} departments={departments} 
        assignments={assignments} academicYear={academicYear} 
      />
    </div>
  );
}

export default App;
