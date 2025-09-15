import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './Pages/Login';

function App() {
  const [count, setCount] = useState(0)

  return (
   <Routes>
      <Route path='/' element={<Login/>}/>
   </Routes>
  );
}

export default App
