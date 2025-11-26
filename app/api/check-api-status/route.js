// app/api/check-api-status/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 检查DeepSeek API密钥是否配置
    const hasApiKey = !!process.env.DEEPSEEK_API_KEY;
    
    return NextResponse.json({
      status: hasApiKey ? 'configured' : 'missing',
      hasApiKey: hasApiKey,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('检查API状态失败:', error);
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}