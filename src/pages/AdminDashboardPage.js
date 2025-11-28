// src/pages/AdminDashboardPage.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import ErrorReportTable from '../components/ErrorReportTable';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

function AdminDashboardPage() {
  const [growthData, setGrowthData] = useState(null);

  useEffect(() => {
    const fetchGrowthStats = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('authData'))?.token;
        const { data } = await axiosInstance.get('/admin/stats/growth', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setGrowthData(data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu tăng trưởng:", err);
      }
    };
    fetchGrowthStats();
  }, []);

  if (!growthData) return <p>Đang tải dữ liệu...</p>;

  // Nhãn cho 12 tháng
  const labels = [
    'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
    'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'Anime',
        data: labels.map(m =>
          growthData?.animeGrowth?.find(g => g._id === parseInt(m.split(' ')[1]))?.count || 0
        ),
        borderColor: 'blue',
        fill: false
      },
      {
        label: 'Tập phim',
        data: labels.map(m =>
          growthData?.episodeGrowth?.find(g => g._id === parseInt(m.split(' ')[1]))?.count || 0
        ),
        borderColor: 'green',
        fill: false
      },
      {
        label: 'Người dùng',
        data: labels.map(m =>
          growthData?.userGrowth?.find(g => g._id === parseInt(m.split(' ')[1]))?.count || 0
        ),
        borderColor: 'orange',
        fill: false
      },
      {
        label: 'Lượt xem',
        data: labels.map(m =>
          growthData?.viewGrowth?.find(g => g._id === parseInt(m.split(' ')[1]))?.totalViews || 0
        ),
        borderColor: 'red',
        fill: false
      }
    ]
  };

  return (
    <div className="container mt-4">
      <h2>📊 Dashboard Admin</h2>
      <Line data={data} />

      {/* Bảng báo lỗi */}
      <ErrorReportTable />
    </div>
  );

}

export default AdminDashboardPage;