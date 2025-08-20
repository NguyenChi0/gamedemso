import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await loginUser(username, password);
      localStorage.setItem('username', res.data.user.username);
      navigate('/');
    } catch {
      alert('Sai tài khoản hoặc mật khẩu');
    }
  };

  return (
    <div>
      <h2>Đăng nhập</h2>
      <input placeholder="Tài khoản" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Đăng nhập</button>
      <p>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
    </div>
  );
}

export default Login;
