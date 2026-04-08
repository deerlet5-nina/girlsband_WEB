// 轮播图功能
document.addEventListener('DOMContentLoaded', function() {
    // 轮播图实现
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    let currentIndex = 0;
    const slideCount = slides.length;
    
    // 自动播放轮播图
    let slideInterval = setInterval(nextSlide, 5000);
    
    // 切换到下一张图片
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slideCount;
        updateSlider();
    }
    
    // 切换到上一张图片
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        updateSlider();
    }
    
    // 更新轮播图位置
    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    // 轮播图按钮点击事件
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function() {
            clearInterval(slideInterval);
            prevSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        nextBtn.addEventListener('click', function() {
            clearInterval(slideInterval);
            nextSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // 音乐播放器功能 (在详情页面实现)
    setupMusicPlayer();
});

// 音乐播放器功能
function setupMusicPlayer() {
    const audioPlayer = document.getElementById('audio-player');
    const playlistItems = document.querySelectorAll('.music-item');
    const playPauseBtn = document.querySelector('.play-pause');
    const prevTrackBtn = document.querySelector('.prev-track');
    const nextTrackBtn = document.querySelector('.next-track');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.querySelector('.progress-container');
    const nowPlayingTitle = document.querySelector('.now-playing h3');
    const nowPlayingArtist = document.querySelector('.now-playing p');
    
    // 如果当前页面没有音乐播放器，直接返回
    if (!audioPlayer) return;
    
    let currentTrackIndex = 0;
    let isPlaying = false;
    
    // 初始化音乐播放器
    function initPlayer() {
        // 更新当前播放的歌曲
        updateCurrentTrack();
        
        // 播放暂停按钮点击事件
        playPauseBtn.addEventListener('click', togglePlayPause);
        
        // 上一首下一首按钮点击事件
        prevTrackBtn.addEventListener('click', playPrevTrack);
        nextTrackBtn.addEventListener('click', playNextTrack);
        
        // 进度条更新
        audioPlayer.addEventListener('timeupdate', updateProgress);
        
        // 点击进度条跳转播放位置
        progressContainer.addEventListener('click', setProgress);
        
        // 歌曲播放完毕后自动播放下一首
        audioPlayer.addEventListener('ended', playNextTrack);
        
        // 播放列表点击事件
        playlistItems.forEach((item, index) => {
            item.addEventListener('click', function() {
                currentTrackIndex = index;
                updateCurrentTrack();
                playTrack();
            });
        });
    }
    
    // 切换播放/暂停
    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '▶';
        } else {
            audioPlayer.play();
            playPauseBtn.innerHTML = '❚❚';
        }
        isPlaying = !isPlaying;
    }
    
    // 播放当前歌曲
    function playTrack() {
        audioPlayer.play();
        playPauseBtn.innerHTML = '❚❚';
        isPlaying = true;
        
        // 更新播放列表高亮
        playlistItems.forEach(item => item.classList.remove('playing'));
        playlistItems[currentTrackIndex].classList.add('playing');
    }
    
    // 播放上一首
    function playPrevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlistItems.length) % playlistItems.length;
        updateCurrentTrack();
        playTrack();
    }
    
    // 播放下一首
    function playNextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlistItems.length;
        updateCurrentTrack();
        playTrack();
    }
    
    // 更新当前播放的歌曲
    function updateCurrentTrack() {
        const currentTrack = playlistItems[currentTrackIndex];
        const trackSrc = currentTrack.getAttribute('data-src');
        const trackTitle = currentTrack.querySelector('.music-info h3').textContent;
        const trackArtist = currentTrack.querySelector('.music-info p').textContent;
        
        audioPlayer.src = trackSrc;
        
        if (nowPlayingTitle) {
            nowPlayingTitle.textContent = trackTitle;
        }
        
        if (nowPlayingArtist) {
            nowPlayingArtist.textContent = trackArtist;
        }
        
        // 更新播放列表高亮
        playlistItems.forEach(item => item.classList.remove('playing'));
        currentTrack.classList.add('playing');
    }
    
    // 更新进度条
    function updateProgress() {
        const { duration, currentTime } = audioPlayer;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }
    
    // 点击进度条设置播放进度
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (clickX / width) * duration;
    }
    
    // 如果存在播放器，初始化
    if (playlistItems.length > 0) {
        initPlayer();
    }
}

// 页面切换动画
function pageTransition() {
    const links = document.querySelectorAll('a:not([target="_blank"])');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // 如果是锚点链接（页面内跳转），不应用过渡效果
            if (this.getAttribute('href').startsWith('#')) return;
            
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // 添加页面过渡动画
            document.body.classList.add('fade-out');
            
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
}

// 调用页面切换动画函数
pageTransition();

// AJAX content loading
$(document).ready(function() {
    // Handle navigation clicks
    $('nav a').on('click', function(e) {
        e.preventDefault();
        const url = $(this).attr('href');
        loadContent(url);
    });

    // Function to load content via AJAX
    function loadContent(url) {
        // Show loading animation
        $('#content-container').fadeOut(300, function() {
            $(this).html('<div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>').fadeIn(300);
        });

        // Load content
        $.ajax({
            url: url,
            method: 'GET',
            success: function(response) {
                // Extract the main content from the response
                const content = $(response).find('#content-container').html();
                
                // Fade out loading animation and fade in new content
                $('#content-container').fadeOut(300, function() {
                    $(this).html(content).fadeIn(300);
                    
                    // Reinitialize any necessary scripts
                    setupMusicPlayer();
                    pageTransition();
                });
            },
            error: function(xhr, status, error) {
                // Show error message
                $('#content-container').fadeOut(300, function() {
                    $(this).html(`
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>加载失败</h3>
                            <p>抱歉，无法加载内容。请稍后重试。</p>
                            <button onclick="window.location.reload()">刷新页面</button>
                        </div>
                    `).fadeIn(300);
                });
            }
        });
    }
}); 