// app/debug/db/page.js
import { getMemoryDBStats } from '@/lib/db';

export default async function DBDebug() {
  const memoryStats = getMemoryDBStats();
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">数据库状态调试</h1>
      
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="font-semibold mb-2">内存数据库状态：</h2>
          <pre className="text-sm bg-white p-4 rounded border">
            {JSON.stringify({
              用户数量: memoryStats.userCount,
              用户列表: memoryStats.users
            }, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h2 className="font-semibold mb-2">测试数据库连接：</h2>
          <div className="space-y-2">
            <a 
              href="/api/auth" 
              className="block p-3 bg-white rounded border hover:bg-gray-50"
              target="_blank"
            >
              🔗 测试登录API连接
            </a>
            <a 
              href="/api/register" 
              className="block p-3 bg-white rounded border hover:bg-gray-50"
              target="_blank"
            >
              🔗 测试注册API连接
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}