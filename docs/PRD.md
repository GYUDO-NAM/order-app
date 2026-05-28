# 커피 주문 앱

## 1. 프로젝트 개요
커피 주문앱

### 1.2 프로젝트 목적
사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리 할 수 있는 간단한 풀스택 웹 앱

### 1.3 개발 범위 
-주문하기 화면(메뉴 선택 및 장바구니 기능)
-관리자 화면 (재고 관리 및 주문 상태 관리)
-데이터를 생성/조회/수정/삭제할 수 있는 기능

### 2. 기술스팩
-프론트엔드: HTML, CSS, 리액트, 자바스크립트 
-백엔드: Node.js, Express
-데이터베이스 : PostgreSQL
### 3. 기본사항
-프론트엔드와 백엔드를 따로 개발
-기본적인 웹 기술만 사용
-학습 목적이므로 사용자 인증이나 결제 기능은 제외
-메뉴는 커피메뉴만 있음 

### 4. 기능정의
-주문하기 화면
-메뉴선택
-커피 메뉴에는 커피의 이름, 가격, 사진, 설명을 표시 
-세부 옵션도 선택할 수 있게 설정
-옵션과 수량을 선택하고 [담기]를 누르면 장바구니로 이동
-장바구니 
-사용자가 담은 메뉴를 확인할 수 있는 장바구니 표시
-별도의 화면이 아닌 커피메뉴 아래쪽에 표시
-장바구니를 확인한후[주문하기] 버튼을 클릭하면 주문 진행 

### 4.2 기능정의 
-관리자 화면
-재고관리리
-각 메뉴의 재고를 확인하고 수량을 직접 조절
-재고가 0이되면 메뉴화면에 '품절'이라고 표시
-주문관리
-주문 목록을 시간순으로 표시 
-'주문접수'부터'완료' 까지 ㅈ문 처리 과정을 제어 

---

## 5. 백엔드 설계

### 5.1 데이터 모델

#### Menus (메뉴)
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | SERIAL PRIMARY KEY | 메뉴 고유 ID |
| name | VARCHAR(100) | 커피 이름 |
| description | TEXT | 메뉴 설명 |
| price | INTEGER | 가격 (원) |
| image | VARCHAR(255) | 이미지 경로 또는 URL |
| stock | INTEGER | 재고 수량 |

#### Options (옵션)
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | SERIAL PRIMARY KEY | 옵션 고유 ID |
| menu_id | INTEGER (FK) | 연결된 메뉴 ID (Menus.id 참조) |
| name | VARCHAR(100) | 옵션 이름 (예: 샷 추가, 시럽 추가) |
| price | INTEGER | 옵션 추가 가격 (원) |

#### Orders (주문)
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | SERIAL PRIMARY KEY | 주문 고유 ID |
| created_at | TIMESTAMP | 주문 일시 |
| total_price | INTEGER | 주문 총 금액 |
| status | VARCHAR(20) | 주문 상태 (주문접수 / 제조중 / 완료 / 취소) |

#### Order_Items (주문 상세)
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | SERIAL PRIMARY KEY | 주문 상세 고유 ID |
| order_id | INTEGER (FK) | 연결된 주문 ID (Orders.id 참조) |
| menu_id | INTEGER (FK) | 주문한 메뉴 ID (Menus.id 참조) |
| quantity | INTEGER | 주문 수량 |
| unit_price | INTEGER | 주문 당시 단가 (메뉴가격 + 옵션가격) |
| options | JSONB | 선택한 옵션 목록 (옵션명, 가격 스냅샷) |

---

### 5.2 사용자 흐름 (데이터 흐름 기준)

① **메뉴 표시**
- 앱 진입 시 `GET /api/menus` 요청으로 Menus 테이블에서 전체 메뉴와 옵션을 불러옴
- 재고 수량(stock)은 관리자 화면에서만 표시, 일반 화면에서는 재고 0이면 '품절'로만 표시

② **장바구니 담기**
- 사용자가 메뉴와 옵션, 수량을 선택하면 프론트엔드 상태(state)에 장바구니 정보 저장
- 장바구니는 서버에 저장하지 않고 클라이언트(브라우저)에서만 관리

③ **주문하기**
- 장바구니에서 '주문하기' 버튼 클릭 시 `POST /api/orders` 요청
- Orders 테이블에 주문 일시, 총 금액, 상태('주문접수') 저장
- Order_Items 테이블에 주문한 메뉴별 수량, 단가, 옵션 저장
- 주문한 메뉴의 재고(Menus.stock)를 주문 수량만큼 차감

④ **관리자 주문 현황**
- `GET /api/orders` 요청으로 Orders + Order_Items를 시간 역순으로 불러와 표시
- 기본 상태는 '주문접수', 버튼 클릭 시 `PATCH /api/orders/:id/status` 로 상태 변경
- 상태 흐름: 주문접수 → 제조중 → 완료

---

### 5.3 API 설계

#### 메뉴 관련

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | /api/menus | 전체 메뉴 목록과 옵션 조회 |
| PATCH | /api/menus/:id/stock | 메뉴 재고 수량 수정 (관리자) |

#### 주문 관련

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | /api/orders | 새 주문 생성 + 재고 차감 |
| GET | /api/orders | 전체 주문 목록 조회 (시간 역순) |
| GET | /api/orders/:id | 특정 주문 상세 조회 |
| PATCH | /api/orders/:id/status | 주문 상태 변경 (관리자) |

#### API 상세

**GET /api/menus**
- 응답: 전체 메뉴 배열, 각 메뉴에 옵션 배열 포함
```json
[
  {
    "id": 1,
    "name": "아메리카노(ICE)",
    "description": "신선한 에스프레소에 차가운 물을 더한 아메리카노",
    "price": 4000,
    "image": "",
    "stock": 10,
    "options": [
      { "id": 1, "name": "샷 추가", "price": 500 },
      { "id": 2, "name": "시럽 추가", "price": 0 }
    ]
  }
]
```

**POST /api/orders**
- 요청 바디: 주문 항목 배열
```json
{
  "items": [
    {
      "menu_id": 1,
      "quantity": 2,
      "options": [{ "id": 1, "name": "샷 추가", "price": 500 }]
    }
  ]
}
```
- 처리: Orders 생성 → Order_Items 저장 → Menus.stock 차감
- 응답: 생성된 주문 ID와 상태

**GET /api/orders/:id**
- 응답: 해당 주문의 기본 정보 + 주문 상세(메뉴명, 수량, 옵션, 금액) 포함

**PATCH /api/orders/:id/status**
- 요청 바디: `{ "status": "제조중" }`
- 처리: Orders.status 업데이트
- 응답: 업데이트된 주문 정보


