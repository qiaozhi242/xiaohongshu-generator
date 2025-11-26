'use client';
import { useState } from 'react';

export default function AIGenerator({ user }) {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          userId: user?.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.content);
      } else {
        alert('生成失败: ' + data.error);
      }
    } catch (error) {
      alert('请求失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">AI一键生成</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">生成场景描述</label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="例如：代码生成、文案创作、技术文档等"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">详细需求</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="详细描述你想要生成的内容..."
            rows="4"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? '生成中...' : '一键生成'}
        </button>

        {generatedContent && (
          <div>
            <label className="block text-sm font-medium mb-2">生成结果</label>
            <div className="p-3 bg-gray-50 border rounded whitespace-pre-wrap">
              {generatedContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}