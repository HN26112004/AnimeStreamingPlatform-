import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Table, Spinner, Alert } from 'react-bootstrap';

function ErrorReportTable() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('authData'))?.token;
        const { data } = await axiosInstance.get('/admin/reports/errors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(data);
      } catch (err) {
        console.error("Lỗi khi lấy báo lỗi:", err);
        setError("Không thể tải danh sách báo lỗi.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="mt-4">
      <h4>📋 Danh sách báo lỗi</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Nội dung</th>
            <th>Tập</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {reports.length > 0 ? (
            reports.map((r) => (
              <tr key={r._id}>
                <td>{r.user?.username || 'Ẩn danh'}</td>
                <td>{r.anime?.name || 'Không rõ'}</td>
                <td>{r.episode ? `Tập ${r.episode.episodeNumber}: ${r.episode.title}` : 'Không rõ'}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">Chưa có báo lỗi nào.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default ErrorReportTable;