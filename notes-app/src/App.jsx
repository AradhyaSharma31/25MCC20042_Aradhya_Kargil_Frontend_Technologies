import { useState } from 'react'
import './App.css'
import NotesApp from './NotesApp'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NotesApp />
    </>
  )
}

export default App