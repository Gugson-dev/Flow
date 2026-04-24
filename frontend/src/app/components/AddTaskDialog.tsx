import { useState, useEffect } from 'react';
import { X, Calendar, UserPlus } from 'lucide-react';
import { useData } from '../hooks/useData';
import type { Priority, Task } from '../types';
import { getPriorityColor, getPriorityLabel } from '../utils/priority';
import { getTodayISO } from '../utils/date';
import React from 'react';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
  defaultProjectId?: string | null;
  defaultDate?: string;
}

export function AddTaskDialog({
  isOpen,
  onClose,
  editTask,
  defaultProjectId,
  defaultDate,
}: AddTaskDialogProps) {
  const { addTask, updateTask, projects } = useData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(1);
  const [date, setDate] = useState(defaultDate || getTodayISO());
  const [endDate, setEndDate] = useState<string>('');
  const [projectId, setProjectId] = useState<string | null>(
    defaultProjectId || 'inbox'
  );
  const [assignedTo, setAssignedTo] = useState<string>('');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setPriority(editTask.priority);
      setDate(editTask.date);
      setEndDate(editTask.endDate || '');
      setProjectId(editTask.projectId);
      setAssignedTo(editTask.assignedTo || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority(1);
      // Always default to today when creating a new task
      setDate(getTodayISO());
      setEndDate('');
      setProjectId(defaultProjectId || 'inbox');
      setAssignedTo('');
    }
  }, [editTask, defaultProjectId, isOpen]);

  if (!isOpen) return null;

  const selectedProject = projects.find(p => p.id === projectId);
  const projectMembers = selectedProject?.sharedWith || [];
  const hasSharedMembers = projectMembers.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editTask) {
      updateTask(editTask.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        date,
        endDate: endDate || undefined,
        projectId,
        assignedTo,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        date,
        endDate: endDate || undefined,
        projectId,
        completed: false,
        assignedTo,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-zinc-900 rounded-xl shadow-2xl border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">
            {editTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all ${
                    priority === p
                      ? 'border-current'
                      : 'border-white/10 opacity-50 hover:opacity-100'
                  }`}
                  style={{
                    color: getPriorityColor(p),
                  }}
                >
                  <div className="text-xs font-medium">P{p}</div>
                  <div className="text-[10px] opacity-70">
                    {getPriorityLabel(p)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date (optional)</label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={date}
                className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs opacity-50 mt-1">
              The deadline for this task
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project</label>
            <select
              value={projectId || 'inbox'}
              onChange={(e) =>
                setProjectId(e.target.value === 'inbox' ? 'inbox' : e.target.value)
              }
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {hasSharedMembers && (
            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <UserPlus size={14} />
                  <span>Assign to Project Member</span>
                </div>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Everyone (default)</option>
                {projectMembers.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
              <p className="text-xs opacity-50 mt-1">
                {assignedTo 
                  ? `Only ${assignedTo} will see this in their Today view`
                  : 'All project members will see this task'}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editTask ? 'Update' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}