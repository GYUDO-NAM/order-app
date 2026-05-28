import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Render는 DATABASE_URL 하나로 제공, 로컬은 개별 환경 변수 사용
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

pool.on('connect', () => {
  console.log('PostgreSQL 데이터베이스 연결 성공');
});

pool.on('error', (err) => {
  console.error('데이터베이스 연결 오류:', err);
  process.exit(1);
});

export default pool;
