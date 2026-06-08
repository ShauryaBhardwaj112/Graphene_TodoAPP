import { Link, useNavigate } from 'react-router-dom'
import '../style/navbar.css'
import { useEffect, useState } from 'react'

function NavBar() {
  const [login, setLogin] = useState(localStorage.getItem('login'))
  const navigate = useNavigate()

  // Destroy session sequence trigger clean context handlers parameters block
  const logout = () => {
    localStorage.removeItem('login')
    setLogin(null)
    navigate('/login')
  }

  // Cross tab / multi action component listener events update triggers array tracks hooks sync lifecycle tracking rules
  useEffect(() => {
    // Dusre forms jab state alter karein toh navbar elements reactive dynamic sync automatic catch karein seamlessly
    const handleStorage = () => {
      setLogin(localStorage.getItem('login'))
    }
    window.addEventListener('localStorage-change', handleStorage)
    return () => {
      window.removeEventListener('localStorage-change', handleStorage)
    }
  }, [])

  return (
    <nav className="navbar">
      <div className="logo">To Do App</div>
      <ul className="nav-links">
        {login ? (
          <>
            <li><Link to="/">List</Link></li>
            <li><Link to="/add">Add Task</Link></li>
            <li><button onClick={logout}>Logout</button></li>
          </>
        ) : null}
      </ul>
    </nav>
  )
}

export default NavBar