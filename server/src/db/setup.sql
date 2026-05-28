-- 1. 데이터베이스 생성 (pgAdmin Query Tool에서 postgres DB 선택 후 실행)
CREATE DATABASE coffee_app;

-- ⬇ 아래는 coffee_app 데이터베이스로 바꾸고 실행하세요 ⬇

-- 2. 메뉴 테이블
CREATE TABLE menus (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,
  image       VARCHAR(255) DEFAULT '',
  stock       INTEGER NOT NULL DEFAULT 0
);

-- 3. 옵션 테이블
CREATE TABLE options (
  id      SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name    VARCHAR(100) NOT NULL,
  price   INTEGER NOT NULL DEFAULT 0
);

-- 4. 주문 테이블
CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  total_price INTEGER NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT '주문접수',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. 주문 상세 테이블
CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id    INTEGER NOT NULL REFERENCES menus(id),
  quantity   INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  options    JSONB DEFAULT '[]'
);

-- 6. 샘플 메뉴 데이터
INSERT INTO menus (name, description, price, stock) VALUES
  ('아메리카노(ICE)', '신선한 에스프레소에 차가운 물을 더한 시원한 아메리카노입니다.', 4000, 10),
  ('아메리카노(HOT)', '진한 에스프레소와 뜨거운 물이 만나는 따뜻한 아메리카노입니다.', 4000, 10),
  ('카페라떼', '부드러운 스팀밀크와 에스프레소가 조화로운 카페라떼입니다.', 5000, 8),
  ('카푸치노', '에스프레소, 스팀밀크, 풍성한 우유 거품이 층층이 쌓인 카푸치노입니다.', 5000, 6),
  ('바닐라라떼', '달콤한 바닐라 향과 부드러운 라떼가 어우러진 인기 메뉴입니다.', 5500, 7),
  ('콜드브루', '저온에서 장시간 추출한 부드럽고 깊은 풍미의 콜드브루입니다.', 5500, 0);

-- 7. 샘플 옵션 데이터
INSERT INTO options (menu_id, name, price) VALUES
  (1, '샷 추가', 500), (1, '시럽 추가', 0),
  (2, '샷 추가', 500), (2, '시럽 추가', 0),
  (3, '샷 추가', 500), (3, '시럽 추가', 0),
  (4, '샷 추가', 500), (4, '시럽 추가', 0),
  (5, '샷 추가', 500), (5, '시럽 추가', 0), (5, '바닐라 시럽 추가', 300),
  (6, '샷 추가', 500), (6, '시럽 추가', 0);
