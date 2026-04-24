import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useData } from '../hooks/useData';
import { TaskItem } from '../components/TaskItem';
import { AddTaskDialog } from '../components/AddTaskDialog';
import { AddProjectDialog } from '../components/AddProjectDialog';
import { Plus, Trash2, FolderOpen, Settings2, Users } from 'lucide-react';
import type { Task } from '../types';

export function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { tasks, projects, deleteProject } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks
    .filter((task) => task.projectId === projectId)
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

  const handleDeleteProject = () => {
    if (confirm(`Delete project "${project?.name}"? All tasks will be removed.`)) {
      deleteProject(projectId!);
      navigate('/');
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg opacity-50">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                {project.sharedWith.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                    <Users size={12} />
                    <span>{project.sharedWith.length}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm opacity-70">
                  {incompleteTasks.length} active task
                  {incompleteTasks.length !== 1 ? 's' : ''}
                </p>
                <span className="text-xs opacity-50">•</span>
                <p className="text-sm opacity-70 capitalize">
                  {project.theme} theme
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditProjectOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings2 size={16} />
            </button>
            {projectId !== 'inbox' && (
              <button
                onClick={handleDeleteProject}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus size={18} />
              <span className="font-medium">Add Task</span>
            </button>
          </div>
        </div>

        {project.sharedWith.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs font-medium opacity-50 mb-2">SHARED WITH:</p>
            <div className="flex flex-wrap gap-2">
              {project.sharedWith.map((email) => (
                <div
                  key={email}
                  className="text-xs px-2 py-1 bg-white/5 rounded"
                >
                  {email}
                </div>
              ))}
            </div>
          </div>
        )}
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
        defaultProjectId={projectId || null}
      />

      <AddProjectDialog
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        editProject={project}
      />
    </div>
  );
}