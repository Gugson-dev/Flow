export type Priority = 1 | 2 | 3 | 4;

export type Theme = 'black' | 'white' | 'grey';

export type ProjectTheme = 'dark' | 'minimalist' | 'normal' | 'colorful';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  date: string; // ISO date string (start date)
  endDate?: string; // ISO date string (due date/deadline)
  completed: boolean;
  projectId: string | null;
  assignedTo?: string; // Email of person assigned to this task
}

export interface Project {
  id: string;
  name: string;
  color: string;
  theme: ProjectTheme;
  customColor?: string; // For colorful theme
  parentId: string | null;
  sharedWith: string[]; // Array of email addresses
}