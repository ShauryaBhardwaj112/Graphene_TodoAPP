import { useEffect, useState } from 'react';
import '../style/addtask.css'; 
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [userData, setUserData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('login')) {
      navigate('/');
    }
  }, [navigate]);

  const handleSignUp = async () => {
    if (!userData.name?.trim() || !userData.email?.trim() || !userData.password?.trim()) {
      alert('Please fill all the fields.');
      return;
    }

    setLoading(true);

    try {
      let response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: 'POST',
        body: JSON.stringify(userData),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      let result = await response.json();
      console.log("Signup Backend Response:", result);

      if (result.success) {
        localStorage.setItem('login', userData.email);
        window.dispatchEvent(new Event('localStorage-change'));
        navigate('/');
      } else {
        alert('Signup Failed: ' + (result.msg || result.message));
      }
    } catch (error) {
      console.error("Fetch Error: ", error);
      alert('Cannot connect to server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="container">
        <h1>Sign Up</h1>

        <label htmlFor="name">Name</label>
        <input
          id="name"
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          value={userData.name}
          type="text"
          name="name"
          placeholder="Enter your name"
          disabled={loading}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          value={userData.email}
          type="email"
          name="email"
          placeholder="Enter your email"
          disabled={loading}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          value={userData.password}
          type="password"
          name="password"
          placeholder="Enter your password"
          disabled={loading}
        />

        <button 
          onClick={handleSignUp} 
          className="submit"
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>

        <span className="link">
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </span>
      </div>
    </div>
  );
}