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
import { ThemeProvider } from './context/ThemeContext'; // thêm ThemeProvider
import HistoryPage from './pages/HistoryPage';
import ManageEpisodesPage from './pages/ManageEpisodesPage';
import StudioPage from './pages/StudioPage';
import GenrePage from './pages/GenrePage';
import YearPage from './pages/YearPage';
import TypePage from './pages/TypePage';
import WatchLaterPage from './pages/WatchLaterPage';
import TopRatedAnimePage from './pages/TopRatedAnimePage';
import MostWatchedAnimePage from './pages/MostWatchedAnimePage';
import TrendingAnimePage from './pages/TrendingAnimePage';
import AdminRoute from './components/AdminRoute';

import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AddAnimePage from './pages/AddAnimePage';
import EditAnimePage from './pages/EditAnimePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WatchAnimePage from './pages/WatchAnimePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
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
              <Route path="/watch-later" element={<WatchLaterPage />} />
              <Route path="/studio/:studioName" element={<StudioPage />} />
              <Route path="/anime/genre/:genreName" element={<GenrePage />} />
  <Route path="/anime/year/:year" element={<YearPage />} />
  <Route path="/anime/type/:typeName" element={<TypePage />} />


              <Route path="/watch/:animeId/:episodeId" element={<WatchAnimePage />} />
              <Route path="/top-rated" element={<TopRatedAnimePage />} />
              <Route path="/most-watched" element={<MostWatchedAnimePage />} />
              <Route path="/trending-today" element={<TrendingAnimePage />} />

              {/* Admin routes */}
              <Route path="/admin/add-anime" element={<AdminRoute><AddAnimePage /></AdminRoute>} />
              <Route path="/admin/episodes/:animeId" element={<AdminRoute><ManageEpisodesPage /></AdminRoute>} />
              <Route path="/admin/edit-anime/:id" element={<AdminRoute><EditAnimePage /></AdminRoute>} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            </Routes>

            <footer style={{ backgroundColor: '#282c34', padding: '10px', color: 'white', textAlign: 'center', marginTop: '30px' }}>
              <p>&copy; 2025 Anime Hub. All rights reserved.</p>
            </footer>
          </div>
        </ThemeProvider>
      </AuthProvider>
      <ToastContainer position="top-right" />
    </Router>
  );
}

export default App;