import { Navigate } from 'react-router-dom'

export default function Protected({ children }) {
    // If user is not logged in, redirect to login page
    if (!localStorage.getItem('login')) {
        return <Navigate to="/login" replace />
    }
    return children
}