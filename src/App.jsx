import './App.css'
import { Routes, Route } from 'react-router-dom'
import '@coreui/coreui/dist/css/coreui.min.css'
import Home from "./components/Home.jsx"
import DefaultLayout from "./layout/DefaultLayout.jsx"

function App() {
  return (
    <div className="container-fluid  p-0 mx-0">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<DefaultLayout />} />
      </Routes>
    </div>
  )
}

export default App
