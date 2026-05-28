# ☕ COZY - 커피 주문 앱

사용자가 커피 메뉴를 주문하고, 관리자가 주문과 재고를 관리할 수 있는 풀스택 웹 앱입니다.

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| 프론트엔드 | React, TypeScript, Vite |
| 백엔드 | Node.js, Express |
| 데이터베이스 | PostgreSQL |

---

## 프로젝트 구조

```
앱개발/
├── src/                  # 프론트엔드 소스
│   ├── api/              # API 클라이언트 함수
│   ├── components/       # React 컴포넌트
│   │   ├── Header.tsx
│   │   ├── MenuCard.tsx
│   │   ├── CartSection.tsx
│   │   └── AdminPage.tsx
│   ├── types/            # TypeScript 타입 정의
│   ├── App.tsx
│   └── App.css
├── server/               # 백엔드 소스
│   └── src/
│       ├── routes/
│       │   ├── menus.js  # 메뉴 API
│       │   └── orders.js # 주문 API
│       ├── db/
│       │   ├── index.js  # DB 연결
│       │   └── setup.sql # 테이블 생성 SQL
│       └── index.js      # 서버 진입점
├── docs/
│   └── PRD.md            # 기획 문서
└── README.md
```

---

## 시작하기

### 사전 준비

- Node.js 설치
- PostgreSQL 설치 및 실행

### 1단계 - 데이터베이스 설정

pgAdmin 또는 psql에서 아래 순서로 실행합니다.

```sql
-- 1. 데이터베이스 생성
CREATE DATABASE coffee_app;
```

이후 `coffee_app` 데이터베이스에서 `server/src/db/setup.sql` 실행
(첫 줄 `CREATE DATABASE` 구문은 제외하고 실행)

### 2단계 - 백엔드 환경 변수 설정

```bash
cd server
cp .env.example .env
```

`.env` 파일을 열고 PostgreSQL 비밀번호 입력:

```
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_app
DB_USER=postgres
DB_PASSWORD=여기에_비밀번호_입력
```

### 3단계 - 패키지 설치

```bash
# 프론트엔드 (최상위 폴더)
npm install

# 백엔드
cd server
npm install
```

### 4단계 - 실행

터미널을 2개 열고 각각 실행합니다.

```bash
# 터미널 1 - 백엔드 서버 (http://localhost:4000)
cd server
npm run dev
```

```bash
# 터미널 2 - 프론트엔드 (http://localhost:5173)
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 주요 기능

### 주문 화면
- 커피 메뉴 목록 (이름, 가격, 설명, 옵션)
- 옵션 및 수량 선택 후 장바구니 담기
- 장바구니 확인 및 주문하기
- 재고 소진 시 자동 품절 표시

### 관리자 화면
- **재고 관리**: 메뉴별 재고 수량 조절 (즉시 DB 반영)
- **주문 관리**: 실시간 주문 현황 (10초 자동 갱신)
  - 주문접수 → 준비중 → 완료 상태 변경
  - 주문 취소 처리

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | /api/menus | 메뉴 전체 조회 (옵션 포함) |
| PATCH | /api/menus/:id/stock | 재고 수정 |
| POST | /api/orders | 주문 생성 + 재고 차감 |
| GET | /api/orders | 주문 목록 조회 (최신순) |
| GET | /api/orders/:id | 주문 상세 조회 |
| PATCH | /api/orders/:id/status | 주문 상태 변경 |
