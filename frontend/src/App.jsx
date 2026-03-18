import { useState, useEffect } from 'react'
import { Amplify } from 'aws-amplify'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react' // Importamos el hook
import '@aws-amplify/ui-react/styles.css'
import './App.css'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_by4SP5FBr',
      userPoolClientId: '5o6pcpfncai0376df1ndpohhkt',
    }
  }
});

const API_BASE = "https://8iu9v78txc.execute-api.us-east-1.amazonaws.com"

function App() {
  // --- LÓGICA DE AUTENTICACIÓN ---
  // authStatus nos dice si está 'authenticated' o 'unauthenticated'
  const { user, signOut, authStatus } = useAuthenticator((context) => [context.user]);
  const [showAuth, setShowAuth] = useState(false); // Variable para mostrar/ocultar login

  // --- LÓGICA DE TAREAS (Tu código original) ---
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  async function fetchTasks() {
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/tasks`)
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Error al cargar tareas')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // ... (Aquí van tus funciones addTask, toggleCompleted, saveEdit, deleteTask que ya tienes) ...
  // No las pego todas para no saturar, pero mantén las que ya escribiste.

  return (
    <div className="app">
      {/* 1. CABECERA DINÁMICA */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Organizador Pro 2.0 🚀</h1>
        
        <div>
          {authStatus === 'authenticated' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '0.9rem' }}>Bienvenido, <strong>{user.username}</strong></span>
              <button onClick={signOut} className="btn-small danger">Salir</button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuth(!showAuth)} 
              className="btn-small primary"
            >
              {showAuth ? 'Volver a la lista' : 'Iniciar Sesión / Registrarse'}
            </button>
          )}
        </div>
      </header>

      {/* 2. VENTANA DE LOGIN (Solo se muestra si showAuth es true y no está logueado) */}
      {showAuth && authStatus !== 'authenticated' && (
        <div className="auth-container" style={{ marginBottom: '40px', padding: '20px', background: '#1e293b', borderRadius: '12px' }}>
          <Authenticator />
        </div>
      )}

      {/* 3. CONTENIDO PRINCIPAL (Siempre visible) */}
      <main style={{ opacity: showAuth && authStatus !== 'authenticated' ? 0.3 : 1 }}>
        <form className="add-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Nueva tarea..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={adding}
          />
          <button type="submit" disabled={!newTaskTitle.trim() || adding}>
            {adding ? 'Añadiendo…' : 'Añadir'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="loading">Cargando tareas…</p>
        ) : (
          <ul className="task-list">
            {tasks.length === 0 && !error && (
              <li className="empty">No hay tareas públicas.</li>
            )}
            {tasks.map((task) => (
              <li key={task.id} className={`task ${task.completed ? 'completed' : ''}`}>
                <span className="task-title">{task.title}</span>
                {/* Aquí puedes ocultar botones de editar/borrar si no está logueado si quisieras */}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

export default App