interface HeaderProps {
  currentPage: 'order' | 'admin';
  onNavigate: (page: 'order' | 'admin') => void;
  cartCount: number;
  pendingOrderCount: number;
}

export default function Header({
  currentPage,
  onNavigate,
  cartCount,
  pendingOrderCount,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <h1 className="logo">☕ COZY</h1>
        <nav className="nav">
          <button
            className={`nav-btn ${currentPage === 'order' ? 'active' : ''}`}
            onClick={() => onNavigate('order')}
          >
            주문하기
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
          <button
            className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => onNavigate('admin')}
          >
            관리자
            {pendingOrderCount > 0 && (
              <span className="cart-badge">{pendingOrderCount}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
