import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const App: React.FC = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [tasks, setTasks] = useState([
    { id: 1, title: "任务1：完成登录页面", status: "todo" },
    { id: 2, title: "任务2：集成 WebSocket", status: "inprogress" },
  ]);

  const [ws, setWs] = useState<WebSocket | null>(null);

  // 原生 WebSocket 连接
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/ws');
    
    socket.onopen = () => console.log('✅ WebSocket 已连接');
    socket.onmessage = (event) => {
      const updatedTasks = JSON.parse(event.data);
      setTasks(updatedTasks);
    };
    socket.onclose = () => console.log('WebSocket 已断开');

    setWs(socket);

    return () => socket.close();
  }, []);

  const moveTask = (id: number, newStatus: string) => {
    const newTasks = tasks.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    );
    setTasks(newTasks);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(newTasks));
    }
  };

  // ==================== 拖拽处理 ====================
  const onDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("taskId", id.toString());
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    moveTask(taskId, newStatus);
  };
  // ===============================================

  if (!token) return <div className="text-center text-red-500">请先登录</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">TaskBoard - 实时协作看板</h1>
      
      <div className="grid grid-cols-3 gap-6">
        {[
          { status: "todo", title: "待办" },
          { status: "inprogress", title: "进行中" },
          { status: "done", title: "已完成" }
        ].map(col => (
          <div
            key={col.status}
            className="bg-gray-900 p-6 rounded-2xl min-h-[400px]"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, col.status)}
          >
            <h2 className="text-xl mb-4 font-medium">{col.title}</h2>
            
            {tasks.filter(t => t.status === col.status).map(task => (
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