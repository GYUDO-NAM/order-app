import { useState, useEffect, useCallback } from 'react';
import type { MenuItem, ApiOrder, OrderStatus } from '../types';
import { fetchMenus, updateMenuStock, fetchOrders, updateOrderStatus } from '../api';

interface AdminPageProps {
  menu: MenuItem[];
  onMenuUpdated: (menus: MenuItem[]) => void;
}

type AdminTab = 'stock' | 'orders';

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  '주문접수': '준비중',
  '준비중': '완료',
  '완료': null,
  '취소': null,
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  '주문접수': '주문접수',
  '준비중': '준비중',
  '완료': '완료',
  '취소': '취소',
};

const coffeeEmoji: Record<string, string> = {
  'americano-ice': '🧊☕',
  'americano-hot': '☕🔥',
  'caffe-latte': '🥛☕',
  'cappuccino': '☕✨',
  'vanilla-latte': '🍦☕',
  'cold-brew': '🧋',
};

function getEmoji(name: string): string {
  if (name.includes('ICE') || name.includes('아이스')) return '🧊☕';
  if (name.includes('HOT') || name.includes('핫')) return '☕🔥';
  if (name.includes('콜드브루')) return '🧋';
  if (name.includes('바닐라')) return '🍦☕';
  if (name.includes('카푸치노')) return '☕✨';
  if (name.includes('라떼')) return '🥛☕';
  return '☕';
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function AdminPage({ menu, onMenuUpdated }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('stock');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch {
      // 조용히 실패
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const pendingCount = orders.filter(
    (o) => o.status === '주문접수' || o.status === '준비중'
  ).length;

  const handleUpdateStock = async (menuId: string, newStock: number) => {
    try {
      await updateMenuStock(menuId, newStock);
      const updated = await fetchMenus();
      onMenuUpdated(updated);
    } catch (err: any) {
      alert(err.message || '재고 수정에 실패했습니다.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (err: any) {
      alert(err.message || '상태 변경에 실패했습니다.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2 className="admin-title">관리자</h2>
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            재고 관리
          </button>
          <button
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            주문 관리
            {pendingCount > 0 && (
              <span className="admin-badge">{pendingCount}</span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <StockPanel menu={menu} onUpdateStock={handleUpdateStock} />
      )}
      {activeTab === 'orders' && (
        <OrdersPanel
          orders={orders}
          loading={ordersLoading}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onRefresh={loadOrders}
        />
      )}
    </div>
  );
}

function StockPanel({
  menu,
  onUpdateStock,
}: {
  menu: MenuItem[];
  onUpdateStock: (menuId: string, newStock: number) => void;
}) {
  return (
    <div className="admin-panel">
      <p className="admin-panel-desc">
        메뉴별 재고 수량을 조절하세요. 재고가 0이 되면 주문 화면에 '품절'로 표시됩니다.
      </p>
      <div className="stock-list">
        {menu.map((item) => (
          <div key={item.id} className="stock-item">
            <div className="stock-item-left">
              <span className="stock-emoji">
                {coffeeEmoji[item.id] ?? getEmoji(item.name)}
              </span>
              <div className="stock-item-info">
                <span className="stock-item-name">{item.name}</span>
                <span className="stock-item-price">{item.price.toLocaleString()}원</span>
              </div>
            </div>
            <div className="stock-item-right">
              {item.stock === 0 && (
                <span className="stock-sold-out-tag">품절</span>
              )}
              <div className="stock-control">
                <button
                  className="stock-btn"
                  onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                  disabled={item.stock === 0}
                >
                  −
                </button>
                <span className="stock-value">{item.stock}</span>
                <button
                  className="stock-btn"
                  onClick={() => onUpdateStock(item.id, item.stock + 1)}
                >
                  +
                </button>
              </div>
              <div className="stock-preset">
                {[5, 10, 20].map((n) => (
                  <button
                    key={n}
                    className="stock-preset-btn"
                    onClick={() => onUpdateStock(item.id, n)}
                  >
                    {n}개
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersPanel({
  orders,
  loading,
  onUpdateOrderStatus,
  onRefresh,
}: {
  orders: ApiOrder[];
  loading: boolean;
  onUpdateOrderStatus: (orderId: number, status: OrderStatus) => void;
  onRefresh: () => void;
}) {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  const filtered =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const statusCounts = orders.reduce(
    (acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; },
    {} as Record<OrderStatus, number>
  );

  return (
    <div className="admin-panel">
      <div className="orders-toolbar">
        <div className="orders-filter-bar">
          {(['all', '주문접수', '준비중', '완료', '취소'] as const).map((s) => {
            const label = s === 'all'
              ? `전체 (${orders.length})`
              : `${STATUS_LABEL[s]} (${statusCounts[s] ?? 0})`;
            return (
              <button
                key={s}
                className={`filter-btn ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {label}
              </button>
            );
          })}
        </div>
        <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
          {loading ? '⟳' : '새로고침'}
        </button>
      </div>

      {orders.length === 0 && !loading && (
        <div className="orders-empty">
          <span className="orders-empty-icon">📋</span>
          <p>아직 접수된 주문이 없습니다.</p>
        </div>
      )}

      <div className="orders-list">
        {filtered.length === 0 && orders.length > 0 && (
          <p className="orders-empty-small">해당 상태의 주문이 없습니다.</p>
        )}
        {filtered.map((order) => {
          const nextStatus = STATUS_FLOW[order.status];
          return (
            <div
              key={order.id}
              className={`order-card status-${order.status}`}
            >
              <div className="order-card-header">
                <div className="order-card-meta">
                  <span className="order-id">주문 #{order.id}</span>
                  <span className="order-time">
                    {formatDate(order.created_at)} {formatTime(order.created_at)}
                  </span>
                </div>
                <span className={`order-status-badge badge-${order.status}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </div>

              <div className="order-items-list">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <span className="order-item-name">
                      {item.menu_name}
                      {item.options.length > 0 && (
                        <span className="order-item-options">
                          {' '}({item.options.map((o) => o.name).join(', ')})
                        </span>
                      )}
                    </span>
                    <span className="order-item-qty">x{item.quantity}</span>
                    <span className="order-item-price">
                      {(item.unit_price * item.quantity).toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <span className="order-total">
                  합계 <strong>{order.total_price.toLocaleString()}원</strong>
                </span>
                <div className="order-actions">
                  {order.status !== '완료' && order.status !== '취소' && (
                    <button
                      className="order-cancel-btn"
                      onClick={() => onUpdateOrderStatus(order.id, '취소')}
                    >
                      취소
                    </button>
                  )}
                  {nextStatus && (
                    <button
                      className="order-next-btn"
                      onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                    >
                      {nextStatus === '준비중' ? '준비 시작' : '완료 처리'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
