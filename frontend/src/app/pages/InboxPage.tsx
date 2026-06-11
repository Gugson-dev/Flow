import { useState } from 'react';
import { useData } from '../hooks/useData';
import { TaskItem } from '../components/TaskItem';
import { AddTaskDialog } from '../components/AddTaskDialog';
import { Plus, FolderOpen } from 'lucide-react';
import type { Task } from '../types';

export function InboxPage() {
  const { tasks, projects } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const inboxProject = projects.find((p) => p.isSystem && p.name === 'Inbox');
  const projectTasks = tasks
    .filter((task) => task.projectId === inboxProject?.id)
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return a.date.localeCompare(b.date);
    });

  const incompleteTasks = projectTasks.filter((task) => !task.completed);
  const completedTasks = projectTasks.filter((task) => task.completed);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditTask(null);
  };

  if (!inboxProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg opacity-50">Inbox project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{inboxProject.name}</h1>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm opacity-70">
                  {incompleteTasks.length} active task
                  {incompleteTasks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus size={18} />
              <span className="font-medium">Add Task</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {projectTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <FolderOpen size={48} className="mb-4" />
            <p className="text-lg">No tasks in this project</p>
            <p className="text-sm mt-2">
              Click "Add Task" to create your first task
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
        defaultProjectId={inboxProject?.id || null}
      />
    </div>
  );
}