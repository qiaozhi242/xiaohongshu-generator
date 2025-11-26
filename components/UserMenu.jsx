// components/UserMenu.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UserMenu() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // 检查用户登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsOpen(false);
      // 刷新页面以更新状态
      window.location.href = '/';
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/20">
        <div className="animate-pulse flex space-x-3 items-center">
          <div className="rounded-full bg-gray-200 h-8 w-8"></div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-2 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!user) {
    return (
      <div className="flex space-x-3">
        <Link
          href="/auth/login"
          className="bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm border border-white/20 hover:shadow-md"
        >
          登录
        </Link>
        <Link
          href="/auth/register"
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          注册
        </Link>
      </div>
    );
  }

  // 已登录状态
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/20 hover:shadow-md transition-all duration-200"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900 leading-tight">
            {user.email}
          </p>
          <p className="text-xs text-gray-500 leading-tight">
            使用 {user.usageCount || 0} 次
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 背景遮罩，点击关闭菜单 */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
            {/* 用户信息 */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">角色: {user.role === 'admin' ? '管理员' : '用户'}</p>
                <p className="text-xs text-gray-500">使用 {user.usageCount || 0} 次</p>
              </div>
            </div>
            
            {/* 菜单项 */}
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出登录
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}