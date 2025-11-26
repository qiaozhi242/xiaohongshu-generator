// app/page.js
'use client';

import { useState, useEffect } from 'react';
import UserMenu from '../components/UserMenu';

export default function Home() {
  const [productName, setProductName] = useState('');
  const [sellingPoint, setSellingPoint] = useState('');
  const [style, setStyle] = useState('活泼');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [generationTime, setGenerationTime] = useState(0);
  const [isFirstGeneration, setIsFirstGeneration] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'configured', 'missing', 'error'

  // 检查用户登录状态和API状态
  useEffect(() => {
    checkAuthStatus();
    checkApiStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // 检查API状态
  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/check-api-status');
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data.status);
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      console.error('检查API状态失败:', error);
      setApiStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 检查是否已登录
    if (!user) {
      alert('请先登录后再使用文案生成功能！');
      window.location.href = '/auth/login';
      return;
    }

    // 检查API状态
    if (apiStatus === 'missing') {
      alert('AI服务暂不可用，请联系管理员配置API密钥');
      return;
    }

    if (apiStatus === 'error') {
      alert('无法连接到AI服务，请稍后重试');
      return;
    }
    
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
      let errorMessage = error.message;
      
      // 提供更友好的错误提示
      if (error.message.includes('网络连接')) {
        errorMessage = '网络连接失败，请检查网络后重试';
      } else if (error.message.includes('额度不足')) {
        errorMessage = 'AI服务额度不足，请联系管理员';
      } else if (error.message.includes('API密钥')) {
        errorMessage = 'AI服务配置错误，请联系管理员';
        setApiStatus('missing');
      }
      
      setResult(`❌ ${errorMessage}\n\n请稍后重试或联系管理员。`);
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
      {/* 顶部导航栏 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-pink-600">
              🎯 小红书文案生成器
            </h1>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-2xl mx-auto">
        {/* API状态提示 */}
        {user && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            apiStatus === 'configured' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : apiStatus === 'missing'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : apiStatus === 'error'
              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {apiStatus === 'configured' && (
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                <span>AI服务已就绪，可以开始生成文案</span>
              </div>
            )}
            {apiStatus === 'missing' && (
              <div className="flex items-center">
                <span className="mr-2">❌</span>
                <span>AI服务未配置，请联系管理员设置DeepSeek API密钥</span>
              </div>
            )}
            {apiStatus === 'error' && (
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>无法检查AI服务状态，请刷新页面重试</span>
              </div>
            )}
            {apiStatus === 'checking' && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                <span>检查AI服务状态中...</span>
              </div>
            )}
          </div>
        )}

        {/* 欢迎信息 */}
        {user && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-sm border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              欢迎回来，{user.email}！ 👋
            </h2>
            <p className="text-gray-600">
              您已使用本工具生成了 <span className="font-bold text-pink-600">{user.usageCount || 0}</span> 篇文案
              {user.role === 'admin' && ' · 管理员权限'}
            </p>
          </div>
        )}

        {/* 未登录提示 */}
        {!user && !authLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  需要登录
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    请先登录或注册账号以使用文案生成功能。需要邀请码才能注册。
                  </p>
                </div>
                <div className="mt-3 flex space-x-3">
                  <a
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-200 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    立即登录
                  </a>
                  <a
                    href="/auth/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-yellow-700 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    注册账号
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 生成器表单 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-pink-600 mb-4">
              🎯 小红书爆款文案生成器
            </h1>
            <p className="text-gray-600 text-lg">
              输入产品信息，一键生成吸引眼球的小红书爆款文案
            </p>
          </div>

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
                disabled={!user || apiStatus === 'missing'}
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
                disabled={!user || apiStatus === 'missing'}
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
                disabled={!user || apiStatus === 'missing'}
              >
                <option value="活泼">🎉 活泼可爱型</option>
                <option value="专业">📊 专业测评型</option>
                <option value="简约">✨ 简约直接型</option>
                <option value="搞笑">😂 幽默搞笑型</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !user || apiStatus === 'missing' || apiStatus === 'checking'}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {!user ? (
                '请先登录'
              ) : apiStatus === 'missing' ? (
                '❌ AI服务未配置'
              ) : apiStatus === 'checking' ? (
                '检查AI服务中...'
              ) : loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  AI正在疯狂创作中...
                </div>
              ) : (
                '🚀 一键生成爆款文案'
              )}
            </button>
          </form>

          {isFirstGeneration && user && apiStatus === 'configured' && (
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
          <div className="max-w-2xl mx-auto mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 text-center">
            <p className="text-gray-600 mb-3">需要完整版或定制服务？</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => alert('请关注抖音账号：@qiaozhi242\n\n我们会通过抖音回复您的咨询和订单！')}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-2 px-6 rounded-lg font-medium transition-all duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
                </svg>
                关注抖音
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('qiaozhi242@gmail.com');
                  alert('邮箱地址已复制到剪贴板：qiaozhi242@gmail.com\n\n请通过邮箱联系我们！');
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-6 rounded-lg font-medium transition-all duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                复制邮箱
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <p>📧 邮箱：qiaozhi242@Gmail.com</p>
              <p>🎵 抖音：@qiaozhi242</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-8 text-center text-gray-500 text-sm">
          <p>Powered by AI技术 · 让内容创作更简单</p>
        </div>
      </div>
    </div>
  );
}