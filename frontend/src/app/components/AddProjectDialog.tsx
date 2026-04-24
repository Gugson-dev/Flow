import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useData } from '../hooks/useData';
import type { Project, ProjectTheme } from '../types';
import React from 'react';


interface AddProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editProject?: Project | null;
}

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6',
  '#ef4444', '#10b981', '#3b82f6', '#f97316', '#06b6d4',
];

const PROJECT_THEMES: { value: ProjectTheme; label: string; description: string; color: string }[] = [
  { value: 'dark', label: 'Dark', description: 'Black background', color: '#000000' },
  { value: 'minimalist', label: 'Minimalist', description: 'White background', color: '#ffffff' },
  { value: 'normal', label: 'Normal', description: 'Grey background', color: '#18181b' },
  { value: 'colorful', label: 'Colorful', description: 'Custom color', color: 'gradient' },
];

export function AddProjectDialog({ isOpen, onClose, editProject }: AddProjectDialogProps) {
  const { addProject, updateProject, projects } = useData();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [theme, setTheme] = useState<ProjectTheme>('dark');
  const [customColor, setCustomColor] = useState('#6366f1');
  const [parentId, setParentId] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (editProject) {
      setName(editProject.name);
      setColor(editProject.color);
      setTheme(editProject.theme);
      setCustomColor(editProject.customColor || '#6366f1');
      setParentId(editProject.parentId);
      setSharedWith(editProject.sharedWith);
    } else {
      setName('');
      setColor(PRESET_COLORS[0]);
      setTheme('dark');
      setCustomColor('#6366f1');
      setParentId(null);
      setSharedWith([]);
    }
    setEmailInput('');
  }, [editProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editProject) {
      updateProject(editProject.id, {
        name: name.trim(),
        color,
        theme,
        customColor: theme === 'colorful' ? customColor : undefined,
        parentId,
        sharedWith,
      });
    } else {
      addProject({
        name: name.trim(),
        color,
        theme,
        customColor: theme === 'colorful' ? customColor : undefined,
        parentId,
        sharedWith,
      });
    }

    onClose();
  };

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && email.includes('@') && !sharedWith.includes(email)) {
      setSharedWith([...sharedWith, email]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setSharedWith(sharedWith.filter((e) => e !== email));
  };

  // Get available parent projects (exclude the current project if editing and its children)
  const availableParents = projects.filter((p) => {
    if (editProject && p.id === editProject.id) return false;
    if (editProject && p.parentId === editProject.id) return false;
    return p.parentId === null; // Only show root projects as potential parents
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-zinc-900 rounded-xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-zinc-900">
          <h2 className="text-lg font-semibold">
            {editProject ? 'Edit Project' : 'New Project'}
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
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    color === presetColor
                      ? 'border-white scale-110'
                      : 'border-white/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-white/20 cursor-pointer"
                title="Custom color"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Theme Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    theme === t.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{t.description}</div>
                </button>
              ))}
            </div>
            {theme === 'colorful' && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg">
                <label className="block text-sm font-medium mb-2">
                  Custom Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer"
                  />
                  <div className="flex-1 flex items-center">
                    <span className="text-sm opacity-70">{customColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Parent Project (Optional)
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None (Root Project)</option>
              {availableParents.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <p className="text-xs opacity-50 mt-1">
              Create a sub-project by selecting a parent project
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Share with Users
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                placeholder="user@example.com"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            {sharedWith.length > 0 && (
              <div className="mt-2 space-y-1">
                {sharedWith.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg"
                  >
                    <span className="text-sm">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="p-1 rounded hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs opacity-50 mt-1">
              Add email addresses to share this project
            </p>
          </div>

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
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editProject ? 'Update' : 'Create'} Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}