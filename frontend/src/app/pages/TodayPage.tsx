import { useState } from 'react';
import { useData } from '../hooks/useData';
import { useTheme } from '../hooks/useTheme';
import { TaskItem } from '../components/TaskItem';
import { AddTaskDialog } from '../components/AddTaskDialog';
import { Plus, CheckCircle, Sparkles } from 'lucide-react';
import { getTodayISO } from '../utils/date';
import type { Task } from '../types';

export function TodayPage() {
  const { tasks } = useData();
  const { userEmail } = useTheme();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const today = getTodayISO();
  const todayTasks = tasks.filter((task) => {
    // Filter tasks for today
    if (task.date !== today) return false;
    
    // If task is not assigned to anyone, show it to everyone
    if (!task.assignedTo) return true;
    
    // If task is assigned to someone, only show it if it's assigned to the current user
    return task.assignedTo === userEmail;
  });
  const incompleteTasks = todayTasks.filter((task) => !task.completed);
  const completedTasks = todayTasks.filter((task) => task.completed);

  // Check if all tasks are completed
  const allTasksCompleted = todayTasks.length > 0 && incompleteTasks.length === 0;

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditTask(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Today</h1>
            <p className="text-sm opacity-70 mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span className="font-medium">Add Task</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <CheckCircle size={48} className="mb-4" />
            <p className="text-lg">No tasks for today</p>
            <p className="text-sm mt-2">
              Click "Add Task" to create your first task
            </p>
          </div>
        ) : allTasksCompleted ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles size={64} className="mb-4 text-yellow-400 animate-pulse" />
            <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
            <p className="text-xl opacity-70">You can rest now ❤️</p>
            <p className="text-sm opacity-50 mt-4">
              All tasks for today are completed
            </p>
          </div>
        ) : (
          <div className="max-w-3xl space-y-6">
            {incompleteTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase opacity-50 mb-3">
                  To Do ({incompleteTasks.length})
                </h2>
                <div className="space-y-1">
                  {incompleteTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={handleEdit} />
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase opacity-50 mb-3">
                  Completed ({completedTasks.length})
                </h2>
                <div className="space-y-1">
                  {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={handleEdit} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AddTaskDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseDialog}
        editTask={editTask}
        defaultDate={today}
      />
    </div>
  );
}