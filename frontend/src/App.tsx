// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const App: React.FC = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);

  const [ws, setWs] = useState<WebSocket | null>(null);

  // 登录成功后加载任务 + 建立 WebSocket
  useEffect(() => {
    if (token) {
      // 1. 从数据库加载任务
      axios.get('http://localhost:8080/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setTasks(res.data))
      .catch(err => console.error("加载任务失败", err));

      // 2. 建立 WebSocket 连接
      const socket = new WebSocket('ws://localhost:8080/ws');
      socket.onopen = () => console.log('WebSocket 已连接');
      socket.onmessage = (event) => {
        const updatedTasks = JSON.parse(event.data);
        setTasks(updatedTasks);
      };
      socket.onclose = () => console.log('WebSocket 已断开');
      setWs(socket);

      return () => socket.close();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setMessage('登录成功！');
    } catch (err: any) {
      setMessage('登录失败：' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setMessage('');
  };

  // 拖拽移动任务 + 同步到后端
  const moveTask = async (id: number, newStatus: string) => {
    const newTasks = tasks.map(t =>
      t.id === id ? { ...t, status: newStatus } : t
    );
    setTasks(newTasks);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(newTasks));
    }

    // 持久化到数据库
    try {
      await axios.post('http://localhost:8080/tasks', newTasks, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("保存任务失败", err);
    }
  };

  // 拖拽事件处理
  const onDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("taskId", id.toString());
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    moveTask(taskId, newStatus);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-900 p-8 rounded-3xl shadow-2xl">
          <h1 className="text-5xl font-bold text-center mb-2">TaskBoard</h1>
          <p className="text-center text-gray-400 mb-8">实时任务协作平台</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-800 rounded-xl" required />
            <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-800 rounded-xl" required />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium">登录</button>
          </form>
          {message && <p className="mt-6 text-center text-sm text-gray-400">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">TaskBoard - 实时协作看板</h1>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl">退出登录</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {['todo', 'inprogress', 'done'].map(status => (
          <div
            key={status}
            className="bg-gray-900 p-6 rounded-2xl min-h-[400px]"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
          >
            <h2 className="text-xl mb-4 font-medium capitalize">
              {status === 'todo' ? '待办' : status === 'inprogress' ? '进行中' : '已完成'}
            </h2>
            {tasks.filter(t => t.status === status).map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
                className="bg-gray-800 p-4 rounded-xl mb-3 cursor-grab active:cursor-grabbing hover:bg-gray-700 transition"
              >
                {task.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;