// test-db-detail.js
const { MongoClient } = require('mongodb');

// 测试不同的连接字符串
const testCases = [
  {
    name: "当前密码（未编码）",
    uri: "mongodb+srv://qiaozhi242_db_user:db_IuKo7IXZ2P3BWfx0@qiaozhi242.1qpmfsn.mongodb.net/xiaohongshu_app?retryWrites=true&w=majority&appName=qiaozhi242"
  },
  {
    name: "URL编码密码",
    uri: "mongodb+srv://qiaozhi242_db_user:db%5FIuKo7IXZ2P3BWfx0@qiaozhi242.1qpmfsn.mongodb.net/xiaohongshu_app?retryWrites=true&w=majority&appName=qiaozhi242"
  }
];

async function testConnection(uri, testName) {
  console.log(`\n🧪 测试: ${testName}`);
  console.log('连接字符串:', uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)/, 'mongodb+srv://$1:****@'));

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ 连接成功!');
    
    const db = client.db('xiaohongshu_app');
    
    // 测试基本操作
    const collections = await db.listCollections().toArray();
    console.log('📊 数据库集合:', collections.map(c => c.name));
    
    return true;
  } catch (error) {
    console.log('❌ 连接失败:');
    console.log('   错误代码:', error.code);
    console.log('   错误信息:', error.message);
    
    if (error.message.includes('auth') || error.code === 8000) {
      console.log('   💡 建议: 密码可能需要URL编码或重置');
    }
    
    return false;
  } finally {
    await client.close();
  }
}

async function runAllTests() {
  console.log('🚀 开始 MongoDB 连接测试...\n');
  
  let successCount = 0;
  
  for (const testCase of testCases) {
    const success = await testConnection(testCase.uri, testCase.name);
    if (success) successCount++;
  }
  
  console.log(`\n📊 测试结果: ${successCount}/${testCases.length} 通过`);
  
  if (successCount === 0) {
    console.log('\n🔧 建议解决方案:');
    console.log('1. 在 MongoDB Atlas 中重置密码为纯字母数字');
    console.log('2. 确认数据库用户有正确权限');
    console.log('3. 检查网络连接和IP白名单');
  }
}

runAllTests();