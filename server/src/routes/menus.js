import { Router } from 'express';
import pool from '../db/index.js';

const router = Router();

// GET /api/menus - 전체 메뉴 목록 (옵션 포함) 조회
router.get('/', async (req, res) => {
  try {
    const menusResult = await pool.query(
      'SELECT * FROM menus ORDER BY id ASC'
    );

    const optionsResult = await pool.query(
      'SELECT * FROM options ORDER BY menu_id ASC, id ASC'
    );

    const menus = menusResult.rows.map((menu) => ({
      ...menu,
      options: optionsResult.rows.filter((opt) => opt.menu_id === menu.id),
    }));

    res.json(menus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '메뉴 조회 중 오류가 발생했습니다.' });
  }
});

// PATCH /api/menus/:id/stock - 메뉴 재고 수정 (관리자)
router.patch('/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: '올바른 재고 수량을 입력해주세요.' });
  }

  try {
    const result = await pool.query(
      'UPDATE menus SET stock = $1 WHERE id = $2 RETURNING *',
      [stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '재고 수정 중 오류가 발생했습니다.' });
  }
});

export default router;
