import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const res = await registerUser(username, password);
      alert(res.data.message);
      navigate('/login');
    } catch {
      alert('Đăng ký thất bại');
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      <input placeholder="Tài khoản" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Đăng ký</button>
      <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
    </div>
  );
}

export default Register;
