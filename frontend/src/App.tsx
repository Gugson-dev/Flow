// :contentReference[oaicite:1]{index=1} App.tsx
import { useEffect, useState } from "react";
import "./App.css";

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
  // Deletes a task by its id, handles errors, and reloads the task list after deletion.
  async function deleteTask(id: string) {
    setError(null);
    // Optimistically update UI
    const prevTasks = tasks;
    setTasks(tasks.filter((task) => task.id !== id));
    try {
      const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // No need to reload tasks here
    } catch (err: unknown) {
      console.error("deleteTask error:", err);

      // Rollback optimistic update
      setTasks(prevTasks);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Network error");
      }
      // Optionally reload from backend to ensure consistency
      await loadTasks();
    }
  }
  async function completeTask(id: string) {
    setError(null);
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    // Optimistically update UI
    const prevTasks = tasks;
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
    try {
      const res = await fetch(`http://localhost:3000/tasks/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !task.completed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // No need to reload tasks here
    } catch (err: unknown) {
      console.error("completeTask error:", err);

      // Rollback optimistic update
      setTasks(prevTasks);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Network error");
      }
      // Optionally reload from backend to ensure consistency
      await loadTasks();
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Flow</h1>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={addTask} style={{ marginLeft: 8 }}>
          Dodaj
        </button>
      </div>

      {loading && <p>Ładowanie…</p>}
      {error && <p style={{ color: "red" }}>Błąd: {error}</p>}
<div style={{ marginTop: 20 }}> 
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <button onClick={() => completeTask(task.id)} style={{ marginRight: 8, background: task.completed ? "green" : "red" }}>
              {task.completed ? "v" : "o"}
            </button>
            <span>{task.completed ? <s>{task.content}</s> : task.content}</span>
            
            <button style={{ marginLeft: 8, position: "relative" }} onClick={() => deleteTask(task.id)}>
              Usuń
            </button>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}