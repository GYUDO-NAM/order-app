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
