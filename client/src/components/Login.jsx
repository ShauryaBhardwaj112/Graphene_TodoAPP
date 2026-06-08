import { useEffect, useState } from 'react';
import '../style/addtask.css';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const [userData, setUserData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // If user is already logged in, redirect to task list
    useEffect(() => {
        if (localStorage.getItem('login')) {
            navigate('/');
        }
    }, [navigate]);

    // Login form submit handler
    const handleLogin = async () => {
        if (!userData.email?.trim() || !userData.password?.trim()) {
            setError('Please enter both email and password.');
            return;
        }
        setError('');
        setLoading(true);

        try {
           const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: 'POST',
                body: JSON.stringify(userData),
                // Required for cross-origin cookie handling (httpOnly session token)
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.success) {
                // The backend sets the httpOnly cookie automatically via Set-Cookie header.
                // We only store the email in localStorage to track login state in the UI.
                localStorage.setItem('login', userData.email);
                window.dispatchEvent(new Event('localStorage-change'));
                navigate('/');
            } else {
                setError(result.msg || 'Login failed. Check your email and password.');
            }
        } catch {
            setError('Cannot connect to server. Is the backend running on port 3200?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="container">
                <h1>Login</h1>

                {error && <p className="form-error">{error}</p>}

                <label htmlFor="email">Email ID</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                />

                <button
                    onClick={handleLogin}
                    className="submit"
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <span className="link">
                    Don't have an account?{' '}
                    <Link to="/signup">Sign Up</Link>
                </span>
            </div>
        </div>
    );
}