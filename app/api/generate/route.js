// app/api/generate/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const productName = body.productName || '';
    const sellingPoint = body.sellingPoint || '';
    
    // 基本验证
    if (!productName || !sellingPoint) {
      return NextResponse.json({ 
        error: '产品名称和核心卖点是必填项' 
      }, { status: 400 });
    }

    // 最简单的响应
    const mockResponse = '测试成功：' + productName + ' - ' + sellingPoint;

    // 模拟处理时间
    await new Promise(function(resolve) {
      setTimeout(resolve, 1000);
    });

    return NextResponse.json({ 
      text: mockResponse,
      status: 'success' 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}