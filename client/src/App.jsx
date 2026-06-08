import './style/App.css'
import NavBar from './components/NavBar'
import { Routes, Route } from 'react-router-dom'
import AddTask from './components/AddTask'
import List from './components/List'
import UpdateTask from './components/UpdateTask'
import SignUp from './components/SignUp'
import Login from './components/Login'
import Protected from './components/Protected'

function App() {
  return (
    <>
      <NavBar />
      {/* page-wrapper handles global fade-in route transitions */}
      <div className="page-wrapper">
        <Routes>
          {/* Protected component unauthenticated users ko dynamically login page par phenk dega */}
          <Route path="/"           element={<Protected><List /></Protected>} />
          <Route path="/add"        element={<Protected><AddTask /></Protected>} />
          <Route path="/update/:id" element={<Protected><UpdateTask /></Protected>} />
          
          {/* Public routing pathways */}
          <Route path="/signup"     element={<SignUp />} />
          <Route path="/login"      element={<Login />} />
        </Routes>
      </div>
    </>
  )
}

export default App