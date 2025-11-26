// test-db.js
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ 错误: 没有找到 MONGODB_URI 环境变量');
    console.log('请检查你的 .env.local 文件是否包含 MONGODB_URI');
    return;
  }

  console.log('🔗 测试 MongoDB 连接...');
  console.log('连接字符串:', uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)/, 'mongodb+srv://$1:****@'));

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ MongoDB 连接成功!');
    
    // 测试数据库操作
    const db = client.db('xiaohongshu_app');
    const users = db.collection('users');
    
    // 尝试插入测试数据
    const testUser = {
      email: 'test@example.com',
      password: 'test123',
      createdAt: new Date()
    };
    
    const result = await users.insertOne(testUser);
    console.log('✅ 数据库操作测试成功, 插入ID:', result.insertedId);
    
    // 清理测试数据
    await users.deleteOne({ _id: result.insertedId });
    console.log('✅ 测试数据清理完成');
    
  } catch (error) {
    console.error('❌ MongoDB 连接失败:');
    console.error('错误信息:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('💡 提示: 请检查数据库用户名和密码是否正确');
    } else if (error.message.includes('getaddrinfo')) {
      console.log('💡 提示: 网络连接问题，请检查网络或集群地址');
    } else if (error.message.includes('bad auth')) {
      console.log('💡 提示: 认证失败，请检查数据库用户权限');
    }
  } finally {
    await client.close();
  }
}

testConnection();