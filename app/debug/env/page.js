// app/debug/env/page.js
export default function EnvDebug() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">环境变量调试</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">服务器端环境变量：</h2>
          <pre className="text-sm bg-white p-4 rounded border">
            {JSON.stringify({
              MONGODB_URI: process.env.MONGODB_URI ? '已设置（隐藏）' : '未设置',
              JWT_SECRET: process.env.JWT_SECRET ? '已设置（隐藏）' : '未设置',
              INVITATION_CODE: process.env.INVITATION_CODE || '未设置',
              ADMIN_INVITATION_CODE: process.env.ADMIN_INVITATION_CODE || '未设置',
              NODE_ENV: process.env.NODE_ENV,
              NODE_VERSION: process.version
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}