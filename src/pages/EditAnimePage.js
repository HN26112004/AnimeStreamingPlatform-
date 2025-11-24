// src/pages/EditAnimePage.js (Đã cập nhật)

import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditAnimePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    // ... các state thông tin anime khác (giữ nguyên)
    const [desc, setDesc] = useState('');
    const [genres, setGenres] = useState('');
    const [language, setLanguage] = useState('');
    const [year, setYear] = useState('');
    const [studio, setStudio] = useState('');
    const [animeType, setAnimeType] = useState('TV/Series');

    const [imageFile, setImageFile] = useState(null);
    const [imagePath, setImagePath] = useState('');

    const [titleImageFile, setTitleImageFile] = useState(null);
    const [titleImagePath, setTitleImagePath] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    // THÊM: State quản lý trạng thái xóa
    const [isDeleting, setIsDeleting] = useState(false);

    // Lấy dữ liệu anime khi trang được tải (Giữ nguyên)
    useEffect(() => {
        const fetchAnime = async () => {
            try {
                const { data } = await axiosInstance.get(`/anime/${id}`);
                setName(data.name);
                setDesc(data.desc);
                setImagePath(data.image);
                setTitleImagePath(data.titleImage);
                setGenres(data.genres ? data.genres.join(', ') : '');
                setLanguage(data.language);
                setYear(data.year);
                setStudio(data.studio);
                setAnimeType(data.animeType); 
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi lấy thông tin anime:", err);
                setError('Không thể tải thông tin anime.');
                setLoading(false);
            }
        };
        fetchAnime();
    }, [id]);

    const handleFileChange = (e, fileSetter, pathSetter) => {
        const file = e.target.files[0];
        if (file) {
            fileSetter(file);
            pathSetter(URL.createObjectURL(file)); 
        } else if (pathSetter) {
            pathSetter('');
        }
    };
    
    // Hàm xử lý cập nhật Anime (Giữ nguyên)
    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !desc || !genres || !language || !year || !studio || !animeType) {
            setError('Vui lòng điền đầy đủ tất cả các trường.');
            toast.error('Vui lòng điền đầy đủ tất cả các trường.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('desc', desc);
            formData.append('language', language);
            formData.append('year', year);
            formData.append('studio', studio);
            formData.append('animeType', animeType); 
            
            const genresArray = genres.split(',').map(genre => genre.trim());
            formData.append('genres', JSON.stringify(genresArray));

            if (imageFile) {
                formData.append('image', imageFile);
            } 
            if (titleImageFile) {
                formData.append('titleImage', titleImageFile);
            } 
            
           const config = {
  headers:{
    Authorization: `Bearer ${JSON.parse(localStorage.getItem('authData'))?.token}`
  }
};



            const { data } = await axiosInstance.put(`/anime/${id}`, formData, config);
            setSuccess('Cập nhật anime thành công!');
            toast.success('Cập nhật anime thành công!');
            navigate(`/anime/${data.anime._id}`);
        } catch (err) {
            console.error("Lỗi khi cập nhật anime:", err.response ? err.response.data : err);
            const errorMsg = err.response && err.response.data.message ? err.response.data.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError(errorMsg);
            toast.error(errorMsg);
        }
    };

    // --- HÀM MỚI: XỬ LÝ XÓA ANIME ---
    const handleDeleteAnime = async () => {
        if (window.confirm("BẠN CÓ CHẮC CHẮN MUỐN XÓA ANIME NÀY? Thao tác này sẽ xóa TẤT CẢ TẬP PHIM, MÙA, BÌNH LUẬN và REVIEW liên quan.")) {
            setIsDeleting(true);
            try {
                // Giả định API DELETE /anime/:id
                await axiosInstance.delete(`/anime/${id}`); 
                
                toast.success('Xóa Anime thành công!');
                // Chuyển hướng về trang danh sách quản trị
                navigate('/admin/animes'); 
            } catch (err) {
                console.error("Lỗi khi xóa anime:", err.response ? err.response.data : err);
                const errorMsg = err.response && err.response.data.message ? err.response.data.message : 'Đã xảy ra lỗi khi xóa. Vui lòng kiểm tra Server.';
                toast.error(errorMsg);
                setIsDeleting(false);
            }
        }
    };

    if (loading) {
        return <div className="container mt-5">Đang tải...</div>;
    }

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Cập Nhật Anime (Thông tin cơ bản)</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleUpdate}>
                {/* ... Các trường nhập liệu (giữ nguyên) ... */}
                <div className="mb-3">
                    <label className="form-label">Tên Anime</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mô Tả</label>
                    <textarea className="form-control" value={desc} onChange={(e) => setDesc(e.target.value)} required></textarea>
                </div>
                <div className="mb-3">
                    <label className="form-label">Thể Loại (ngăn cách bằng dấu phẩy)</label>
                    <input type="text" className="form-control" value={genres} onChange={(e) => setGenres(e.target.value)} required />
                </div>
                
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Ngôn Ngữ</label>
                        <input type="text" className="form-control" value={language} onChange={(e) => setLanguage(e.target.value)} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Năm Phát Hành</label>
                        <input type="number" className="form-control" value={year} onChange={(e) => setYear(e.target.value)} required />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Studio</label>
                        <input type="text" className="form-control" value={studio} onChange={(e) => setStudio(e.target.value)} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Loại Anime</label>
                        <select className="form-select" value={animeType} onChange={(e) => setAnimeType(e.target.value)} required>
                            <option value="TV/Series">TV/Series</option>
                            <option value="Movie/OVA">Movie/OVA</option>
                        </select>
                    </div>
                </div>

                <hr className="my-4" />
                
                {/* Phần quản lý Ảnh Bìa */}
                <div className="mb-3">
                    <label className="form-label">Ảnh Bìa Hiện Tại</label>
                    {imagePath && <img src={imageFile ? imagePath : `http://localhost:5000${imagePath}`} alt="Ảnh bìa anime" className="img-thumbnail d-block mb-2" style={{ maxWidth: '200px' }} />}
                    <input type="file" className="form-control" onChange={(e) => handleFileChange(e, setImageFile, setImagePath)} />
                </div>
                
                {/* Phần quản lý Ảnh Tiêu Đề */}
                <div className="mb-3">
                    <label className="form-label">Ảnh Tiêu Đề Hiện Tại</label>
                    {titleImagePath && <img src={titleImageFile ? titleImagePath : `http://localhost:5000${titleImagePath}`} alt="Ảnh tiêu đề anime" className="img-thumbnail d-block mb-2" style={{ maxWidth: '300px' }} />}
                    <input type="file" className="form-control" onChange={(e) => handleFileChange(e, setTitleImageFile, setTitleImagePath)} />
                </div>
                
                <hr className="my-4" />
                <button type="submit" className="btn btn-primary w-100">Cập Nhật Thông Tin Anime</button>
            </form>
                
            <div className="d-flex justify-content-between mt-3 gap-2">
                {/* NÚT QUẢN LÝ TẬP PHIM */}
                <button 
                    type="button" 
                    className="btn btn-info flex-grow-1" 
                    onClick={() => navigate(`/admin/episodes/${id}`)}
                    disabled={isDeleting}
                >
                    Quản Lý Tập Phim
                </button>

                {/* NÚT XÓA ANIME */}
                <button 
                    type="button" 
                    className="btn btn-danger flex-grow-1" 
                    onClick={handleDeleteAnime}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Đang Xóa...' : 'XÓA ANIME NÀY'}
                </button>
            </div>
        </div>
    );
}

export default EditAnimePage;