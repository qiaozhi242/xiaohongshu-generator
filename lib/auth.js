// lib/auth.js
import jwt from 'jsonwebtoken';

// JWT 密钥 - 在生产环境中应该使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development';

// 创建 token
export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// 验证 token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

// 从请求中获取用户信息
export function getAuthUser(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    
    return verifyToken(token);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}