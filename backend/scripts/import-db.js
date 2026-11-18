const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'amules';
const inputDir = path.resolve(__dirname, '../../amules-database');

function parseMongoDoc(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  if (Array.isArray(doc)) return doc.map(parseMongoDoc);

  const res = {};
  for (const [key, value] of Object.entries(doc)) {
    if (value && typeof value === 'object') {
      if (value.$oid && typeof value.$oid === 'string') {
        try {
          res[key] = new ObjectId(value.$oid);
          continue;
        } catch (e) {
          res[key] = value.$oid;
          continue;
        }
      }
      if (value.$date) {
        res[key] = new Date(value.$date);
        continue;
      }
      res[key] = parseMongoDoc(value);
    } else if (key === '_id' && typeof value === 'string' && value.length === 24 && /^[0-9a-fA-F]{24}$/.test(value)) {
      try {
        res[key] = new ObjectId(value);
      } catch (e) {
        res[key] = value;
      }
    } else {
      res[key] = value;
    }
  }
  return res;
}

async function importDatabase() {
  console.log(`Connecting to MongoDB at ${uri}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    if (!fs.existsSync(inputDir)) {
      console.error(`Thư mục ${inputDir} không tồn tại!`);
      return;
    }

    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));
    console.log(`Bắt đầu nạp ${files.length} collections từ amules-database vào MongoDB '${dbName}':\n`);

    for (const file of files) {
      const colName = path.basename(file, '.json');
      const filePath = path.join(inputDir, file);

      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        let docs = JSON.parse(raw);
        if (!Array.isArray(docs)) {
          docs = [docs];
        }

        if (docs.length > 0) {
          const parsedDocs = docs.map(parseMongoDoc);
          // Làm mới collection với dữ liệu mới nhất
          await db.collection(colName).deleteMany({});
          await db.collection(colName).insertMany(parsedDocs);
          console.log(`  ✓ Đã nạp ${parsedDocs.length} bản ghi vào collection '${colName}'`);
        } else {
          console.log(`  - '${colName}': file rỗng (bỏ qua)`);
        }
      } catch (err) {
        console.error(`  ✗ Lỗi nạp '${colName}':`, err.message);
      }
    }

    console.log(`\n🎉 ĐỒNG BỘ DỮ LIỆU THÀNH CÔNG! MongoDB trên máy đã có đầy đủ dữ liệu mới nhất.`);
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error.message);
  } finally {
    await client.close();
  }
}

importDatabase();
