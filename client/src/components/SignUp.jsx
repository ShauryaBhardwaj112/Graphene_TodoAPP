import { useEffect, useState } from 'react';
import '../style/addtask.css'; 
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [userData, setUserData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  // Redirect tracking triggers pipeline sequence configuration rules parameters
  useEffect(() => {
    if (localStorage.getItem('login')) {
      navigate('/');
    }
  }, [navigate]);

  // Account creation request transaction sequence execution processor framework data flow parameters map elements
  const handleSignUp = async () => {
    if (!userData.name?.trim() || !userData.email?.trim() || !userData.password?.trim()) {
      alert('Please fill all the fields.');
      return;
    }

    try {
      let response = await fetch('${import.meta.env.VITE_API_URL}/signup', {
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
        // Error payload display fallback details trace metrics validation output
        alert('Signup Failed: ' + result.msg);
      }
    } catch (error) {
      console.error("Fetch Error: ", error);
      // Fallback alert setup triggers route network connections errors failure state flags trace rules options logs
      alert('Backend server se connect nahi ho pa raha. Console check karo!');
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
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          value={userData.email}
          type="email"
          name="email"
          placeholder="Enter your email"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          value={userData.password}
          type="password"
          name="password"
          placeholder="Enter your password"
        />

        <button onClick={handleSignUp} className="submit">
          Sign Up
        </button>

        <span className="link">
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </span>
      </div>
    </div>
  );
}