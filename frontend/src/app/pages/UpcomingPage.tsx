import { useState } from 'react';
import { useData } from '../hooks/useData';
import { TaskItem } from '../components/TaskItem';
import { AddTaskDialog } from '../components/AddTaskDialog';
import { Plus, Calendar as CalendarIcon, List, Grid3x3 } from 'lucide-react';
import { formatDate, getTodayISO } from '../utils/date';
import type { Task } from '../types';
import { getPriorityColor } from '../utils/priority';

export function UpcomingPage() {
  const { tasks } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

  const today = getTodayISO();
  const upcomingTasks = tasks
    .filter((task) => task.date > today)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group tasks by date
  const tasksByDate = upcomingTasks.reduce((acc, task) => {
    if (!acc[task.date]) {
      acc[task.date] = [];
    }
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditTask(null);
  };

  // Calendar view logic
  const generateCalendarMonths = () => {
    const months: { name: string; year: number; days: (Date | null)[] }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 16; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      // Get first day of month and how many days in month
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Create array with null for empty cells, then actual dates
      const days: (Date | null)[] = [];
      
      // Add empty cells for days before month starts
      for (let j = 0; j < firstDay; j++) {
        days.push(null);
      }
      
      // Add actual days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }
      
      months.push({ name: monthName, year, days });
    }
    
    return months;
  };

  const calendarMonths = generateCalendarMonths();

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasksByDate[dateStr] || [];
  };

  const getDayOfWeek = (index: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Upcoming</h1>
            <p className="text-sm opacity-70 mt-1">
              {upcomingTasks.length} task{upcomingTasks.length !== 1 ? 's' : ''}{' '}
              scheduled
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-white/5'
                }`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'calendar' ? 'bg-blue-600' : 'hover:bg-white/5'
                }`}
              >
                <Grid3x3 size={18} />
              </button>
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
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {Object.keys(tasksByDate).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <CalendarIcon size={48} className="mb-4" />
            <p className="text-lg">No upcoming tasks</p>
            <p className="text-sm mt-2">
              Schedule tasks for future dates to see them here
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="max-w-3xl space-y-6">
            {Object.entries(tasksByDate).map(([date, dateTasks]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-semibold uppercase opacity-50">
                    {formatDate(date)}
                  </h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="space-y-1">
                  {dateTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={handleEdit} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {calendarMonths.map((month, monthIndex) => (
              <div key={monthIndex} className="mb-4">
                <div className="text-xl font-bold mb-2">{month.name}</div>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold opacity-50 pb-2">
                      {getDayOfWeek(day)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {month.days.map((day, index) => {
                    if (day === null) {
                      return (
                        <div key={index} className="min-h-[100px] p-2 rounded-lg border transition-colors border-white/10 hover:bg-white/5">
                          <div className="text-sm mb-1"></div>
                          <div className="space-y-1"></div>
                        </div>
                      );
                    }
                    
                    const dayTasks = getTasksForDate(day);
                    const isToday = day.toISOString().split('T')[0] === getTodayISO();
                    const isPast = day < new Date(getTodayISO());
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] p-2 rounded-lg border transition-colors ${
                          isToday
                            ? 'border-blue-500 bg-blue-500/10'
                            : isPast
                            ? 'border-white/5 bg-white/5 opacity-50'
                            : 'border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <div className={`text-sm mb-1 ${isToday ? 'font-bold text-blue-500' : ''}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.slice(0, 3).map((task) => (
                            <button
                              key={task.id}
                              onClick={() => handleEdit(task)}
                              className="w-full text-left text-xs p-1 rounded hover:bg-white/10 truncate transition-colors"
                              style={{
                                borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                              }}
                            >
                              {task.title}
                            </button>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-xs opacity-50 pl-1">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddTaskDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseDialog}
        editTask={editTask}
      />
    </div>
  );
}