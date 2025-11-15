import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/pages/Home'
import Login from './components/pages/Login'
import ViewBooks from './components/pages/ViewBooks'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/books" element={<ViewBooks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
