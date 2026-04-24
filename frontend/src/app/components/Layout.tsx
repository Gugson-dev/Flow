import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { useTheme } from '../hooks/useTheme';

export function Layout() {
  const { theme } = useTheme();

  const getThemeStyles = () => {
    switch (theme) {
      case 'black':
        return 'bg-black text-white';
      case 'white':
        return 'bg-white text-black';
      case 'grey':
        return 'bg-zinc-900 text-white';
    }
  };

  return (
    <div className={`h-screen flex ${getThemeStyles()}`}>
      <div className="w-64 shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
