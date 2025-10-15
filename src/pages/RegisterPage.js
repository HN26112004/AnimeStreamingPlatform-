import  React,{ useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom'; // useNavigate để điều hướng sau khi đăng ký

    function RegisterPage() {
      const [username, setUsername] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [message, setMessage] = useState('');
      const [error, setError] = useState('');
      const navigate = useNavigate(); // Hook để điều hướng

      const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form

        setError(''); // Reset lỗi
        setMessage(''); // Reset thông báo

        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp.');
          return;
        }

        try {
          const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
          });

          const data = await response.json();

          if (response.ok) {
            setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
            // Tùy chọn: Chuyển hướng người dùng đến trang đăng nhập sau 2 giây
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          } else {
            setError(data.message || 'Đăng ký thất bại.');
          }
        } catch (err) {
          console.error('Lỗi đăng ký:', err);
          setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      };

      return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Đăng ký</h2>
          {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Tên người dùng:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Mật khẩu:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>Xác nhận mật khẩu:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
              />
            </div>
            <button
              type="submit"
              style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1em', cursor: 'pointer' }}
            >
              Đăng ký
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '15px' }}>
            Đã có tài khoản? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Đăng nhập</Link>
          </p>
        </div>
      );
    }

    export default RegisterPage;