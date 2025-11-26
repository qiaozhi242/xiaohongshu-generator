// test-db-connection.js
const { connectToDatabase } = require('./lib/db');

async function testConnection() {
  console.log('🔗 测试数据库连接...');
  
  try {
    const database = await connectToDatabase();
    
    if (!database) {
      console.log('❌ 数据库连接返回空值');
      return;
    }
    
    if (!database.db) {
      console.log('❌ 数据库对象为空');
      return;
    }
    
    console.log('✅ 数据库连接成功');
    console.log('数据库类型:', database.client ? 'MongoDB' : '内存数据库');
    
    // 测试用户查找
    const testUser = await database.db.users.findOne({ email: 'test@example.com' });
    console.log('✅ 用户查找测试完成, 结果:', testUser ? '找到用户' : '用户不存在');
    
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error.message);
  }
}

testConnection();