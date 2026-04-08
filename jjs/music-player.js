/**
 * 原神风格音乐播放器
 * 实现播放、暂停、切换歌曲等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取音乐播放器元素
    const audio = document.getElementById('bgm');
    if (!audio) return;
    
    const playPauseBtn = document.getElementById('play-pause');
    const prevBtn = document.getElementById('prev-track');
    const nextBtn = document.getElementById('next-track');
    const trackTitle = document.getElementById('track-title');
    const trackArtist = document.getElementById('track-artist');
    const albumArt = document.getElementById('album-art');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const progressContainer = document.querySelector('.progress-bar');
    const playlist = document.getElementById('playlist');
    const playlistItems = playlist.querySelectorAll('li');
    
    // 当前播放歌曲索引
    let currentTrackIndex = 0;
    let isPlaying = false;
    
    // 加载并播放当前曲目
    function loadTrack(index) {
        // 确保索引在有效范围内
        if (index < 0) index = playlistItems.length - 1;
        if (index >= playlistItems.length) index = 0;
        
        currentTrackIndex = index;
        const track = playlistItems[currentTrackIndex];
        const trackSrc = track.getAttribute('data-src');
        const coverSrc = track.getAttribute('data-cover');
        
        // 更新活跃状态（即使列表隐藏也要保持状态）
        playlistItems.forEach(item => item.classList.remove('active'));
        track.classList.add('active');
        
        // 更新音频源和界面
        audio.src = trackSrc;
        trackTitle.textContent = track.textContent;
        
        // 从歌曲路径提取艺术家
        if (trackSrc.includes('-')) {
            const artistName = trackSrc.split('/').pop().split('-')[0].trim();
            trackArtist.textContent = artistName;
        } else {
            trackArtist.textContent = 'HOYO-MiX';
        }
        
        albumArt.src = coverSrc;
        
        // 重置进度条
        progressBar.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        
        // 如果当前正在播放，则加载完成后自动播放
        if (isPlaying) {
            audio.play().then(() => {
                updatePlayPauseButton();
            }).catch(error => {
                console.error('播放错误:', error);
                isPlaying = false;
                updatePlayPauseButton();
            });
        }
    }
    
    // 更新播放/暂停按钮状态
    function updatePlayPauseButton() {
        if (isPlaying) {
            playPauseBtn.textContent = '暂停';
            playPauseBtn.classList.add('playing');
            // 添加封面动画
            albumArt.style.transform = 'scale(1.05)';
        } else {
            playPauseBtn.textContent = '播放';
            playPauseBtn.classList.remove('playing');
            // 移除封面动画
            albumArt.style.transform = 'scale(1)';
        }
    }
    
    // 播放/暂停曲目
    function togglePlayPause() {
        if (audio.paused) {
            audio.play().then(() => {
                isPlaying = true;
                updatePlayPauseButton();
            }).catch(error => {
                console.error('播放错误:', error);
            });
        } else {
            audio.pause();
            isPlaying = false;
            updatePlayPauseButton();
        }
    }
    
    // 播放上一曲
    function playPreviousTrack() {
        loadTrack(currentTrackIndex - 1);
        if (isPlaying) {
            audio.play().catch(error => {
                console.error('播放错误:', error);
            });
        }
    }
    
    // 播放下一曲
    function playNextTrack() {
        loadTrack(currentTrackIndex + 1);
        if (isPlaying) {
            audio.play().catch(error => {
                console.error('播放错误:', error);
            });
        }
    }
    
    // 格式化时间（秒 -> MM:SS）
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // 更新进度条和时间显示
    function updateProgress() {
        const duration = audio.duration || 0;
        const currentTime = audio.currentTime || 0;
        
        // 更新进度条宽度
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // 更新时间显示
        currentTimeEl.textContent = formatTime(currentTime);
        totalTimeEl.textContent = formatTime(duration);
    }
    
    // 设置进度条位置
    function setProgress(e) {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        
        if (duration) {
            audio.currentTime = (clickX / width) * duration;
        }
    }
    
    // 事件监听
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', playPreviousTrack);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', playNextTrack);
    }
    
    // 点击进度条更新播放位置
    if (progressContainer) {
        progressContainer.addEventListener('click', setProgress);
    }
    
    // 当音频播放时更新进度
    audio.addEventListener('timeupdate', updateProgress);
    
    // 当曲目播放结束时自动播放下一曲
    audio.addEventListener('ended', playNextTrack);
    
    // 当音频源加载完成时更新总时间
    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });
    
    // 播放列表点击事件
    playlistItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            
            // 点击后自动播放
            audio.play().then(() => {
                isPlaying = true;
                updatePlayPauseButton();
                albumArt.style.transform = 'scale(1.05)';
            }).catch(error => {
                console.error('播放错误:', error);
            });
        });
    });
    
    // 初始化加载第一首曲目
    loadTrack(0);
}); 