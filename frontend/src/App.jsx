import { useState, useEffect } from 'react'
// 1. Importaciones de AWS Amplify UI
import { Amplify } from 'aws-amplify'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import './App.css'

// 2. Configuración con tus IDs correctos de Terraform (NO TOCAR)
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_by4SP5FBr',
      userPoolClientId: '5o6pcpfncai0376df1ndpohhkt',
    }
  }
});

// Tu URL real de API Gateway
const API_BASE = "https://8iu9v78txc.execute-api.us-east-1.amazonaws.com"

function App() {
  // --- A. LÓGICA DE AUTENTICACIÓN DINÁMICA ---
  // Obtenemos authStatus ('authenticated'/'unauthenticated'), user, y signOut
  const { user, signOut, authStatus } = useAuthenticator((context) => [context.user]);
  // Estado local para mostrar/ocultar la sección de login
  const [showLoginSection, setShowLoginSection] = useState(false); 

  // --- B. LÓGICA DE TAREAS (Tus funciones originales intactas) ---
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

  async function addTask(e) {
    e.preventDefault()
    const title = newTaskTitle.trim()
    if (!title || adding) return
    setAdding(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error(res.statusText)
      setNewTaskTitle('')
      await fetchTasks()
    } catch (err) {
      setError(err.message || 'Error al crear la tarea')
    } finally {
      setAdding(false)
    }
  }

  async function toggleCompleted(task) {
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      })
      if (!res.ok) throw new Error(res.statusText)
      await fetchTasks()
    } catch (err) {
      setError(err.message || 'Error al actualizar')
    }
  }

  async function saveEdit(id) {
    const title = editingTitle.trim()
    if (title === '') return
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error(res.statusText)
      setEditingId(null)
      setEditingTitle('')
      await fetchTasks()
    } catch (err) {
      setError(err.message || 'Error al guardar')
    }
  }

  async function deleteTask(id) {
    if (!window.confirm('¿Eliminar esta tarea?')) return
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(res.statusText)
      await fetchTasks()
    } catch (err) {
      setError(err.message || 'Error al eliminar')
    }
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditingTitle(task.title)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingTitle('')
  }

  // --- C. RENDERIZADO DINÁMICO (VISTAZO PÚBLICO) ---
  return (
    <div className="app">
      {/* 1. CABECERA CON BOTÓN DE ACCIÓN DINÁMICO */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Organizador Pro Remasterizado v2.0 🚀</h1>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {authStatus === 'authenticated' ? (
            // Si YA ESTÁ autenticado, mostramos perfil y botón de SALIR
            <>
              <span style={{ fontSize: '0.9rem', color: '#888' }}>
                👤 {user.username}
              </span>
              <button onClick={signOut} className="btn-small danger">Cerrar Sesión</button>
            </>
          ) : (
            // Si NO ESTÁ autenticado, mostramos botón de INICIAR SESIÓN
            <button 
              onClick={() => setShowLoginSection(!showLoginSection)} 
              className="btn-small primary"
            >
              {showLoginSection ? 'Volver a la lista' : 'Iniciar Sesión / Registrarse'}
            </button>
          )}
        </div>
      </header>

      {/* 2. SECCIÓN DE AUTENTICACIÓN OPCIONAL (Solo visible si showLoginSection es true y no está logueado) */}
      {showLoginSection && authStatus === 'unauthenticated' && (
        <div className="auth-card-container" style={{ marginBottom: '50px', maxWidth: '500px', margin: '0 auto' }}>
          <Authenticator />
        </div>
      )}

      {/* 3. CONTENIDO PRINCIPAL (Siempre visible - Tu lista de tareas original) */}
      <main 
        className={`app-content ${authStatus === 'unauthenticated' ? 'guest-mode' : ''}`}
        style={{ opacity: (showLoginSection && authStatus === 'unauthenticated') ? 0.3 : 1, transition: 'opacity 0.3s' }}
      >
        <form className="add-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Nueva tarea..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={adding}
            aria-label="Título de la nueva tarea"
          />
          <button type="submit" disabled={!newTaskTitle.trim() || adding}>
            {adding ? 'Añadiendo…' : 'Añadir'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="loading">Cargando tareas p&uacute;blicas…</p>
        ) : (
          <ul className="task-list">
            {tasks.length === 0 && !error && (
              <li className="empty">No hay tareas públicas. ¡Crea la primera!</li>
            )}
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`task ${task.completed ? 'completed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleCompleted(task)}
                  aria-label={`Marcar como ${task.completed ? 'pendiente' : 'completada'}`}
                />
                {editingId === task.id ? (
                  <>
                    <input
                      type="text"
                      className="edit-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(task.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                    />
                    <button onClick={() => saveEdit(task.id)} className="btn-small primary">Guardar</button>
                    <button onClick={cancelEdit} className="btn-small">Cancelar</button>
                  </>
                ) : (
                  <>
                    <span className="task-title">{task.title}</span>
                    <button onClick={() => startEdit(task)} className="btn-small">Editar</button>
                    <button onClick={() => deleteTask(task.id)} className="btn-small danger">Eliminar</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

export default App