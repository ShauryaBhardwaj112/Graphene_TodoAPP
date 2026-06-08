import { Link, useNavigate } from 'react-router-dom'
import '../style/navbar.css'
import { useEffect, useState } from 'react'

function NavBar() {
    const [login, setLogin] = useState(localStorage.getItem('login'))
    const navigate = useNavigate()

    // Clear session and redirect to login page
    const logout = () => {
        localStorage.removeItem('login')
        setLogin(null)
        navigate('/login')
    }

    // Listen for login state changes triggered by other components (Login, SignUp)
    useEffect(() => {
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