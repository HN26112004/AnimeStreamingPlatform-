import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Imports các components và context ---
import AppHeader from './components/AppHeader';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import AnimeList from './pages/AnimeList';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import HistoryPage from './pages/HistoryPage';
import ManageEpisodesPage from './pages/ManageEpisodesPage';
// Thêm import cho trang "Anime xem sau"
import WatchLaterPage from './pages/WatchLaterPage';


// Import component bảo vệ route
import AdminRoute from './components/AdminRoute';

import './App.css';

// Import thư viện toast và CSS của nó
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Imports các trang dành cho Admin
import AddAnimePage from './pages/AddAnimePage';
import EditAnimePage from './pages/EditAnimePage';

// IMPORTS TRANG XEM PHIM MỚI
import WatchAnimePage from './pages/WatchAnimePage';


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppHeader />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/anime" element={<AnimeList />} />
            <Route path="/anime/:id" element={<AnimeDetailPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/watch-later" element={<WatchLaterPage />}/>

            {/* ROUTE MỚI CHO TRANG XEM PHIM */}
            <Route path="/watch/:animeId/:episodeId" element={<WatchAnimePage />} />


            
            {/* CÁC ROUTES DÀNH CHO ADMIN, ĐƯỢC BẢO VỆ BỞI ADMINROUTE */}
            <Route
              path="/admin/add-anime"
              element={
                <AdminRoute>
                  <AddAnimePage />
                </AdminRoute>
              }
            />
            <Route 
          path="/admin/episodes/:animeId" 
          element={
            <AdminRoute>
              <ManageEpisodesPage />
            </AdminRoute>
          } 
        />
            <Route
              path="/admin/edit-anime/:id"
              element={
                <AdminRoute>
                  <EditAnimePage />
                </AdminRoute>
              }
            />
          </Routes>

          <footer style={{ backgroundColor: '#282c34', padding: '10px', color: 'white', textAlign: 'center', marginTop: '30px' }}>
            <p>&copy; 2025 Anime Hub. All rights reserved.</p>
          </footer>
        </div>
      </AuthProvider>
      <ToastContainer position="top-right" />
    </Router>
  );
}

export default App;