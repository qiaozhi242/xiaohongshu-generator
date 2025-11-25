// app/page.js
'use client';

import { useState } from 'react';

export default function Home() {
  const [productName, setProductName] = useState('');
  const [sellingPoint, setSellingPoint] = useState('');
  const [style, setStyle] = useState('活泼');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [generationTime, setGenerationTime] = useState(0);
  const [isFirstGeneration, setIsFirstGeneration] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCopySuccess('');
    const startTime = Date.now();
    
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
      
      if (!response.ok) {
        throw new Error(data.error || '生成失败');
      }
      
      const endTime = Date.now();
      setGenerationTime(Math.round((endTime - startTime) / 100) / 10);
      setResult(data.text);
      setIsFirstGeneration(false);
      
    } catch (error) {
      console.error('生成失败:', error);
      setResult(`❌ ${error.message}\n\n请检查网络连接或稍后重试。`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopySuccess('✅ 文案已复制到剪贴板！');
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      setCopySuccess('❌ 复制失败，请手动复制');
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

        {isFirstGeneration && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-3">🎯 试试这些热门示例：</h4>
            <div className="space-y-2 text-sm">
              <button 
                type="button"
                onClick={() => {
                  setProductName('便携式咖啡杯');
                  setSellingPoint('一键保温保冷,24小时长效保温,超高颜值设计');
                  setStyle('活泼');
                }}
                className="block w-full text-left p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors"
              >
                <span className="font-medium text-purple-700">☕ 便携式咖啡杯</span>
                <br />
                <span className="text-purple-600">一键保温保冷, 24小时长效保温, 超高颜值设计</span>
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setProductName('美白精华液');
                  setSellingPoint('28天见证美白效果,温和不刺激,清爽易吸收');
                  setStyle('专业');
                }}
                className="block w-full text-left p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors"
              >
                <span className="font-medium text-purple-700">💆 美白精华液</span>
                <br />
                <span className="text-purple-600">28天见证美白效果, 温和不刺激, 清爽易吸收</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  setProductName('智能空气炸锅');
                  setSellingPoint('无油健康烹饪,智能控温,自动断电保护');
                  setStyle('搞笑');
                }}
                className="block w-full text-left p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors"
              >
                <span className="font-medium text-purple-700">🍟 智能空气炸锅</span>
                <br />
                <span className="text-purple-600">无油健康烹饪, 智能控温, 自动断电保护</span>
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">✨ AI为您生成的文案</h3>
                {generationTime > 0 && (
                  <p className="text-sm text-gray-500">
                    生成耗时: {generationTime}秒 • 
                    风格: {style} • 
                    {isFirstGeneration ? ' 首次体验' : ' 再次生成'}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {copySuccess && (
                  <span className="text-green-600 text-sm font-medium">{copySuccess}</span>
                )}
                <button
                  onClick={copyToClipboard}
                  className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制文案
                </button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                {result}
              </pre>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                💡 <strong>使用提示：</strong>点击"复制文案"按钮将内容复制到剪贴板，然后粘贴到小红书即可发布！
              </p>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 使用技巧</h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li><strong>产品名称</strong>要具体，如"便携咖啡杯"而不是"杯子"</li>
            <li><strong>核心卖点</strong>用逗号分隔，如"保温24小时,一键操作,便携设计"</li>
            <li>生成后可根据实际情况微调文案内容</li>
            <li>搭配精美产品图片效果更佳！</li>
          </ul>
        </div>

        {/* 联系信息 */}
        <div className="max-w-2xl mx-auto mt-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-2">需要完整版或定制服务？</p>
          <button 
            onClick={() => alert('请添加微信：YourWeChatID 或发送邮件：your@email.com')}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg font-medium transition-colors duration-200"
          >
            📱 联系获取完整版
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-8 text-center text-gray-500 text-sm">
        <p>Powered by AI技术 · 让内容创作更简单</p>
      </div>
    </div>
  );
}