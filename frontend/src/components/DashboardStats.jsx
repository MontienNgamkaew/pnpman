import React from 'react';
import { Users, Briefcase, AlertCircle, CheckCircle, UserX, BarChart3 } from 'lucide-react';

const DashboardStats = ({ personnel, assignments, jobs }) => {
  const totalPersonnel = personnel.length;
  const totalJobs = jobs.filter(j => j.id < 900).length;

  // People with at least 1 assignment
  const assignedPeopleIds = [...new Set(assignments.map(a => a.personnel_id))];
  const assignedCount = assignedPeopleIds.length;
  const unassignedCount = totalPersonnel - assignedCount;

  // Vacant head positions (หัวหน้างาน with 0 assignments)
  const headJobs = jobs.filter(j => j.id < 900);
  const vacantHeadCount = headJobs.filter(j => {
    const headAssignments = assignments.filter(a => a.job_id === j.id && a.role === 'หัวหน้างาน');
    return headAssignments.length === 0;
  }).length;

  // Total assignment count
  const totalAssignments = assignments.length;

  // Average assignments per person
  const avgAssignments = totalPersonnel > 0 ? (totalAssignments / totalPersonnel).toFixed(1) : 0;

  const stats = [
    { label: 'บุคลากรทั้งหมด', value: totalPersonnel, unit: 'คน', icon: Users, color: 'from-rose-700 to-red-900', bg: 'bg-rose-50', text: 'text-rose-800' },
    { label: 'ได้รับมอบหมาย', value: assignedCount, unit: 'คน', icon: CheckCircle, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { label: 'ยังไม่ได้มอบหมาย', value: unassignedCount, unit: 'คน', icon: UserX, color: unassignedCount > 0 ? 'from-amber-500 to-orange-600' : 'from-gray-400 to-gray-500', bg: unassignedCount > 0 ? 'bg-amber-50' : 'bg-gray-50', text: unassignedCount > 0 ? 'text-amber-700' : 'text-gray-500' },
    { label: 'ตำแหน่งว่าง (หน.)', value: vacantHeadCount, unit: `/${totalJobs}`, icon: AlertCircle, color: vacantHeadCount > 0 ? 'from-red-500 to-rose-600' : 'from-gray-400 to-gray-500', bg: vacantHeadCount > 0 ? 'bg-red-50' : 'bg-gray-50', text: vacantHeadCount > 0 ? 'text-red-700' : 'text-gray-500' },
    { label: 'งาน/คน (เฉลี่ย)', value: avgAssignments, unit: 'งาน', icon: BarChart3, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700' },
    { label: 'ตำแหน่งทั้งหมด', value: totalAssignments, unit: 'ตำแหน่ง', icon: Briefcase, color: 'from-cyan-500 to-teal-600', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {stats.map((s, i) => (
        <div key={i} className={`${s.bg} rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all group`}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`bg-gradient-to-br ${s.color} p-1.5 rounded-lg shadow-sm`}>
              <s.icon size={14} className="text-white" />
            </div>
            <span className="text-[11px] text-gray-500 font-medium leading-tight">{s.label}</span>
          </div>
          <div className={`text-2xl font-black ${s.text} leading-none`}>
            {s.value}<span className="text-xs font-bold opacity-60 ml-0.5">{s.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
