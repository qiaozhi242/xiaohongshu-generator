// app/page.js
'use client';

import { useState } from 'react';

export default function Home() {
  const [productName, setProductName] = useState('');
  const [sellingPoint, setSellingPoint] = useState('');
  const [style, setStyle] = useState('活泼');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          sellingPoint,
          style
        }),
      });
      
      const data = await response.json();
      setResult(data.text);
    } catch (error) {
      console.error('生成失败:', error);
      setResult('生成失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 py-8 px-4">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold text-pink-600 mb-4">
          🎯 小红书爆款文案生成器
        </h1>
        <p className="text-gray-600 text-lg">
          输入产品信息，一键生成吸引眼球的小红书爆款文案
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              产品名称 *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="例如：便携式咖啡杯、美白精华液、网红零食..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              核心卖点 *
            </label>
            <textarea
              value={sellingPoint}
              onChange={(e) => setSellingPoint(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="例如：一键保温保冷、24小时长效保湿、口感酥脆不油腻..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文案风格
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="活泼">🎉 活泼可爱型</option>
              <option value="专业">📊 专业测评型</option>
              <option value="简约">✨ 简约直接型</option>
              <option value="搞笑">😂 幽默搞笑型</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                AI正在疯狂创作中...
              </div>
            ) : (
              '🚀 一键生成爆款文案'
            )}
          </button>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">✨ 为您生成的文案：</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  alert('文案已复制到剪贴板！');
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                📋 复制文案
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                {result}
              </pre>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                💡 <strong>使用提示：</strong>复制上面的文案到小红书，根据实际情况微调即可发布！
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto mt-8 text-center text-gray-500 text-sm">
        <p>Powered by AI技术 · 让内容创作更简单</p>
      </div>
    </div>
  );
}