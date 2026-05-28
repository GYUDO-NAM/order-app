import type { CartItem } from '../types';

interface CartSectionProps {
  cartItems: CartItem[];
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onOrder: () => void;
}

export default function CartSection({
  cartItems,
  onQuantityChange,
  onRemove,
  onOrder,
}: CartSectionProps) {
  const total = cartItems.reduce((sum, item) => {
    const optionPrice = item.selectedOptions.reduce((s, o) => s + o.price, 0);
    return sum + (item.menuItem.price + optionPrice) * item.quantity;
  }, 0);

  if (cartItems.length === 0) {
    return (
      <section className="cart-section">
        <h2 className="cart-title">장바구니</h2>
        <p className="cart-empty">담긴 메뉴가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="cart-section">
      <h2 className="cart-title">장바구니</h2>
      <div className="cart-body">
        <div className="cart-items">
          {cartItems.map((item) => {
            const optionPrice = item.selectedOptions.reduce((s, o) => s + o.price, 0);
            const itemTotal = (item.menuItem.price + optionPrice) * item.quantity;
            const optionLabel =
              item.selectedOptions.length > 0
                ? ` (${item.selectedOptions.map((o) => o.name).join(', ')})`
                : '';

            return (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">
                    {item.menuItem.name}
                    {optionLabel}
                  </span>
                  <div className="cart-item-qty">
                    <button
                      className="qty-btn small"
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>x {item.quantity}</span>
                    <button
                      className="qty-btn small"
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => onRemove(item.id)}
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <span className="cart-item-price">{itemTotal.toLocaleString()}원</span>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <div className="cart-total">
            <span>총 금액</span>
            <strong>{total.toLocaleString()}원</strong>
          </div>
          <button className="order-btn" onClick={onOrder}>
            주문하기
          </button>
        </div>
      </div>
    </section>
  );
}
