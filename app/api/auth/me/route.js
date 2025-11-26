// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
// 建议使用 MongoDB ObjectId
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    // 1. 获取当前用户认证信息
    const userInfo = await getCurrentUser(request);
    
    if (!userInfo || !userInfo.userId) {
      console.log('未找到用户认证信息');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 2. 连接数据库
    const { db } = await connectToDatabase();
    
    // 3. 查询用户信息 - 修复_id查询问题
    let user;
    try {
      // 确保userId是有效的ObjectId格式再转换
      if (ObjectId.isValid(userInfo.userId)) {
        user = await db.collection('users').findOne({ 
          _id: new ObjectId(userInfo.userId) 
        });
      } else {
        // 如果userId不是ObjectId格式，尝试按其他字段查询（如字符串id）
        user = await db.collection('users').findOne({ 
          _id: userInfo.userId 
        });
      }
    } catch (dbError) {
      console.error('数据库查询错误:', dbError);
      // 返回部分用户信息而不是完全失败
      return NextResponse.json({
        user: {
          email: userInfo.email,
          role: userInfo.role
          // 不包含敏感信息如usageCount等
        }
      });
    }

    if (!user) {
      console.log(`未找到用户记录，用户ID: ${userInfo.userId}`);
      // 返回认证信息中的基本用户数据
      return NextResponse.json({
        user: {
          email: userInfo.email,
          role: userInfo.role
        }
      });
    }

    // 4. 返回完整的用户信息（排除密码等敏感字段）
    return NextResponse.json({
      user: {
        email: user.email,
        role: user.role || 'user',
        usageCount: user.usageCount || 0,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
        // 根据需要添加其他字段，但排除密码等敏感信息
      }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    // 返回具体的错误信息，方便调试但不会泄露敏感信息
    return NextResponse.json(
      { 
        error: '无法获取用户信息',
        user: null 
      }, 
      { status: 500 }
    );
  }
}