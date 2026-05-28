import { useState } from 'react';
import type { MenuItem, MenuOption, CartItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (cartItem: Omit<CartItem, 'id'>) => void;
}

const coffeeImages: Record<string, string> = {
  'americano-ice': '🧊☕',
  'americano-hot': '☕🔥',
  'caffe-latte': '🥛☕',
  'cappuccino': '☕✨',
  'vanilla-latte': '🍦☕',
  'cold-brew': '🧋',
};

export default function MenuCard({ item, onAddToCart }: MenuCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isSoldOut = item.stock === 0;

  const toggleOption = (option: MenuOption) => {
    setSelectedOptions((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  const optionPrice = selectedOptions.reduce((sum, o) => sum + o.price, 0);
  const unitPrice = item.price + optionPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    onAddToCart({ menuItem: item, selectedOptions, quantity });
    setSelectedOptions([]);
    setQuantity(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className={`menu-card ${isSoldOut ? 'sold-out' : ''}`}>
      <div className="menu-image">
        {isSoldOut && <div className="sold-out-badge">품절</div>}
        <span className="menu-emoji">{coffeeImages[item.id] ?? '☕'}</span>
        {item.stock > 0 && item.stock <= 3 && (
          <div className="low-stock-badge">잔여 {item.stock}개</div>
        )}
      </div>

      <div className="menu-info">
        <h3 className="menu-name">{item.name}</h3>
        <p className="menu-price">{item.price.toLocaleString()}원</p>
        <p className="menu-desc">{item.description}</p>

        {item.options.length > 0 && (
          <div className="menu-options">
            <p className="options-label">옵션</p>
            {item.options.map((option) => (
              <label key={option.id} className="option-label">
                <input
                  type="checkbox"
                  checked={selectedOptions.some((o) => o.id === option.id)}
                  onChange={() => toggleOption(option)}
                  disabled={isSoldOut}
                />
                <span>
                  {option.name}
                  {option.price > 0
                    ? ` (+${option.price.toLocaleString()}원)`
                    : ' (무료)'}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="quantity-row">
          <div className="quantity-control">
            <button
              className="qty-btn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isSoldOut}
            >
              −
            </button>
            <span className="qty-value">{quantity}</span>
            <button
              className="qty-btn"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={isSoldOut}
            >
              +
            </button>
          </div>
          <span className="option-total">
            {totalPrice.toLocaleString()}원
          </span>
        </div>

        <button
          className={`add-btn ${added ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={isSoldOut}
        >
          {isSoldOut ? '품절' : added ? '✓ 담겼습니다!' : '장바구니 담기'}
        </button>
      </div>
    </div>
  );
}
