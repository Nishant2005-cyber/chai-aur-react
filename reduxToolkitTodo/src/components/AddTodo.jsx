import React, {useState} from 'react'
import {useDispatch} from 'react-redux'
import {addTodo} from '../features/todo/todoSlice' 

function AddTodo() {

    const [input, setInput] = useState('')
    const dispatch = useDispatch()

    const addTodoHandler = (e) => {
        e.preventDefault()
        const trimmedInput = input.trim()

        if (!trimmedInput) {
            return
        }

        dispatch(addTodo(trimmedInput))
        setInput('')
    }

    return (
    <form onSubmit={addTodoHandler} className="todo-form">
        <input
        type="text"
        className="todo-input"
        placeholder="Enter a Todo..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        />
        <button
        type="submit"
        className="todo-add-btn"
        >
        Add Todo
        </button>
    </form>
    )
}

export default AddTodo