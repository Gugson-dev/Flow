
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('Podane hasła nie są identyczne');
      return;
    }

    if (isRegister && password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków');
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('401') || message.includes('Nieprawidłowy')) {
        setError('Nieprawidłowy e-mail lub hasło');
      } else if (message.includes('409') || message.includes('już istnieje')) {
        setError('Konto o tym adresie e-mail już istnieje');
      } else {
        setError('Nie udało się wykonać operacji. Spróbuj ponownie.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600">Flow</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Zarządzaj zadaniami i projektami
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
          {isRegister ? 'Utwórz konto' : 'Zaloguj się'}
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              E-mail
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Hasło
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2"
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="auth-confirm" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                Powtórz hasło
              </label>
              <input
                id="auth-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3"
          >
            {loading
              ? 'Przetwarzanie...'
              : isRegister ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {isRegister ? 'Masz już konto?' : 'Nie masz jeszcze konta?'}{' '}
          <button
            type="button"
            className="text-indigo-600 font-semibold hover:underline"
            onClick={() => {
              setMode(isRegister ? 'login' : 'register');
              setError('');
              setConfirmPassword('');
            }}
          >
            {isRegister ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>
        </div>
      </div>
    </main>
  );
}
