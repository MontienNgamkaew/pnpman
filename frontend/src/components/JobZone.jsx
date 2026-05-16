import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { User, X } from 'lucide-react';

export const RoleZone = ({ job, roleName, limit, assignments, personnel, onPersonClick, isAdmin, editMode, onRemoveAssignment, highlightPersonId }) => {
  const roleAssignments = assignments.filter(a => a.job_id === job.id && a.role === roleName);
  const droppableId = `job|${job.id}|${roleName}`;
  const isFull = limit !== null && roleAssignments.length >= limit;

  // Color mapping for roles
  const roleColors = {
    'หัวหน้างาน': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'ผู้ช่วยหัวหน้างาน': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
    'เจ้าหน้าที่งาน': { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', dot: 'bg-fuchsia-500' },
    'ผู้อำนวยการวิทยาลัย': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    'รองผู้อำนวยการฝ่าย': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    'หัวหน้าแผนกวิชา': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  };

  const colors = roleColors[roleName] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-500' };

  return (
    <div className="mb-2 last:mb-0">
      <div className="flex justify-between items-center mb-1.5 px-1">
        <span className={`text-xs font-semibold ${colors.text} flex items-center gap-1.5`}>
          <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
          {roleName}
        </span>
        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
          {limit ? `${roleAssignments.length}/${limit}` : `${roleAssignments.length}/∞`}
        </span>
      </div>
      <Droppable droppableId={droppableId} isDropDisabled={isFull || !isAdmin || !editMode}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[44px] rounded-lg border-2 border-dashed p-1.5 flex flex-col gap-1.5 transition-all duration-300
              ${snapshot.isDraggingOver && !isFull && editMode ? `${colors.bg} ${colors.border} shadow-inner` : 'bg-gray-50/50 border-gray-200'}
              ${isFull ? 'opacity-60' : ''}`}
          >
            {roleAssignments.map((assignment, index) => {
              const person = personnel.find(p => p.id === assignment.personnel_id);
              if (!person) return null;
              return (
                <Draggable key={`assignment-${assignment.id}`} draggableId={`assignment-${assignment.id}`} index={index} isDragDisabled={true}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => onPersonClick(person)}
                      className={`flex items-center gap-2 ${colors.bg} border ${colors.border} rounded-lg px-2.5 py-2 cursor-pointer hover:shadow-sm shadow-sm transition-all group
                        ${highlightPersonId === person.id ? 'ring-3 ring-amber-400 shadow-lg shadow-amber-200 animate-pulse scale-[1.02]' : ''}`}
                    >
                      <User size={14} className={`${colors.text} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold ${colors.text} truncate block`}>{person.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium truncate block">{(person.main_title || '').trim() || 'ไม่ระบุ'}</span>
                      </div>
                      {isAdmin && editMode && onRemoveAssignment && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveAssignment(assignment.personnel_id, assignment.job_id, assignment.role); }}
                          className="opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded-md transition-all shrink-0"
                          title="ลบออก"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {roleAssignments.length === 0 && editMode && (
              <div className="h-full flex items-center justify-center min-h-[28px]">
                <span className="text-[10px] text-gray-400 font-medium italic">ลากวางที่นี่</span>
              </div>
            )}
            {roleAssignments.length === 0 && !editMode && (
              <div className="h-full flex items-center justify-center min-h-[28px]">
                <span className="text-[10px] text-gray-300 font-medium">- ว่าง -</span>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const JobZone = ({ job, assignments, personnel, onPersonClick, isAdmin, editMode, onRemoveAssignment, highlightPersonId }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-rose-100">
      <div className="bg-gradient-to-r from-rose-50 to-white px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-sm">{job.name}</h3>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-4">
        <RoleZone job={job} roleName="หัวหน้างาน" limit={1} assignments={assignments} personnel={personnel} onPersonClick={onPersonClick} isAdmin={isAdmin} editMode={editMode} onRemoveAssignment={onRemoveAssignment} highlightPersonId={highlightPersonId} />
        <RoleZone job={job} roleName="ผู้ช่วยหัวหน้างาน" limit={null} assignments={assignments} personnel={personnel} onPersonClick={onPersonClick} isAdmin={isAdmin} editMode={editMode} onRemoveAssignment={onRemoveAssignment} highlightPersonId={highlightPersonId} />
        <RoleZone job={job} roleName="เจ้าหน้าที่งาน" limit={2} assignments={assignments} personnel={personnel} onPersonClick={onPersonClick} isAdmin={isAdmin} editMode={editMode} onRemoveAssignment={onRemoveAssignment} highlightPersonId={highlightPersonId} />
      </div>
    </div>
  );
};

export default JobZone;
