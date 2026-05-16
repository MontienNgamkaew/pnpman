import React from 'react';

const PrintReport = ({ personnel, jobs, departments, assignments, academicYear }) => {
  // Group assignments for the report
  // We want a list of departments -> jobs -> personnel
  const reportData = departments.map(dept => {
    const deptJobs = jobs.filter(j => j.department_id === dept.id);
    const jobsWithStaff = deptJobs.map(job => {
      const jobAssignments = assignments.filter(a => a.job_id === job.id);
      
      const head = jobAssignments.find(a => ['หัวหน้างาน', 'หัวหน้าแผนกวิชา'].includes(a.role));
      const assistants = jobAssignments.filter(a => a.role === 'ผู้ช่วยหัวหน้างาน');
      const staff = jobAssignments.filter(a => a.role === 'เจ้าหน้าที่งาน');

      const getPersonName = (id) => personnel.find(p => p.id === id)?.name || '-';

      return {
        jobName: job.name,
        head: head ? getPersonName(head.personnel_id) : '-',
        assistants: assistants.length > 0 ? assistants.map(a => getPersonName(a.personnel_id)).join(', ') : '-',
        staff: staff.length > 0 ? staff.map(a => getPersonName(a.personnel_id)).join(', ') : '-'
      };
    });
    return {
      deptName: dept.name,
      jobs: jobsWithStaff
    };
  });

  // Handle Executives
  const execJobs = jobs.filter(j => j.id >= 900);
  const execAssignments = execJobs.map(job => {
    const jobAssignments = assignments.filter(a => a.job_id === job.id);
    const getPersonName = (id) => personnel.find(p => p.id === id)?.name || '-';
    return {
      jobName: job.name,
      person: jobAssignments.length > 0 ? jobAssignments.map(a => getPersonName(a.personnel_id)).join(', ') : '-'
    };
  });

  return (
    <div id="printable-report" className="hidden print:block absolute top-0 left-0 w-full bg-white text-black p-8 text-sm font-sans">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">สรุปรายงานการมอบหมายการปฏิบัติงาน</h1>
        <h2 className="text-xl">วิทยาลัยการอาชีพพนมไพร ปีการศึกษา {academicYear}</h2>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-3 border-b-2 border-black pb-1">ผู้บริหารสถานศึกษา</h3>
        <table className="w-full border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left w-1/2">ตำแหน่ง</th>
              <th className="border border-gray-300 p-2 text-left w-1/2">ชื่อ-นามสกุล</th>
            </tr>
          </thead>
          <tbody>
            {execAssignments.map((exec, idx) => (
              <tr key={idx}>
                <td className="border border-gray-300 p-2 font-medium">{exec.jobName}</td>
                <td className="border border-gray-300 p-2">{exec.person}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reportData.map((dept, idx) => (
        <div key={idx} className="mb-6 avoid-page-break">
          <h3 className="text-lg font-bold mb-3 border-b-2 border-black pb-1">{dept.deptName}</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-1/4">งาน / แผนก</th>
                <th className="border border-gray-300 p-2 text-left w-1/4">หัวหน้างาน</th>
                <th className="border border-gray-300 p-2 text-left w-1/4">ผู้ช่วยหัวหน้างาน</th>
                <th className="border border-gray-300 p-2 text-left w-1/4">เจ้าหน้าที่งาน</th>
              </tr>
            </thead>
            <tbody>
              {dept.jobs.map((job, jIdx) => (
                <tr key={jIdx}>
                  <td className="border border-gray-300 p-2 font-medium">{job.jobName}</td>
                  <td className="border border-gray-300 p-2">{job.head}</td>
                  <td className="border border-gray-300 p-2">{job.assistants}</td>
                  <td className="border border-gray-300 p-2">{job.staff}</td>
                </tr>
              ))}
              {dept.jobs.length === 0 && (
                <tr>
                  <td colSpan="4" className="border border-gray-300 p-2 text-center text-gray-500">ไม่มีข้อมูลงานในฝ่ายนี้</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
      
      <div className="mt-12 text-right text-xs text-gray-500">
        พิมพ์เมื่อ: {new Date().toLocaleString('th-TH')}
      </div>
    </div>
  );
};

export default PrintReport;
