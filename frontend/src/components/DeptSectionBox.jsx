import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { User, X } from 'lucide-react';

const SectionRow = ({ job, assignments, personnel, onPersonClick, isAdmin, editMode, onRemoveAssignment, highlightPersonId }) => {
  const droppableId = `job|${job.id}|หัวหน้าแผนกวิชา`;
  const assigned = assignments.filter(a => a.job_id === job.id);
  const isFull = assigned.length >= 1;

  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-b-0">
      <div className="w-48 shrink-0 text-sm font-medium text-gray-700">{job.name}</div>
      <Droppable droppableId={droppableId} isDropDisabled={isFull || !isAdmin || !editMode}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[36px] rounded-lg border px-2 py-1 flex items-center gap-2 transition-colors
              ${snapshot.isDraggingOver && !isFull && editMode ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50 border-gray-200'}
              ${isFull ? 'opacity-70' : ''}`}
          >
            {assigned.map((assignment, index) => {
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
                      className={`flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-emerald-100 shadow-sm group
                        ${highlightPersonId === person.id ? 'ring-3 ring-amber-400 shadow-lg shadow-amber-200 animate-pulse scale-[1.02]' : ''}`}
                    >
                      <User size={12} className="text-emerald-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-emerald-700 truncate block max-w-[140px]">{person.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium truncate block">{(person.main_title || '').trim() || 'ไม่ระบุ'}</span>
                      </div>
                      {isAdmin && editMode && onRemoveAssignment && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveAssignment(assignment.personnel_id, assignment.job_id, assignment.role); }}
                          className="opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-200 text-red-600 p-0.5 rounded transition-all shrink-0 ml-1"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {assigned.length === 0 && editMode && (
              <span className="text-xs text-gray-400 italic">ลากบุคลากรมาวางที่นี่</span>
            )}
            {assigned.length === 0 && !editMode && (
              <span className="text-xs text-gray-300">- ว่าง -</span>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <span className="text-[10px] text-gray-400 w-8 text-right shrink-0">{assigned.length}/1</span>
    </div>
  );
};

const DeptSectionBox = ({ jobs, assignments, personnel, onPersonClick, isAdmin, editMode, onRemoveAssignment, highlightPersonId }) => {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 col-span-full hover:shadow-md transition-shadow">
      <h3 className="font-bold text-gray-800 text-sm mb-3 pb-2 border-b flex items-center gap-2">
        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">แผนกวิชา</span>
        หัวหน้าแผนกวิชาทั้งหมด
      </h3>
      <div className="flex items-center gap-3 mb-2 px-0">
        <div className="w-48 shrink-0 text-xs font-semibold text-gray-500">แผนกวิชา</div>
        <div className="flex-1 text-xs font-semibold text-gray-500">หัวหน้าแผนกวิชา</div>
      </div>
      {jobs.map(job => (
        <SectionRow
          key={job.id} job={job}
          assignments={assignments.filter(a => a.job_id === job.id)}
          personnel={personnel} onPersonClick={onPersonClick}
          isAdmin={isAdmin} editMode={editMode} onRemoveAssignment={onRemoveAssignment}
          highlightPersonId={highlightPersonId}
        />
      ))}
    </div>
  );
};

export default DeptSectionBox;
