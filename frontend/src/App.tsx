import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/auth/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      setMessage('登录成功！Token 已保存');
    } catch (err: any) {
      setMessage('登录失败：' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setMessage('已退出登录');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-5xl font-bold text-center mb-2">TaskBoard</h1>
        <p className="text-center text-gray-400 mb-8">实时任务协作平台</p>

        {!token ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium transition"
            >
              登录
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-400 mb-6">✅ 已登录</p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-medium transition"
            >
              退出登录
            </button>
          </div>
        )}

        {message && <p className="mt-6 text-center text-sm text-gray-400">{message}</p>}
      </div>
    </div>
  );
};

export default App;