import type { Priority } from '../types';

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 1:
      return '#9ca3af'; // grey
    case 2:
      return '#3b82f6'; // yellow
    case 3:
      return '#fbbf24'; // red
    case 4:
      return '#ef4444'; // blue
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 1:
      return 'Low';
    case 2:
      return 'Medium';
    case 3:
      return 'High';
    case 4:
      return 'Urgent';
  }
}
