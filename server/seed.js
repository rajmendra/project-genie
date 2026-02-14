import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Branch from './models/Branch.js';
import Partner from './models/Partner.js';
import Wallet from './models/Wallet.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Branch.deleteMany({});
  await Partner.deleteMany({});
  await Wallet.deleteMany({});

  const branches = await Branch.insertMany([
    { code: 'BR001', name: 'Downtown Fitness Hub' },
    { code: 'BR002', name: 'Uptown Wellness Center' },
    { code: 'BR003', name: 'Eastside Gym' },
  ]);
  console.log('Branches seeded');

  const partner = await Partner.create({
    vendorCode: 'GF001',
    password: 'password123',
    name: 'Rajesh Kumar',
    branches: branches.map((b) => b._id),
  });
  console.log('Partner seeded:', partner.vendorCode);

  for (const branch of branches) {
    await Wallet.create({
      partner: partner._id,
      branch: branch._id,
      balance: Math.floor(Math.random() * 50000) + 10000,
    });
  }
  console.log('Wallets seeded');

  console.log('\nLogin credentials:');
  console.log('Vendor Code: GF001');
  console.log('Password: password123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
