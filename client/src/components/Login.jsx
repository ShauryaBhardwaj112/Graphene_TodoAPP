import { useEffect, useState } from 'react';
import '../style/addtask.css';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const [userData, setUserData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Authenticated state route intercept guard checker
    useEffect(() => {
        // User agar pehle se logged in hai toh direct task manager list par phenko
        if (localStorage.getItem('login')) {
            navigate('/');
        }
    }, [navigate]);

    // Authentication transaction triggers pipeline sequence action
    const handleLogin = async () => {
        if (!userData.email?.trim() || !userData.password?.trim()) {
            setError('Please enter both email and password.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3200/login', {
                method: 'POST',
                body: JSON.stringify(userData),
                // Secure httpOnly session mapping configurations pass down logic setup rules
                credentials: 'include',         
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.success) {
                // Note: Security parameters ke hisab se backend automatic Set-Cookie header se cookie set kar raha hai. 
                // JavaScript context manual parsing block access nahi karega (httpOnly setup). 
                // Hum bas application interface routing tracks handle karne ke liye item key pass down kar rahe hain local storage ko.
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

                <label htmlFor="email">Email</label>
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