import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // thêm import

const AppHeader = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext); // lấy theme và toggle
  const navigate = useNavigate();
  const [showRankingMenu, setShowRankingMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: theme === 'light' ? '#333' : '#222', // đổi màu theo theme
        color: 'white',
      }}
    >
      <div className="logo">
        <Link
          to="/"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          Anime App
        </Link>
      </div>

      <nav>
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <li style={{ marginRight: '15px' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Trang chủ
            </Link>
          </li>

          {/* Chức năng xếp hạng anime */}
          <li
            style={{ position: 'relative', marginRight: '15px' }}
            onClick={() => setShowRankingMenu(!showRankingMenu)}
          >
            <span style={{ color: 'white', cursor: 'pointer' }}>Xếp hạng ▾</span>

            {showRankingMenu && (
              <ul
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: '#444',
                  padding: '10px',
                  listStyle: 'none',
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '4px',
                  zIndex: 1000,
                }}
              >
                <li style={{ marginBottom: '5px' }}>
                  <Link
                    to="/top-rated"
                    style={{ color: 'white', textDecoration: 'none' }}
                  >
                    🔥 Đánh giá cao
                  </Link>
                </li>
                <li style={{ marginBottom: '5px' }}>
                  <Link
                    to="/most-watched"
                    style={{ color: 'white', textDecoration: 'none' }}
                  >
                    👀 Xem nhiều nhất
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trending-today"
                    style={{ color: 'white', textDecoration: 'none' }}
                  >
                    📈 Hot hôm nay
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li style={{ marginRight: '15px' }}>
            <Link
              to="/history"
              style={{ color: 'white', textDecoration: 'none' }}
            >
              Anime đã xem
            </Link>
          </li>

          {isAuthenticated && (
            <li style={{ marginRight: '15px' }}>
              <Link
                to="/watch-later"
                style={{ color: 'white', textDecoration: 'none' }}
              >
                Anime đã lưu
              </Link>
            </li>
          )}

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <>
                  <li style={{ marginRight: '15px' }}>
                    <Link
                      to="/admin/add-anime"
                      style={{ color: '#ffcc00', textDecoration: 'none' }}
                    >
                      Thêm Anime
                    </Link>
                  </li>
                  <li style={{ marginRight: '15px' }}>
                    <Link
                      to="/admin/dashboard"
                      style={{ color: '#00ff99', textDecoration: 'none' }}
                    >
                      Dashboard
                    </Link>
                  </li>
                </>
              )}

              <li style={{ marginRight: '15px' }}>
                <span style={{ color: '#00ccff' }}>
                  Chào mừng, {user?.username}
                </span>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Đăng xuất
                </button>
              </li>
            </>
          ) : (
            <>
              <li style={{ marginRight: '15px' }}>
                <Link
                  to="/login"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  Đăng ký
                </Link>
              </li>
            </>
          )}

          {/* Nút toggle Dark/Light Mode */}
          <li style={{ marginLeft: '15px' }}>
            <button
              onClick={toggleTheme}
              style={{
                padding: '6px 10px',
                backgroundColor: '#555',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default AppHeader;

