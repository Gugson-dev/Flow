
import { RouterProvider } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import { router } from './routes';
import '../styles/index.css';

function AppContent() {
  const { token, logout } = useAuth();

  if (!token) {
    return <AuthPage />;
  }

  return (
    <DataProvider key={token}>
      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          onClick={logout}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-700"
        >
          Wyloguj
        </button>
      </div>

      <RouterProvider router={router} />
    </DataProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
