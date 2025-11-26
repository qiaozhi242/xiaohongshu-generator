// test-db-fixed.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// 手动加载 .env.local 文件
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('📁 找到 .env.local 文件');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = envFile.split('\n');
    
    envVars.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
    console.log('✅ 环境变量加载成功');
  } else {
    console.log('❌ 没有找到 .env.local 文件');
    console.log('请确认文件路径:', envPath);
  }
}

async function testConnection() {
  // 加载环境变量
  loadEnvFile();
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('❌ 错误: 没有找到 MONGODB_URI 环境变量');
    console.log('当前加载的环境变量:');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
    console.log('- INVITATION_CODE:', process.env.INVITATION_CODE ? '已设置' : '未设置');
    return;
  }

  console.log('🔗 测试 MongoDB 连接...');
  // 隐藏密码显示
  const safeUri = uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)/, 'mongodb+srv://$1:****@');
  console.log('连接字符串:', safeUri);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ MongoDB 连接成功!');
    
    // 测试数据库操作
    const db = client.db('xiaohongshu_app');
    
    // 尝试创建用户集合（如果不存在）
    const usersCollection = db.collection('users');
    
    // 插入测试数据
    const testUser = {
      email: 'test@example.com',
      password: 'test123',
      createdAt: new Date(),
      role: 'user',
      usageCount: 0
    };
    
    const result = await usersCollection.insertOne(testUser);
    console.log('✅ 数据库写入测试成功, 插入ID:', result.insertedId);
    
    // 读取测试数据
    const foundUser = await usersCollection.findOne({ email: 'test@example.com' });
    console.log('✅ 数据库读取测试成功, 找到用户:', foundUser.email);
    
    // 清理测试数据
    await usersCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ 测试数据清理完成');
    
    // 显示数据库中的集合
    const collections = await db.listCollections().toArray();
    console.log('📊 数据库中的集合:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB 连接失败:');
    console.error('错误信息:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('💡 提示: 请检查数据库用户名和密码是否正确');
    } else if (error.message.includes('getaddrinfo')) {
      console.log('💡 提示: 网络连接问题，请检查网络或集群地址');
    } else if (error.message.includes('bad auth')) {
      console.log('💡 提示: 认证失败，请检查数据库用户权限');
    } else if (error.message.includes('server selection')) {
      console.log('💡 提示: 无法连接到MongoDB集群，请检查网络或集群状态');
    } else if (error.message.includes('password')) {
      console.log('💡 提示: 密码错误或包含特殊字符需要URL编码');
    }
  } finally {
    await client.close();
  }
}

testConnection();