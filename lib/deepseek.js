// lib/deepseek.js
import { OpenAI } from 'openai';

// 初始化OpenAI客户端（兼容DeepSeek API）
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export async function generateWithDeepSeek(prompt, context = '') {
  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的小红书文案创作助手。${context}请生成吸引人、易于传播的小红书风格文案。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.8,
      stream: false,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API调用错误:', error);
    throw new Error('文案生成失败，请稍后重试');
  }
}