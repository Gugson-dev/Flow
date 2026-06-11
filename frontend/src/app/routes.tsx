import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { TodayPage } from './pages/TodayPage';
import { UpcomingPage } from './pages/UpcomingPage';
import { ProjectPage } from './pages/ProjectPage';
import { SettingsPage } from './pages/SettingsPage';
import { InboxPage } from './pages/InboxPage';


export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: TodayPage },
      { path: 'inbox', Component: InboxPage },
      { path: 'upcoming', Component: UpcomingPage },
      { path: 'project/:projectId', Component: ProjectPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
]);
