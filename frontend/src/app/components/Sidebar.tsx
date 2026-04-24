import { Link, useLocation } from 'react-router';
import { useData } from '../hooks/useData';
import {
  Calendar,
  FolderOpen,
  Settings,
  Plus,
  ChevronRight,
  ChevronDown,
  FolderInput,
} from 'lucide-react';
import { useState } from 'react';
import { AddProjectDialog } from './AddProjectDialog';
import type { Project } from '../types';

export function Sidebar() {
  const location = useLocation();
  const { projects, tasks, updateProject } = useData();
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);

  const toggleExpanded = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleMoveProject = (projectId: string, newParentId: string | null) => {
    updateProject(projectId, { parentId: newParentId });
    setShowMoveMenu(null);
  };

  const getTaskCount = (projectId: string) => {
    return tasks.filter(
      (task) => task.projectId === projectId && !task.completed
    ).length;
  };

  const getUpcomingTaskCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(
      (task) => task.date > today && !task.completed
    ).length;
  };

  // Separate root projects and sub-projects
  const rootProjects = projects.filter((p) => p.parentId === null);
  const getSubProjects = (parentId: string) => 
    projects.filter((p) => p.parentId === parentId);

  // Get valid parent options for a project (exclude itself and its descendants)
  const getValidParents = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];
    
    const descendants = new Set<string>();
    const findDescendants = (id: string) => {
      descendants.add(id);
      const children = projects.filter(p => p.parentId === id);
      children.forEach(child => findDescendants(child.id));
    };
    findDescendants(projectId);
    
    return projects.filter(p => !descendants.has(p.id) && p.id !== projectId);
  };

  const renderProject = (project: Project, level: number = 0) => {
    const subProjects = getSubProjects(project.id);
    const hasSubProjects = subProjects.length > 0;
    const isExpanded = expandedProjects.has(project.id);
    const validParents = getValidParents(project.id);

    return (
      <div key={project.id} className="group">
        <div className="flex items-center gap-1 relative">
          {hasSubProjects && (
            <button
              onClick={() => toggleExpanded(project.id)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </button>
          )}
          <Link
            to={`/project/${project.id}`}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors flex-1 ${
              location.pathname === `/project/${project.id}`
                ? 'bg-white/10'
                : 'hover:bg-white/5'
            }`}
            style={{ marginLeft: `${level * 12}px` }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-sm flex-1 truncate">{project.name}</span>
            {project.sharedWith.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                {project.sharedWith.length}
              </span>
            )}
            <span className="text-xs opacity-70">
              {getTaskCount(project.id)}
            </span>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMoveMenu(showMoveMenu === project.id ? null : project.id);
            }}
            className="p-1 rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Move project"
          >
            <FolderInput size={14} />
          </button>
          
          {showMoveMenu === project.id && (
            <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-white/10 rounded-lg shadow-xl z-50 min-w-[200px]">
              <div className="p-2 border-b border-white/10">
                <p className="text-xs font-semibold opacity-50">MOVE TO</p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <button
                  onClick={() => handleMoveProject(project.id, null)}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 transition-colors text-sm"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen size={14} />
                    <span>Root (No Parent)</span>
                  </div>
                </button>
                {validParents.map((parent) => (
                  <button
                    key={parent.id}
                    onClick={() => handleMoveProject(project.id, parent.id)}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 transition-colors text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: parent.color }}
                      />
                      <span>{parent.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-white/10">
                <button
                  onClick={() => setShowMoveMenu(null)}
                  className="w-full text-xs text-center py-1 hover:bg-white/5 rounded transition-colors opacity-70"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {hasSubProjects && isExpanded && (
          <div className="ml-2">
            {subProjects.map((subProject) => renderProject(subProject, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col border-r border-white/10">
      <div className="p-4 border-b border-white/10">
        <h1 className="text-xl font-bold">TaskFlow</h1>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-white/5'
          }`}
        >
          <Calendar size={18} />
          <span className="text-sm font-medium flex-1">Today</span>
          <span className="text-xs opacity-70">
            {tasks.filter((t) => {
              const today = new Date().toISOString().split('T')[0];
              return t.date === today && !t.completed;
            }).length}
          </span>
        </Link>

        <Link
          to="/upcoming"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/upcoming'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-white/5'
          }`}
        >
          <ChevronRight size={18} />
          <span className="text-sm font-medium flex-1">Upcoming</span>
          <span className="text-xs opacity-70">{getUpcomingTaskCount()}</span>
        </Link>

        <div className="pt-4 pb-2">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold uppercase opacity-50">
              Projects
            </h3>
            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-1">
            {rootProjects.map((project) => renderProject(project))}
          </div>
        </div>
      </nav>

      <div className="border-t border-white/10">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-6 py-3 transition-colors ${
            location.pathname === '/settings'
              ? 'bg-white/10'
              : 'hover:bg-white/5'
          }`}
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>

      <AddProjectDialog
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
      />
    </div>
  );
}