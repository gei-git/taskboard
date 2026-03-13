import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './index.css';

const socket = io('http://localhost:8080');

const App: React.FC = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [tasks, setTasks] = useState([
    { id: 1, title: "任务1：完成登录页面", status: "todo" },
    { id: 2, title: "任务2：集成 WebSocket", status: "inprogress" },
  ]);

  // WebSocket 实时更新
  useEffect(() => {
    const handleTaskUpdate = (updatedTasks: any[]) => {
      setTasks(updatedTasks);
    };

    socket.on('taskUpdate', handleTaskUpdate);

    // 正确 cleanup
    return () => {
      socket.off('taskUpdate', handleTaskUpdate);
    };
  }, []);

  // 拖拽移动任务
  const moveTask = (id: number, newStatus: string) => {
    const newTasks = tasks.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    );
    setTasks(newTasks);
    socket.emit('taskUpdate', newTasks); // 实时广播给其他客户端
  };

  if (!token) {
    return <div className="text-center text-red-500">请先登录</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">TaskBoard - 实时协作看板</h1>
      
      <div className="grid grid-cols-3 gap-6">
        {['todo', 'inprogress', 'done'].map(status => (
          <div key={status} className="bg-gray-900 p-6 rounded-2xl">
            <h2 className="text-xl mb-4 capitalize font-medium">
              {status === 'todo' ? '待办' : status === 'inprogress' ? '进行中' : '已完成'}
            </h2>
            {tasks.filter(t => t.status === status).map(task => (
              <div
                key={task.id}
                draggable
                onDragEnd={() => moveTask(task.id, status)}
                className="bg-gray-800 p-4 rounded-xl mb-3 cursor-move hover:bg-gray-700"
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