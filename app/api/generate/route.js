// app/api/generate/route.js
import { NextResponse } from 'next/server';
import { generateWithDeepSeek } from '@/lib/deepseek';

export async function POST(request) {
  try {
    const { productName, sellingPoint, style } = await request.json();

    // 验证必填字段
    if (!productName || !sellingPoint) {
      return NextResponse.json(
        { error: '产品名称和核心卖点是必填项' },
        { status: 400 }
      );
    }

    // 构建提示词
    const prompt = `请为产品"${productName}"创作一篇小红书文案。
    
产品核心卖点：${sellingPoint}
文案风格：${style}

要求：
1. 包含吸引人的标题
2. 正文内容生动有趣
3. 添加相关的话题标签
4. 符合小红书平台特点
5. 使用${style}风格的语言表达`;

    // 调用DeepSeek API
    const generatedText = await generateWithDeepSeek(prompt);

    return NextResponse.json({
      success: true,
      text: generatedText,
      usage: {
        product: productName,
        style: style
      }
    });

  } catch (error) {
    console.error('文案生成API错误:', error);
    
    // 提供更友好的错误信息
    let errorMessage = '文案生成失败，请稍后重试';
    if (error.message.includes('API密钥') || error.message.includes('authorization')) {
      errorMessage = 'AI服务配置错误，请联系管理员';
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      errorMessage = 'AI服务额度不足，请联系管理员';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}