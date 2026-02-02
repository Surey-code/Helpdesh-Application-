import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ DATABASE_URL is missing in .env');
  process.exit(1);
}

const isValid = url.startsWith('mysql://') || url.startsWith('postgresql://');
if (!isValid) {
  console.error('❌ DATABASE_URL does not start with mysql:// or postgresql://');
  console.error('Value starts with:', url.substring(0, 10) + '...');
  process.exit(1);
}

console.log('✅ DATABASE_URL is present and has correct protocol');
