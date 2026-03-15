import './App.css'
import AddTodo from './components/AddTodo'
import Todos from './components/Todos'

function App() {
  return (
    <div className="todo-page">
      <div className="ambient-shape shape-one" aria-hidden="true" />
      <div className="ambient-shape shape-two" aria-hidden="true" />

      <main className="todo-shell">
        <p className="todo-eyebrow">Redux Toolkit Practice</p>
        <h1 className="todo-title">Task Canvas</h1>
        <p className="todo-subtitle">Capture your next move and keep momentum through the day.</p>

        <AddTodo />
        <Todos />
      </main>
    </div>
  )
}

export default App