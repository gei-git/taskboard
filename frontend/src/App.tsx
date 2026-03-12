import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/auth/login', { email, password });
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setMessage('登录成功！');
    } catch (err: any) {
      setMessage('登录失败：' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setMessage('已退出登录');
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setMessage('Token 已复制到剪贴板！');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-5xl font-bold text-center mb-2">TaskBoard</h1>
        <p className="text-center text-gray-400 mb-8">实时任务协作平台</p>

        {!token ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-800 rounded-xl" required />
            <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-800 rounded-xl" required />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium">登录</button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-green-400 text-xl">✅ 已登录</p>
            
            <div className="bg-gray-800 p-4 rounded-xl text-left text-xs break-all">
              <strong>你的 Token：</strong><br />
              {token.substring(0, 50)}...
            </div>

            <button onClick={copyToken} className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-medium">复制 Token</button>
            <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-medium">退出登录</button>
          </div>
        )}

        {message && <p className="mt-6 text-center text-sm text-gray-400">{message}</p>}
      </div>
    </div>
  );
};

export default App;