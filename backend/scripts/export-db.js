const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'amules';
const outputDir = path.resolve(__dirname, '../../amules-database');

async function exportDatabase() {
  console.log(`Connecting to MongoDB at ${uri}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`Exporting ${collections.length} collections from database '${dbName}' into:`);
    console.log(outputDir);

    for (const col of collections) {
      const name = col.name;
      if (name.startsWith('system.')) continue;

      const docs = await db.collection(name).find({}).toArray();
      const filePath = path.join(outputDir, `${name}.json`);

      // Ghi ra file JSON định dạng chuẩn đẹp
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');
      console.log(`  ✓ ${name}.json (${docs.length} bản ghi)`);
    }

    console.log('\n Đồng bộ dữ liệu từ MongoDB sang amules-database hoàn tất!');
  } catch (error) {
    console.error(' Lỗi khi xuất database:', error.message);
  } finally {
    await client.close();
  }
}

exportDatabase();
