import { useState } from 'react';
import Header from './components/Header';
import MenuCard from './components/MenuCard';
import CartSection from './components/CartSection';
import AdminPage from './components/AdminPage';
import type { CartItem, MenuItem, MenuOption, Order, OrderStatus } from './types';
import { menuData } from './data/menuData';
import './App.css';

type Page = 'order' | 'admin';

let cartIdCounter = 0;
let orderIdCounter = 0;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('order');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>(menuData);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderMessage, setOrderMessage] = useState('');

  const handleAddToCart = (item: Omit<CartItem, 'id'>) => {
    const existingIndex = cartItems.findIndex(
      (c) =>
        c.menuItem.id === item.menuItem.id &&
        JSON.stringify(c.selectedOptions.map((o) => o.id).sort()) ===
          JSON.stringify(item.selectedOptions.map((o: MenuOption) => o.id).sort())
    );

    if (existingIndex >= 0) {
      setCartItems((prev) =>
        prev.map((c, i) =>
          i === existingIndex ? { ...c, quantity: c.quantity + item.quantity } : c
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        { ...item, id: `cart-${++cartIdCounter}` },
      ]);
    }
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quantity } : c))
    );
  };

  const handleRemove = (id: string) => {
    setCartItems((prev) => prev.filter((c) => c.id !== id));
  };

  const handleOrder = () => {
    if (cartItems.length === 0) return;
    const total = cartItems.reduce((sum, item) => {
      const optionPrice = item.selectedOptions.reduce((s, o) => s + o.price, 0);
      return sum + (item.menuItem.price + optionPrice) * item.quantity;
    }, 0);

    const newOrder: Order = {
      id: `order-${++orderIdCounter}`,
      items: [...cartItems],
      total,
      status: '주문접수',
      createdAt: new Date(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setOrderMessage(`주문이 완료되었습니다! 총 ${total.toLocaleString()}원`);
    setCartItems([]);
    setTimeout(() => setOrderMessage(''), 3000);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleUpdateStock = (menuId: string, newStock: number) => {
    setMenu((prev) =>
      prev.map((m) => (m.id === menuId ? { ...m, stock: newStock } : m))
    );
  };

  return (
    <div className="app">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        cartCount={cartItems.reduce((s, c) => s + c.quantity, 0)}
        pendingOrderCount={orders.filter((o) => o.status === '주문접수' || o.status === '준비중').length}
      />

      {currentPage === 'order' && (
        <main className="main">
          {orderMessage && (
            <div className="order-toast">{orderMessage}</div>
          )}

          <section className="menu-section">
            <h2 className="section-title">메뉴</h2>
            <div className="menu-grid">
              {menu.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>

          <CartSection
            cartItems={cartItems}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            onOrder={handleOrder}
          />
        </main>
      )}

      {currentPage === 'admin' && (
        <main className="main">
          <AdminPage
            menu={menu}
            orders={orders}
            onUpdateStock={handleUpdateStock}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </main>
      )}
    </div>
  );
}
