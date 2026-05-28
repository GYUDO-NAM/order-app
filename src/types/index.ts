export interface MenuOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  options: MenuOption[];
  stock: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  selectedOptions: MenuOption[];
  quantity: number;
}

export type OrderStatus = '주문접수' | '준비중' | '완료' | '취소';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

// DB에서 받아오는 주문 타입 (관리자 화면용)
export interface ApiOrderItem {
  id: number;
  order_id: number;
  menu_id: number;
  menu_name: string;
  quantity: number;
  unit_price: number;
  options: MenuOption[];
}

export interface ApiOrder {
  id: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  items: ApiOrderItem[];
}
