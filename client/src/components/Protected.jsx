import { Navigate } from 'react-router-dom'

export default function Protected({ children }) {
  // Authorization Router Guard validation checking rule logic filters wrapper route blocks
  // Client authentication flag absent hai toh secure views lock out karo aur back gate intercept redirections fire kar do
  if (!localStorage.getItem('login')) {
    return <Navigate to="/login" replace />
  }
  return children
}