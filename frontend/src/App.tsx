// :contentReference[oaicite:1]{index=1} App.tsx
import { useEffect, useState } from "react";

type Task = {
  id: string
  content: string
  completed: boolean
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/tasks");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // upewnij się, że data to tablica
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        // gdy backend zwraca single object albo wrapper
        console.warn("Unexpected tasks response, expected array:", data);
        setTasks(Array.isArray(data.items) ? data.items : []);
      }
    } catch (err: unknown) {
        console.error("loadTasks error:", err)

        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Network error")
        }

    } finally {
        setLoading(false)
      }
  }
  async function addTask() {
    if (!text.trim()) return;
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setText("");
      await loadTasks(); // odśwież listę po dodaniu
    } catch (err: unknown) {
      console.error("addTask error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Network error");
      }
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Flow</h1>

      <div>
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={addTask} style={{ marginLeft: 8 }}>
          Dodaj
        </button>
      </div>

      {loading && <p>Ładowanie…</p>}
      {error && <p style={{ color: "red" }}>Błąd: {error}</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.content}</li>
        ))}
      </ul>
    </div>
  );
}