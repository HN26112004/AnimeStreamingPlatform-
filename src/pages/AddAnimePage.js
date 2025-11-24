import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddAnimePage() {
    // State chỉ còn thông tin cốt lõi của Anime
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [genres, setGenres] = useState('');
    const [language, setLanguage] = useState('');
    const [year, setYear] = useState('');
    const [studio, setStudio] = useState('');
    const [animeType, setAnimeType] = useState('TV/Series');

    const [image, setImage] = useState(null);
    const [titleImage, setTitleImage] = useState(null);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e, setter) => {
        setter(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 1. Validation
        if (!name || !desc || !genres || !language || !year || !studio || !animeType || !image) {
            setError('Vui lòng điền đầy đủ tất cả các trường và tải lên Ảnh Bìa.');
            toast.error('Vui lòng điền đầy đủ tất cả các trường và tải lên Ảnh Bìa.');
            return;
        }
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('desc', desc);
        formData.append('language', language);
        formData.append('year', year);
        formData.append('studio', studio);
        formData.append('animeType', animeType);

        // 2. Xử lý Genres và Files
        const genresArray = genres.split(',').map(genre => genre.trim());
        formData.append('genres', JSON.stringify(genresArray)); 
        
        formData.append('image', image);
        if (titleImage) {
            formData.append('titleImage', titleImage);
        }

        try {
            // 3. Gọi API chỉ để tạo Anime (Không có seasons)
            const config = {};
            const { data } = await axiosInstance.post('/anime', formData, config);
            
            setSuccess('Anime đã được thêm thành công!');
            toast.success('Anime đã được thêm thành công! Giờ bạn có thể thêm tập phim.');
            // Chuyển hướng đến trang quản lý tập phim mới (giả định route là /admin/episodes/:id)
            navigate(`/admin/episodes/${data.anime._id}`); 
        } catch (err) {
            console.error("Lỗi khi thêm anime:", err.response ? err.response.data : err);
            const errorMsg = err.response && err.response.data.message ? err.response.data.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError(errorMsg);
            toast.error(errorMsg);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Thêm Anime Mới (Thông tin cơ bản)</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
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
                
                <div className="mb-3">
                    <label className="form-label">Ảnh Bìa</label>
                    <input type="file" className="form-control" onChange={(e) => handleFileChange(e, setImage)} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Ảnh Tiêu Đề (Tùy chọn)</label>
                    <input type="file" className="form-control" onChange={(e) => handleFileChange(e, setTitleImage)} />
                </div>

                <hr className="my-4" />
                
                <button type="submit" className="btn btn-primary w-100">Thêm Anime</button>
            </form>
        </div>
    );
}

export default AddAnimePage;