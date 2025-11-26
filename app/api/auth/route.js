// app/api/auth/route.js
import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

// 移除内存数据库相关代码，强制使用MongoDB

// 简化的数据库连接函数
async function getDatabase() {
  // 检查是否有 MongoDB 环境变量
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI 环境变量未设置');
    throw new Error('数据库配置错误：MONGODB_URI 环境变量未设置');
  }
  
  try {
    // 动态导入 MongoDB 相关模块
    const { MongoClient } = await import('mongodb');
    
    console.log('🔗 尝试连接到 MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // 测试连接是否正常
    await db.command({ ping: 1 });
    console.log('✅ 成功连接到 MongoDB 数据库');
    
    return {
      users: {
        findOne: (query) => db.collection('users').findOne(query),
        updateOne: (filter, update) => db.collection('users').updateOne(filter, update),
        insertOne: (document) => db.collection('users').insertOne(document) // 添加insertOne方法
      },
      client: client // 返回client用于后续关闭连接
    };
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    console.error('连接详情:', {
      hasUri: !!process.env.MONGODB_URI,
      uriLength: process.env.MONGODB_URI?.length,
      error: error.message
    });
    throw new Error(`数据库连接失败: ${error.message}`);
  }
}

export async function POST(request) {
  let client; // 用于在finally中关闭连接
  
  try {
    // 解析请求数据
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: '请求数据格式错误' },
        { status: 400 }
      );
    }

    const { email, password } = requestBody;

    console.log('🔐 登录请求:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码都是必填项' },
        { status: 400 }
      );
    }

    // 获取数据库连接
    const db = await getDatabase();
    client = db.client; // 保存client引用
    
    if (!db || !db.users) {
      console.error('❌ 数据库连接失败，db 对象无效');
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      );
    }

    console.log('🔍 开始查找用户:', email);

    // 查找用户
    const user = await db.users.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ 用户不存在:', email);
      return NextResponse.json(
        { error: '用户不存在，请先注册' },
        { status: 400 }
      );
    }

    console.log('✅ 找到用户:', user.email);

    // 验证密码（注意：这里使用明文验证，实际项目应该加密）
    if (user.password !== password) {
      console.log('❌ 密码错误');
      return NextResponse.json(
        { error: '密码错误' },
        { status: 400 }
      );
    }

    // 更新最后登录时间和使用次数
    await db.users.updateOne(
      { email: email.toLowerCase() },
      { 
        $set: { lastLogin: new Date() },
        $inc: { usageCount: 1 }
      }
    );

    // 重新获取更新后的用户数据
    const updatedUser = await db.users.findOne({ email: email.toLowerCase() });

    // 生成JWT token
    const token = createToken({
      userId: user._id || user.id,
      email: user.email,
      role: user.role || 'user'
    });

    const response = NextResponse.json(
      { 
        message: '登录成功',
        user: {
          email: user.email,
          role: user.role || 'user',
          usageCount: (updatedUser?.usageCount || user.usageCount || 0) + 1
        },
        success: true
      },
      { status: 200 }
    );

    // 设置HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7天
    });

    console.log('🎉 登录成功:', user.email);

    return response;

  } catch (error) {
    console.error('❌ 登录错误:', error);
    console.error('错误详情:', error.stack);
    
    return NextResponse.json(
      { 
        error: '登录失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    // 关闭数据库连接
    if (client) {
      await client.close();
    }
  }
}

// 添加调试端点
export async function GET() {
  try {
    const db = await getDatabase();
    return NextResponse.json({
      message: '登录API工作正常',
      databaseType: 'MongoDB',
      timestamp: new Date().toISOString(),
      environment: {
        hasMongoDBUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV,
        // 显示URI的前几个字符用于调试（不暴露完整密码）
        uriPreview: process.env.MONGODB_URI ? 
          process.env.MONGODB_URI.substring(0, 30) + '...' : '未设置'
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: '数据库连接失败',
      databaseType: '连接错误',
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: {
        hasMongoDBUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}