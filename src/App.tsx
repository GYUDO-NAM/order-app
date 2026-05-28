import { useState, useEffect } from 'react';
import Header from './components/Header';
import MenuCard from './components/MenuCard';
import CartSection from './components/CartSection';
import AdminPage from './components/AdminPage';
import type { CartItem, MenuItem, MenuOption } from './types';
import { fetchMenus, createOrder } from './api';
import './App.css';

type Page = 'order' | 'admin';

let cartIdCounter = 0;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('order');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    fetchMenus()
      .then(setMenu)
      .catch(() => setOrderError('메뉴를 불러오지 못했습니다. 서버를 확인해주세요.'))
      .finally(() => setLoading(false));
  }, []);

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

  const handleOrder = async () => {
    if (cartItems.length === 0) return;
    try {
      const result = await createOrder(cartItems);
      const total = result.total_price;
      setOrderMessage(`주문 완료! 총 ${total.toLocaleString()}원 (주문번호 #${result.order_id})`);
      setCartItems([]);

      // 재고 반영을 위해 메뉴 다시 불러오기
      fetchMenus().then(setMenu).catch(() => {});

      setTimeout(() => setOrderMessage(''), 4000);
    } catch (err: any) {
      setOrderError(err.message || '주문에 실패했습니다.');
      setTimeout(() => setOrderError(''), 3000);
    }
  };

  return (
    <div className="app">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        cartCount={cartItems.reduce((s, c) => s + c.quantity, 0)}
        pendingOrderCount={0}
      />

      {currentPage === 'order' && (
        <main className="main">
          {orderMessage && <div className="order-toast">{orderMessage}</div>}
          {orderError && <div className="order-toast error">{orderError}</div>}

          <section className="menu-section">
            <h2 className="section-title">메뉴</h2>
            {loading ? (
              <div className="loading">메뉴를 불러오는 중...</div>
            ) : (
              <div className="menu-grid">
                {menu.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
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
          <AdminPage menu={menu} onMenuUpdated={setMenu} />
        </main>
      )}
    </div>
  );
}
