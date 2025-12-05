// src/pages/AdminDashboardPage.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import ErrorReportTable from '../components/ErrorReportTable';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  BarElement
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import './AdminDashboardPage.css'; // import CSS cho cards

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, BarElement);

function AdminDashboardPage() {
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('authData'))?.token;
        const { data } = await axiosInstance.get('/admin/stats/growth', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStatsData(data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", err);
      }
    };
    fetchStats();
  }, []);

  if (!statsData) return <p>Đang tải dữ liệu...</p>;

  // Nhãn cho 12 tháng
  const labels = [
    'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
    'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'
  ];

  // Hàm tiện ích: tìm tháng gần nhất có dữ liệu > 0
  const findLatestNonZero = (arr) => {
    if (!arr || arr.length === 0) return { value: 0, month: null };
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] > 0) return { value: arr[i], month: i + 1 }; // i+1 vì tháng bắt đầu từ 1
    }
    return { value: 0, month: null };
  };

  // Lấy số liệu gần nhất cho từng loại
  const { value: totalAnime, month: animeMonth } = findLatestNonZero(statsData.animeStats);
  const { value: totalEpisodes, month: episodeMonth } = findLatestNonZero(statsData.episodeStats);
  const { value: totalUsers, month: userMonth } = findLatestNonZero(statsData.userStats);
  const { value: totalReports, month: reportMonth } = findLatestNonZero(statsData.reportStats);
  const { value: totalViews, month: viewMonth } = findLatestNonZero(statsData.viewStats);

  const data = {
    labels,
    datasets: [
      {
        type: 'line',
        label: 'Anime',
        data: statsData.animeStats || [],
        borderColor: 'blue',
        fill: false,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Tập phim',
        data: statsData.episodeStats || [],
        borderColor: 'green',
        fill: false,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Người dùng',
        data: statsData.userStats || [],
        borderColor: 'orange',
        fill: false,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Báo lỗi',
        data: statsData.reportStats || [],
        borderColor: 'red',
        fill: false,
        yAxisID: 'y'
      },
      {
        type: 'bar',
        label: 'Tổng lượt xem',
        data: statsData.viewStats || [],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        yAxisID: 'y2'
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Số lượng'
        }
      },
      y2: {
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Tổng lượt xem'
        }
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>📊 Dashboard Admin</h2>

      {/* Cards thống kê nhanh */}
      <div className="stats-cards">
        <div className="card">
          <h4>Anime</h4>
          <p>{totalAnime}</p>
          {animeMonth && <small>(Tháng {animeMonth})</small>}
        </div>
        <div className="card">
          <h4>Tập phim</h4>
          <p>{totalEpisodes}</p>
          {episodeMonth && <small>(Tháng {episodeMonth})</small>}
        </div>
        <div className="card">
          <h4>Người dùng</h4>
          <p>{totalUsers}</p>
          {userMonth && <small>(Tháng {userMonth})</small>}
        </div>
        <div className="card">
          <h4>Báo lỗi</h4>
          <p>{totalReports}</p>
          {reportMonth && <small>(Tháng {reportMonth})</small>}
        </div>
        <div className="card">
          <h4>Tổng lượt xem</h4>
          <p>{totalViews}</p>
          {viewMonth && <small>(Tháng {viewMonth})</small>}
        </div>
      </div>

      {/* Biểu đồ */}
      <Chart type="bar" data={data} options={options} />

      {/* Bảng báo lỗi */}
      <ErrorReportTable />
    </div>
  );
}

export default AdminDashboardPage;