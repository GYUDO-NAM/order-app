import { Router } from 'express';
import pool from '../db/index.js';

const router = Router();

// GET /api/orders - 전체 주문 목록 조회 (최신순)
router.get('/', async (req, res) => {
  try {
    const ordersResult = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );

    const itemsResult = await pool.query(`
      SELECT
        oi.*,
        m.name AS menu_name,
        m.price AS menu_price
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      ORDER BY oi.order_id ASC
    `);

    const orders = ordersResult.rows.map((order) => ({
      ...order,
      items: itemsResult.rows.filter((item) => item.order_id === order.id),
    }));

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '주문 목록 조회 중 오류가 발생했습니다.' });
  }
});

// GET /api/orders/:id - 특정 주문 상세 조회
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    }

    const itemsResult = await pool.query(
      `SELECT
        oi.*,
        m.name AS menu_name,
        m.price AS menu_price
       FROM order_items oi
       JOIN menus m ON oi.menu_id = m.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '주문 조회 중 오류가 발생했습니다.' });
  }
});

// POST /api/orders - 새 주문 생성 + 재고 차감
router.post('/', async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: '주문 항목이 없습니다.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 재고 확인 및 차감
    for (const item of items) {
      const menuResult = await client.query(
        'SELECT stock FROM menus WHERE id = $1 FOR UPDATE',
        [item.menu_id]
      );

      if (menuResult.rows.length === 0) {
        throw new Error(`메뉴(id: ${item.menu_id})를 찾을 수 없습니다.`);
      }

      const currentStock = menuResult.rows[0].stock;
      if (currentStock < item.quantity) {
        throw new Error(`재고가 부족합니다. (현재 재고: ${currentStock}개)`);
      }

      await client.query(
        'UPDATE menus SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.menu_id]
      );
    }

    // 총 금액 계산
    const total_price = items.reduce((sum, item) => {
      const optionPrice = (item.options || []).reduce(
        (s, o) => s + (o.price || 0),
        0
      );
      return sum + (item.unit_price || 0) * item.quantity;
    }, 0);

    // 주문 생성
    const orderResult = await client.query(
      `INSERT INTO orders (total_price, status)
       VALUES ($1, '주문접수')
       RETURNING *`,
      [total_price]
    );

    const order = orderResult.rows[0];

    // 주문 상세 저장
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, unit_price, options)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          order.id,
          item.menu_id,
          item.quantity,
          item.unit_price,
          JSON.stringify(item.options || []),
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: '주문이 완료되었습니다.',
      order_id: order.id,
      status: order.status,
      total_price: order.total_price,
      created_at: order.created_at,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ error: err.message || '주문 처리 중 오류가 발생했습니다.' });
  } finally {
    client.release();
  }
});

// PATCH /api/orders/:id/status - 주문 상태 변경 (관리자)
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['주문접수', '준비중', '완료', '취소'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: '올바른 주문 상태가 아닙니다.' });
  }

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '주문 상태 변경 중 오류가 발생했습니다.' });
  }
});

export default router;
