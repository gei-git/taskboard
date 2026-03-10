import React from 'react';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">TaskBoard</h1>
        <p className="text-xl text-gray-400 mb-8">实时任务协作平台</p>
        
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-96">
          <h2 className="text-2xl mb-6">欢迎回来</h2>
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium transition">
            使用 GitHub 登录（即将上线）
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;