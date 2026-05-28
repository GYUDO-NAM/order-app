import type { MenuItem, CartItem, OrderStatus, ApiOrder } from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '요청에 실패했습니다.');
  return data as T;
}

// ── 메뉴 ──────────────────────────────────────
export async function fetchMenus(): Promise<MenuItem[]> {
  const data = await request<any[]>('/menus');
  return data.map((m) => ({
    id: String(m.id),
    name: m.name,
    description: m.description,
    price: m.price,
    image: m.image ?? '',
    stock: m.stock,
    options: (m.options ?? []).map((o: any) => ({
      id: String(o.id),
      name: o.name,
      price: o.price,
    })),
  }));
}

export async function updateMenuStock(menuId: string, stock: number): Promise<void> {
  await request(`/menus/${menuId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  });
}

// ── 주문 ──────────────────────────────────────
export async function createOrder(cartItems: CartItem[]): Promise<{ order_id: number; total_price: number }> {
  const items = cartItems.map((c) => {
    const optionPrice = c.selectedOptions.reduce((s, o) => s + o.price, 0);
    return {
      menu_id: Number(c.menuItem.id),
      quantity: c.quantity,
      unit_price: c.menuItem.price + optionPrice,
      options: c.selectedOptions,
    };
  });
  return request('/orders', { method: 'POST', body: JSON.stringify({ items }) });
}

export async function fetchOrders(): Promise<ApiOrder[]> {
  const data = await request<any[]>('/orders');
  return data.map((o) => ({
    id: o.id,
    total_price: o.total_price,
    status: o.status as OrderStatus,
    created_at: o.created_at,
    items: (o.items ?? []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      menu_id: item.menu_id,
      menu_name: item.menu_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      options: item.options ?? [],
    })),
  }));
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  await request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
