import type { Task } from '../types';
import { useData } from '../hooks/useData';
import { getPriorityColor } from '../utils/priority';
import { CheckCircle2, Circle, Trash2, Edit2, ChevronDown, ChevronRight, Calendar, Clock, User } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '../utils/date';

interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { updateTask, deleteTask, projects } = useData();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColor = getPriorityColor(task.priority);
  const project = projects.find(p => p.id === task.projectId);

  const handleToggleComplete = () => {
    updateTask(task.id, { completed: !task.completed });
  };

  return (
    <div
      className="group rounded-lg transition-all hover:bg-white/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={handleToggleComplete}
          className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
        >
          {task.completed ? (
            <CheckCircle2 size={20} style={{ color: priorityColor }} />
          ) : (
            <Circle size={20} style={{ color: priorityColor }} />
          )}
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm font-medium ${
                task.completed ? 'line-through opacity-50' : ''
              }`}
            >
              {task.title}
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${priorityColor}20`,
                color: priorityColor,
              }}
            >
              P{task.priority}
            </span>
            {project && (
              <span 
                className="text-xs opacity-70 ml-auto"
                style={{ color: project.color }}
              >
                #{project.name.toLowerCase().replace(/\s+/g, '')}
              </span>
            )}
            {isExpanded ? (
              <ChevronDown size={16} className="opacity-50" />
            ) : (
              <ChevronRight size={16} className="opacity-50" />
            )}
          </div>
        </button>

        {isHovered && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <Edit2 size={14} />
              </button>
            )}
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pl-12 space-y-2 text-sm">
          {task.description && (
            <div>
              <p className="text-xs font-semibold opacity-50 mb-1">DESCRIPTION</p>
              <p className="opacity-70">{task.description}</p>
            </div>
          )}
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 opacity-70">
              <Calendar size={14} />
              <span className="text-xs">Start: {formatDate(task.date)}</span>
            </div>

            {task.endDate && (
              <div className="flex items-center gap-2 opacity-70">
                <Clock size={14} />
                <span className="text-xs">Due: {formatDate(task.endDate)}</span>
              </div>
            )}

            {project && (
              <div className="flex items-center gap-2 opacity-70">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-xs">{project.name}</span>
              </div>
            )}

            {task.assignedTo && (
              <div className="flex items-center gap-2 opacity-70">
                <User size={14} />
                <span className="text-xs">Assigned to: {task.assignedTo}</span>
              </div>
            )}
          </div>

          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              Edit Task →
            </button>
          )}
        </div>
      )}
    </div>
  );
}