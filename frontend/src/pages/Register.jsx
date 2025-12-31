import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('')
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await authAPI.register(username, age, password);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
  const detail = err.response?.data?.detail;

  if (Array.isArray(detail)) {
    // Преобразуем массив ошибок в строку
    const messages = detail.map(e => {
      // Можно показать поле и сообщение
      const field = e.loc?.[1] || 'field';
      return `${field}: ${e.msg}`;
    }).join('; ');

    setError(messages);
  } else {
    setError(err.response?.data?.detail || 'Registration failed');
  }
}

  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Register
        </h2>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginBottom: '1rem' }}>{success}</p>}

          <form onSubmit={handleSubmit}>
              <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                  }}
              />
              <input
                  type="text"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                  }}
              />
              <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                  }}
              />

              <button
                  type="submit"
                  style={{
                      width: '100%',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer'
                  }}
              >
                  Register
              </button>
          </form>

          <p style={{marginTop: '1rem'}}>
              Already have an account?{' '}
              <Link to="/login" style={{color: '#3b82f6'}}>Login</Link>
          </p>
      </div>
    </div>
  );
}

export default Register;