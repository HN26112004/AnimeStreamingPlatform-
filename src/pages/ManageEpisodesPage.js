import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaTimes, FaUpload } from 'react-icons/fa';

function normalizeYouTubeUrl(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function ManageEpisodesPage() {
    const { animeId } = useParams();
    const navigate = useNavigate();

    const [animeName, setAnimeName] = useState('');
    const [seasons, setSeasons] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Dùng để mở/đóng form thêm/sửa Season/Episode
    const [newSeasonTitle, setNewSeasonTitle] = useState(''); 
    const [isAddingSeason, setIsAddingSeason] = useState(false);
    const [isEditingEpisode, setIsEditingEpisode] = useState(null); // {seasonIndex, episodeIndex, episodeData}

    // --- FETCH DATA ---
   const fetchEpisodes = useCallback(async () => {
        setLoading(true); // Đặt loading ở đây để đảm bảo nó được set lại khi gọi lại
        setError(null);
        try {
            // SỬA: Thay đổi endpoint từ /anime/${animeId}/episodes/all sang /episodes/${animeId}
            const { data } = await axiosInstance.get(`/episodes/${animeId}`); 

            // Cập nhật state với dữ liệu được trả về:
            // Backend cần trả về một object có cấu trúc { animeName, seasons: [...] }
            setAnimeName(data.animeName); 
            setSeasons(data.seasons);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi tải tập phim:", err);
            setError(err.response?.data?.message || 'Không thể tải tập phim.');
            setLoading(false);
        }
    }, [animeId]);

useEffect(() => {
  fetchEpisodes();
}, [fetchEpisodes]);



    // --- SEASON CRUD LOGIC ---

    const handleAddSeason = async () => {
        if (!newSeasonTitle.trim()) {
            toast.error("Vui lòng nhập tên Mùa.");
            return;
        }

        try {
            // Giả định API POST /seasons để tạo Mùa mới
            const { data } = await axiosInstance.post('/episodes/add-season'
, {
                animeId,
                
                seasonNumber: seasons.length + 1
            });
            toast.success(`Thêm Mùa ${data.season.seasonNumber} thành công!`);
            setNewSeasonTitle('');
            setIsAddingSeason(false);
            fetchEpisodes(); // Tải lại danh sách
        } catch (err) {
            toast.error("Thêm Mùa thất bại.");
        }
    };

    const handleRemoveSeason = async (seasonId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa mùa này và TẤT CẢ các tập phim bên trong?")) return;
        try {
            // Giả định API DELETE /seasons/:id
            await axiosInstance.delete(`/seasons/${seasonId}`);
            toast.success("Xóa Mùa thành công!");
            fetchEpisodes();
        } catch (err) {
            toast.error("Xóa Mùa thất bại.");
        }
    };

    // --- EPISODE CRUD LOGIC (simplified - Thêm tập mới vào mùa đã tồn tại) ---

    const handleAddEpisode = async (seasonId, currentEpisodesCount) => {
    const episodeNumber = currentEpisodesCount + 1;

    const seasonObj = seasons.find(s => s._id === seasonId);
    const seasonNumber = seasonObj?.seasonNumber;

    const newEpisodeTitle = prompt(`Nhập tên Tập ${episodeNumber} (Mùa ${seasonNumber}):`);
if (!newEpisodeTitle || !newEpisodeTitle.trim()) return;

try {
 



const rawVideoUrl = prompt("Nhập link YouTube (hoặc để trống nếu chưa có):");
const normalizedVideoUrl = normalizeYouTubeUrl(rawVideoUrl?.trim() || '');

await axiosInstance.post('/episodes', {
  animeId: animeId,
  seasonNumber: seasonNumber,
  episodeNumber: episodeNumber,
  title: newEpisodeTitle.trim(),
  desc: '',
  videoUrl: normalizedVideoUrl

 
        });

        toast.success(`Thêm Tập ${episodeNumber} thành công!`);
        fetchEpisodes();
    } catch (err) {
        console.error("Lỗi khi thêm tập:", err);
        toast.error("Thêm Tập thất bại.");
    }
};



    const handleRemoveEpisode = async (episodeId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tập phim này?")) return;
        try {
            // Giả định API DELETE /episodes/:id
            await axiosInstance.delete(`/episodes/${episodeId}`);
            toast.success("Xóa Tập phim thành công!");
            fetchEpisodes();
        } catch (err) {
            toast.error("Xóa Tập phim thất bại.");
        }
    };
    
    // --- EDIT FORM LOGIC ---
    const handleEditEpisode = (episode, seasonIndex, episodeIndex) => {
        setIsEditingEpisode({
            seasonIndex, 
            episodeIndex, 
            episodeData: {...episode, videoFile: null, isUploading: false} // Reset file/upload state
        });
    };

    const handleEpisodeInputChange = (field, value) => {
  console.log("🔍 update field:", field, "value:", value);

  // Nếu là file, log thêm chi tiết
  if (value instanceof File) {
    console.log("✅ Đây là File object:", value.name, "size:", value.size);
  } else {
    console.warn("⚠️ Giá trị không phải File:", value);
  }

  setIsEditingEpisode(prev => ({
    ...prev,
    episodeData: {
      ...prev.episodeData,
      [field]: value
    }
  }));
};
    
    // --- VIDEO UPLOAD LOGIC ---
    const handleUploadVideo = async () => {
  const episodeToUpdate = isEditingEpisode?.episodeData;

  // Kiểm tra có file hay không
  if (!episodeToUpdate?.videoFile) {
    toast.error("Vui lòng chọn file video để tải lên.");
    return;
  }

  // Kiểm tra kiểu dữ liệu
  if (!(episodeToUpdate.videoFile instanceof File)) {
    toast.error("File video không hợp lệ. Vui lòng chọn lại.");
    console.error("❌ videoFile không phải File:", episodeToUpdate.videoFile);
    return;
  }

  // Kiểm tra có episodeId
  if (!episodeToUpdate?._id) {
    toast.error("Không tìm thấy episodeId. Bạn cần lưu tập phim trước khi upload video.");
    console.error("❌ episodeId bị thiếu:", episodeToUpdate);
    return;
  }

  // Log chi tiết trước khi gửi
  console.log("📤 Đang gửi video lên server...");
  console.log("📤 episodeId:", episodeToUpdate._id);
  console.log("📤 videoFile:", episodeToUpdate.videoFile);
  console.log("📦 typeof videoFile:", typeof episodeToUpdate.videoFile);
  console.log("📦 instanceof File:", episodeToUpdate.videoFile instanceof File);

  // Tạo FormData
  const videoFormData = new FormData();
  videoFormData.append("video", episodeToUpdate.videoFile); // phải khớp với BE
  videoFormData.append("episodeId", episodeToUpdate._id);

  // Cập nhật trạng thái đang upload
  setIsEditingEpisode(prev => ({
    ...prev,
    episodeData: { ...prev.episodeData, isUploading: true }
  }));

  try {
    const { data } = await axiosInstance.post("/episodes/upload-video", videoFormData, {
      headers: { "Content-Type": "multipart/form-data" } // ép header
    });

    toast.success("Tải lên video thành công!");
    console.log("✅ Phản hồi từ BE:", data);

    fetchEpisodes(); // Tải lại danh sách tập

    // Cập nhật lại episodeData với videoUrl từ Cloudinary
    setIsEditingEpisode(prev => ({
      ...prev,
      episodeData: {
        ...prev.episodeData,
        videoFile: null, // reset file
        videoFormats: data.formats || {},
        videoUrl: data.videoFile || data.filePath || "",
        isUploading: false
      }
    }));
  } catch (err) {
    console.error("❌ Lỗi upload:", err.response?.data || err.message);
    toast.error("Tải video lên thất bại. Vui lòng thử lại.");
    setIsEditingEpisode(prev => ({
      ...prev,
      episodeData: { ...prev.episodeData, isUploading: false }
    }));
  }
};


    // --- EPISODE UPDATE (SAVE) LOGIC ---
   const handleSaveEpisodeUpdate = async () => {
  const { _id, isUploading, videoFile, videoPath, ...rest } = isEditingEpisode.episodeData;

  // Nếu có videoPath (từ upload), gán vào rest.videoFile
  if (typeof videoPath === 'string' && videoPath.trim()) {
    rest.videoFile = videoPath;
  } else {
    delete rest.videoFile; // loại bỏ field nếu không có giá trị
  }

  // Nếu không có videoFile và không có videoUrl → báo lỗi
  if (!rest.title || !(rest.videoUrl || rest.videoFile)) {
    toast.error("Tiêu đề và ít nhất một nguồn video (link hoặc file) là bắt buộc.");
    return;
  }

  try {
    await axiosInstance.put(`/episodes/${_id}`, rest);
    toast.success("Cập nhật Tập phim thành công!");
    setIsEditingEpisode(null);
    fetchEpisodes();
  } catch (err) {
    console.error("Lỗi khi cập nhật tập phim:", err);
    toast.error("Cập nhật Tập phim thất bại.");
  }
};




    
    if (loading) return <div className="container mt-5">Đang tải danh sách tập phim...</div>;
    if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;


    // --- RENDER EDIT FORM MODAL/SECTION ---
    const renderEditForm = () => {
        if (!isEditingEpisode) return null;
        const episode = isEditingEpisode.episodeData;

        return (
            <div className="card my-4 p-4 border-primary">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="h5 text-primary">Chỉnh sửa Tập {episode.episodeNumber} - {episode.title}</h4>
                    <button className="btn btn-danger btn-sm" onClick={() => setIsEditingEpisode(null)}><FaTimes /></button>
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Tiêu đề Tập</label>
                    <input
                         type="text"
                         className="form-control"
                         value={episode.title ?? ''}
                         onChange={(e) => handleEpisodeInputChange('title', e.target.value)}
                      required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Đường dẫn Video (URL)</label>
                    <input
                         type="text"
                         className="form-control"
                         value={episode.videoUrl ?? ''}
                         onChange={(e) => handleEpisodeInputChange('videoUrl', normalizeYouTubeUrl(e.target.value))}
                         required
                        />


                </div>
                <div className="mb-3 border p-3 rounded bg-light">
  <label className="form-label d-block">Tải lên Video (File)</label>
  <input
    type="file"
    accept="video/*"                 // ✅ chỉ cho phép chọn file video
    className="form-control mb-2"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        // ✅ đảm bảo file là File object
        handleEpisodeInputChange('videoFile', file);
      } else {
        // Nếu không chọn file, reset về null
        handleEpisodeInputChange('videoFile', null);
      }
    }}
  />
  <button
    type="button"
    className="btn btn-warning btn-sm"
    onClick={handleUploadVideo}
    disabled={episode.isUploading || !(episode.videoFile instanceof File)} // ✅ chỉ enable khi có File object
  >
    <FaUpload className="me-1" />
    {episode.isUploading ? 'Đang tải...' : 'Tải lên Server'}
  </button>

  {/* ✅ chỉ hiển thị tên nếu là File object */}
  {episode.videoFile instanceof File && (
    <p className="text-muted mt-2 small">
      File đã chọn: {episode.videoFile.name}
    </p>
  )}

  {episode.videoUrl && (
    <p className="text-success mt-2">
      Đường dẫn hiện tại: {episode.videoUrl}
    </p>
  )}
</div>


                <div className="mb-3">
                    <label className="form-label">Mô tả Tập (Tùy chọn)</label>
                    <textarea
                        className="form-control"
                        value={episode.desc || ''}
                        onChange={(e) => handleEpisodeInputChange('desc', e.target.value)}
                    ></textarea>
                </div>
                
                <button type="button" className="btn btn-success" onClick={handleSaveEpisodeUpdate}>
                    Lưu Cập Nhật
                </button>
            </div>
        );
    };


    return (
        <div className="container mt-5">
            <h1 className="mb-4">Quản Lý Tập Phim: {animeName}</h1>
            <p className="text-muted">Anime ID: {animeId}</p>

            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>Quay lại trang Sửa Anime</button>

            {/* Thêm Mùa Mới Section */}
            <div className="card p-3 mb-4">
                <button 
                    className="btn btn-info" 
                    onClick={() => setIsAddingSeason(!isAddingSeason)}
                >
                    <FaPlus className="me-2" />
                    {isAddingSeason ? 'Hủy Thêm Mùa' : 'Thêm Mùa Mới'}
                </button>
                {isAddingSeason && (
                    <div className="mt-3 d-flex">
                        <input 
                            type="text" 
                            className="form-control me-2" 
                            placeholder={`Tên Mùa ${seasons.length + 1} (vd: Mùa 1)`}
                            value={newSeasonTitle}
                            onChange={(e) => setNewSeasonTitle(e.target.value)}
                        />
                        <button className="btn btn-success" onClick={handleAddSeason}>
                            <FaPlus /> Thêm
                        </button>
                    </div>
                )}
            </div>

            {renderEditForm()}

            {/* Danh sách Seasons và Episodes */}
            {seasons.length > 0 ? seasons.map((season, seasonIndex) => (
  <div key={season._id || `season-${seasonIndex}`} className="p-3 mb-4 border rounded shadow-sm">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h3 className="h5 mb-0">
        Mùa {season.seasonNumber}: {season.title}
      </h3>
      <div className="btn-group">
        <button
          className="btn btn-sm btn-success"
          onClick={() => handleAddEpisode(season._id, season.episodes.length)}
        >
          <FaPlus /> Thêm Tập
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleRemoveSeason(season._id)}
        >
          <FaTrash /> Xóa Mùa
        </button>
      </div>
    </div>

    <ul className="list-group">
      {season.episodes.length > 0 ? [...season.episodes]
        .sort((a, b) => a.episodeNumber - b.episodeNumber)
        .map((episode, episodeIndex) => (
          <li
            key={episode._id || `${season._id}-${episodeIndex}`}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              <strong>Tập {episode.episodeNumber}</strong> – {episode.title}
              <small className="ms-3 text-muted">
                ({episode.videoUrl ? 'Đã có video' : 'Chưa có video'})
              </small>
            </span>
            <div>
              <button
                className="btn btn-sm btn-primary me-2"
                onClick={() => handleEditEpisode(episode, seasonIndex, episodeIndex)}
                disabled={isEditingEpisode}
              >
                <FaEdit /> Sửa
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleRemoveEpisode(episode._id)}
              >
                <FaTrash />
              </button>
            </div>
          </li>
        )) : (
          <li
            key={`empty-${season._id}`}
            className="list-group-item text-center text-muted"
          >
            Chưa có tập phim nào trong mùa này.
          </li>
        )}
    </ul>
  </div>
)) : (
  <p key="no-seasons" className="alert alert-warning text-center">
    Anime này chưa có mùa nào.
  </p>
)}

</div>
)};
export default ManageEpisodesPage;