import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import menusRouter from './routes/menus.js';
import ordersRouter from './routes/orders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// 라우터
app.use('/api/menus', menusRouter);
app.use('/api/orders', ordersRouter);

// 서버 상태 확인
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '서버가 정상 동작 중입니다.' });
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({ error: '요청한 경로를 찾을 수 없습니다.' });
});

// 전역 에러 처리
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
  console.log(`API 주소: http://localhost:${PORT}/api`);
});
