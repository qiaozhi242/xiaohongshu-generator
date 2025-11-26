import { NextResponse } from 'next/server';
import { generateWithDeepSeek } from '@/lib/deepseek';

export async function POST(request) {
  try {
    const { prompt, context, userId } = await request.json();

    // 验证必填字段
    if (!prompt) {
      return NextResponse.json(
        { error: '提示词不能为空' },
        { status: 400 }
      );
    }

    // 在实际应用中，这里可以添加用户权限验证
    // 基于你的注册系统中的用户角色和次数限制

    // 调用DeepSeek API
    const generatedContent = await generateWithDeepSeek(prompt, context);

    // 这里可以添加使用记录保存逻辑
    // 更新用户的使用次数等

    return NextResponse.json({
      success: true,
      content: generatedContent,
      usage: {
        prompt_tokens: prompt.length,
        // 实际使用量可以从API响应中获取
      }
    });

  } catch (error) {
    console.error('AI生成API错误:', error);
    return NextResponse.json(
      { error: error.message || 'AI生成失败' },
      { status: 500 }
    );
  }
}