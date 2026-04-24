import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import type { Theme } from '../types';
import { Palette, Check, X, User, Upload, Download, Database } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useRef, useState } from 'react';
import React from 'react';

export function SettingsPage() {
  const { theme, setTheme, userEmail, setUserEmail } = useTheme();
  const { importData, exportData } = useData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  const themes: { value: Theme; label: string; preview: string }[] = [
    { value: 'black', label: 'Black', preview: '#000000' },
    { value: 'grey', label: 'Grey', preview: '#18181b' },
    { value: 'white', label: 'White', preview: '#ffffff' },
  ];

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setImportStatus('Data exported successfully!');
    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.tasks && !data.projects) {
          setImportStatus('Invalid file format. Please upload a valid TaskFlow data file.');
          setTimeout(() => setImportStatus(''), 4000);
          return;
        }

        importData(data);
        setImportStatus(`Successfully imported ${data.tasks?.length || 0} tasks and ${data.projects?.length || 0} projects!`);
        setTimeout(() => setImportStatus(''), 4000);
      } catch (error) {
        setImportStatus('Error importing data. Please check your file format.' + (error instanceof Error ? ` (${error.message})` : ''));
        setTimeout(() => setImportStatus(''), 4000);
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm opacity-70 mt-1">Customize your experience</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User size={18} />
              <h2 className="font-semibold">User Profile</h2>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Set your email to assign tasks and share projects
            </p>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={18} />
              <h2 className="font-semibold">Theme</h2>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Choose your preferred color scheme
            </p>

            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    theme === t.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: t.preview }}
                    />
                    <span className="text-sm font-medium">{t.label}</span>
                  </div>
                  {theme === t.value && (
                    <div className="absolute top-2 right-2">
                      <Check size={16} className="text-blue-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} />
              <h2 className="font-semibold">Data Management</h2>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Share your data between devices or migrate from another app
            </p>

            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                <span>Export All Data</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                <span>Import Data from File</span>
              </button>

              {importStatus && (
                <div className={`p-3 rounded-lg text-sm ${
                  importStatus.includes('Error') || importStatus.includes('Invalid')
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {importStatus}
                </div>
              )}

              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs opacity-70">
                  <strong>How to use:</strong><br />
                  • Export your data to create a backup JSON file<br />
                  • Import data from another device or app<br />
                  • Data includes all tasks, projects, and settings<br />
                  • Importing will merge with existing data
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h2 className="font-semibold mb-2">About</h2>
            <p className="text-sm opacity-70">
              TaskFlow - An ambitious productivity app
            </p>
            <p className="text-xs opacity-50 mt-2">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}