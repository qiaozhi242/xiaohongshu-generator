// app/api/register/route.js
import { NextResponse } from 'next/server';

// 硬编码邀请码作为备用方案
const VALID_INVITATION_CODES = [
  "QZ202588",     // 普通用户邀请码
  "VIPQZ8888"     // 管理员邀请码
];

// 内存数据库 - 与登录API共享
let memoryUsers = [];
let nextId = 1;

const memoryDB = {
  users: {
    findOne: async (query) => {
      if (query.email) {
        return memoryUsers.find(user => user.email === query.email) || null;
      }
      return null;
    },
    
    insertOne: async (user) => {
      const newUser = {
        ...user,
        _id: String(nextId++),
        createdAt: new Date(),
        usageCount: 0
      };
      memoryUsers.push(newUser);
      console.log('💾 内存数据库存储用户:', newUser.email, '总用户数:', memoryUsers.length);
      return { insertedId: newUser._id };
    }
  }
};

console.log('🔑 注册API加载 - 可用邀请码:', VALID_INVITATION_CODES);

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
        insertOne: (user) => db.collection('users').insertOne(user)
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
        { error: '请求数据格式错误，请检查JSON格式' },
        { status: 400 }
      );
    }

    const { email, password, invitationCode } = requestBody;

    console.log('📨 注册请求:', { 
      email, 
      invitationCode,
      validCodes: VALID_INVITATION_CODES 
    });

    // 验证必填字段
    if (!email || !password || !invitationCode) {
      return NextResponse.json(
        { error: '邮箱、密码和邀请码都是必填项' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6位' },
        { status: 400 }
      );
    }

    // 验证邀请码
    if (!VALID_INVITATION_CODES.includes(invitationCode)) {
      return NextResponse.json(
        { 
          error: `邀请码无效，请检查是否正确。可用邀请码: ${VALID_INVITATION_CODES.join(', ')}`,
          receivedCode: invitationCode,
          validCodes: VALID_INVITATION_CODES
        },
        { status: 400 }
      );
    }

    // 获取数据库连接
    const db = await getDatabase();
    
    // 检查数据库对象是否有效
    if (!db || !db.users) {
      console.error('❌ 数据库连接失败，db 对象无效');
      return NextResponse.json(
        { error: '数据库连接失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await db.users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 创建用户
    const user = {
      email: email.toLowerCase(),
      password: password, // 注意：实际应用中应该加密密码
      invitationCode,
      role: invitationCode === "VIPQZ8888" ? 'admin' : 'user',
      createdAt: new Date(),
      usageCount: 0,
      lastLogin: null
    };

    const result = await db.users.insertOne(user);

    console.log('✅ 用户注册成功:', {
      email: user.email,
      role: user.role,
      database: db === memoryDB ? '内存数据库' : 'MongoDB'
    });

    return NextResponse.json(
      { 
        message: '注册成功！现在可以登录了',
        success: true,
        user: {
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ 注册错误:', error);
    
    return NextResponse.json(
      { 
        error: '注册失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// 添加 GET 方法用于调试
export async function GET() {
  const db = await getDatabase();
  return NextResponse.json({
    message: '注册API正常工作',
    validInvitationCodes: VALID_INVITATION_CODES,
    timestamp: new Date().toISOString(),
    memoryUserCount: memoryUsers.length,
    databaseType: db === memoryDB ? '内存数据库' : 'MongoDB'
  });
}