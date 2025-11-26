// app/api/auth/route.js
import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

// 使用与注册API相同的内存数据库实例
let memoryUsers = [];
let nextId = 1;

const memoryDB = {
  users: {
    findOne: async (query) => {
      if (query.email) {
        const user = memoryUsers.find(user => user.email === query.email);
        console.log('🔍 内存数据库查找用户:', query.email, '找到:', !!user);
        return user || null;
      }
      return null;
    },
    updateOne: async (filter, update) => {
      const userIndex = memoryUsers.findIndex(user => user.email === filter.email);
      if (userIndex !== -1) {
        if (update.$set) {
          memoryUsers[userIndex] = { ...memoryUsers[userIndex], ...update.$set };
        }
        if (update.$inc && update.$inc.usageCount) {
          memoryUsers[userIndex].usageCount = (memoryUsers[userIndex].usageCount || 0) + 1;
        }
        console.log('📝 更新内存用户:', filter.email);
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    }
  }
};

// 简化的数据库连接函数
async function getDatabase() {
  try {
    // 检查是否有 MongoDB 环境变量
    if (!process.env.MONGODB_URI) {
      console.log('⚠️ 未找到 MONGODB_URI，使用内存数据库');
      return memoryDB;
    }
    
    // 动态导入 MongoDB 相关模块
    const { MongoClient } = await import('mongodb');
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    console.log('✅ 成功连接到 MongoDB 数据库');
    return {
      users: {
        findOne: (query) => db.collection('users').findOne(query),
        updateOne: (filter, update) => db.collection('users').updateOne(filter, update)
      }
    };
  } catch (error) {
    console.log('❌ MongoDB 连接失败，使用内存数据库:', error.message);
    return memoryDB;
  }
}

export async function POST(request) {
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
  }
}

// 添加调试端点
export async function GET() {
  const db = await getDatabase();
  return NextResponse.json({
    message: '登录API工作正常',
    databaseType: db === memoryDB ? '内存数据库' : 'MongoDB',
    memoryUserCount: memoryUsers.length,
    timestamp: new Date().toISOString()
  });
}