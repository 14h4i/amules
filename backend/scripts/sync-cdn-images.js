const fs = require('fs');
const { MongoClient } = require('d:/webnc/amules/backend/node_modules/mongodb');

// 1. Update themes.json
const themeImages = {
  'tinh-yeu-ket-noi': 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg',
  'binh-an-can-bang': 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg',
  'tu-tin-toa-sang': 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg',
  'may-man-co-hoi': 'https://i.pinimg.com/1200x/d9/7e/2f/d97e2f5138a3f151bb55613e38f15350.jpg',
  'chua-lanh-thu-gian': 'https://i.pinimg.com/1200x/19/ae/48/19ae4807b1c9b47d2cf7ad70fef19fbb.jpg',
  'tinh-ban-gan-ket': 'https://i.pinimg.com/736x/b3/cf/e0/b3cfe07a389a61eaa7b0f186da90da4f.jpg',
  'nang-luong-sang-tao': 'https://i.pinimg.com/736x/f8/c8/db/f8c8dbe300b276861a7e7feb87c9e4fe.jpg',
  'qua-tang-y-nghia': 'https://i.pinimg.com/736x/9b/9f/9f/9b9f9f152363271f0c154f437b34def0.jpg'
};

const themes = JSON.parse(fs.readFileSync('d:/webnc/amules/amules-database/themes.json', 'utf8'));
themes.forEach(t => {
  const img = themeImages[t.slug] || 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg';
  t.bannerImage = img;
  t.coverImage = img;
  t.image = img;
});
fs.writeFileSync('d:/webnc/amules/amules-database/themes.json', JSON.stringify(themes, null, 2), 'utf8');
console.log('Updated themes.json with CDN images');

// 2. Update products.json
const prods = JSON.parse(fs.readFileSync('d:/webnc/amules/amules-database/products.json', 'utf8'));
prods.forEach(p => {
  if (!p.images || !p.images.length || (p.images[0] && p.images[0].startsWith('images/'))) {
    p.images = ['https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg'];
  }
  if (!p.image || p.image.startsWith('images/')) {
    p.image = p.images[0];
  }
});
fs.writeFileSync('d:/webnc/amules/amules-database/products.json', JSON.stringify(prods, null, 2), 'utf8');
console.log('Updated products.json with CDN images');

// 3. Sync to MongoDB
async function syncMongo() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('amules');
  for (const t of themes) {
    await db.collection('themes').updateOne(
      { slug: t.slug },
      { $set: { bannerImage: t.bannerImage, coverImage: t.coverImage, image: t.image } }
    );
  }
  for (const p of prods) {
    await db.collection('products').updateOne(
      { productCode: p.productCode },
      { $set: { image: p.image, images: p.images } }
    );
  }
  console.log('MongoDB themes & products updated successfully!');
  await client.close();
}
syncMongo().catch(err => console.error('Mongo sync error:', err.message));
