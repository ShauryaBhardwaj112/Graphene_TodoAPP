import { Link, useNavigate } from 'react-router-dom'
import '../style/navbar.css'
import { useEffect, useState } from 'react'

function NavBar() {
    const [login, setLogin] = useState(localStorage.getItem('login')) //
    const navigate = useNavigate() //

    // BUG 6 FIX: Clear session securely both on the backend (httpOnly cookie) and client side
    const logout = async () => {
        try {
            // Backend endpoint par hit karke server-side token cookie ko destroy karein
            await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
                method: 'POST',
                credentials: 'include' // Cross-origin cookies transfer karne ke liye mandatory hai
            });
        } catch (error) {
            console.error("Backend logout handshakes failed:", error);
        } finally {
            // Kuch bhi ho, frontend security state aur routing ko dynamically flush hona hi chahiye
            localStorage.removeItem('login'); //
            setLogin(null); //
            navigate('/login'); //
        }
    }

    // Listen for login state changes triggered by other components (Login, SignUp)
    useEffect(() => { //
        const handleStorage = () => { //
            setLogin(localStorage.getItem('login')) //
        } //
        window.addEventListener('localStorage-change', handleStorage) //
        return () => { //
            window.removeEventListener('localStorage-change', handleStorage) //
        } //
    }, []) //

    return (
        <nav className="navbar">
            <div className="logo">To Do App</div> {/* */}
            <ul className="nav-links">
                {login ? ( //
                    <>
                        <li><Link to="/">List</Link></li> {/* */}
                        <li><Link to="/add">Add Task</Link></li> {/* */}
                        <li><button onClick={logout}>Logout</button></li> {/* */}
                    </>
                ) : null}
            </ul>
        </nav>
    )
}

export default NavBar //