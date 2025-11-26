// lib/db.js - 修复版数据库连接
let client;
let clientPromise;

// 内存数据库作为备用
let memoryUsers = [];
let nextId = 1;

const memoryDB = {
  users: {
    findOne: async (query) => {
      if (query.email) {
        return memoryUsers.find(user => user.email === query.email) || null;
      }
      if (query._id) {
        return memoryUsers.find(user => user._id === query._id) || null;
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
      console.log('💾 使用内存数据库存储用户:', newUser.email);
      return { insertedId: newUser._id };
    },
    
    updateOne: async (filter, update) => {
      const userIndex = memoryUsers.findIndex(user => {
        if (filter.email) return user.email === filter.email;
        if (filter._id) return user._id === filter._id;
        return false;
      });
      
      if (userIndex !== -1) {
        if (update.$set) {
          memoryUsers[userIndex] = { ...memoryUsers[userIndex], ...update.$set };
        }
        if (update.$inc) {
          if (update.$inc.usageCount) {
            memoryUsers[userIndex].usageCount = (memoryUsers[userIndex].usageCount || 0) + update.$inc.usageCount;
          }
        }
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    },
    
    countDocuments: async () => {
      return memoryUsers.length;
    }
  }
};

async function connectToMongoDB() {
  try {
    const { MongoClient } = await import('mongodb');
    
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI 环境变量未设置');
    }

    console.log('🔗 尝试连接 MongoDB...');
    const options = {};

    if (process.env.NODE_ENV === 'development') {
      // 开发模式下使用全局变量
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      // 生产模式
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }

    const connectedClient = await clientPromise;
    console.log('✅ MongoDB 连接成功');
    return connectedClient;
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    throw error;
  }
}

export async function connectToDatabase() {
  try {
    // 尝试连接 MongoDB
    const client = await connectToMongoDB();
    const db = client.db('xiaohongshu_app');
    
    // 测试数据库操作
    await db.command({ ping: 1 });
    console.log('✅ 数据库操作测试成功');
    
    return { db, client };
  } catch (error) {
    console.log('⚠️ 使用内存数据库:', error.message);
    // 返回内存数据库
    return { 
      db: memoryDB,
      client: null 
    };
  }
}

// 导出内存数据库用于调试
export function getMemoryDBStats() {
  return {
    userCount: memoryUsers.length,
    users: memoryUsers.map(u => ({ email: u.email, role: u.role }))
  };
}