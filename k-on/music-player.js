// 音乐播放器功能
const musicPlayer = {
    audio: document.getElementById('background-music'),
    currentTrack: 0,
    isPlaying: false,
    playlist: [
        {
            title: "その笑顔が好き",
            artist: "百石元",
            band: "K-ON!",
            file: "k-on/百石元 - その笑顔が好き.mp3",
            image: "../images/k-on (1).jpg"
        },
        {
            title: "ピンチ大好き！",
            artist: "百石元",
            band: "K-ON!",
            file: "k-on/7788langlang - 33.33 ピンチ大好き！(Av15773643,P33).mp3",
            image: "../images/k-on_bilinili.webp"
        },
        {
            title: "One more tea？",
            artist: "百石元",
            band: "K-ON!",
            file: "k-on/糯米团El_sr - One more tea？ - 百石元.mp3",
            image: "../images/k-on_yui.cover.jpg"
        }
    ],

    // 获取随机索引，确保不会连续播放同一首歌
    getRandomIndex() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.playlist.length);
        } while (newIndex === this.currentTrack && this.playlist.length > 1);
        return newIndex;
    },

    init() {
        // 创建音乐播放器UI
        const playerHTML = `
            <div class="music-controls">
                <div class="player-content">
                    <div class="disc-container">
                        <div class="disc" style="background-image: url('${this.playlist[0].image}'); background-size: cover; background-position: center;"></div>
                    </div>
                    <div class="music-info">
                        <div class="title">${this.playlist[0].title}</div>
                        <div class="artist">${this.playlist[0].artist}</div>
                        <div class="band">${this.playlist[0].band}</div>
                    </div>
                </div>
                <div class="control-buttons">
                    <button class="prev-btn"><i class="fas fa-backward"></i></button>
                    <button class="play-btn"><i class="fas fa-play"></i></button>
                    <button class="next-btn"><i class="fas fa-forward"></i></button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', playerHTML);

        // 绑定事件
        const playBtn = document.querySelector('.play-btn');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const disc = document.querySelector('.disc');
        const player = document.querySelector('.music-controls');

        playBtn.addEventListener('click', () => this.togglePlay());
        prevBtn.addEventListener('click', () => this.playPrev());
        nextBtn.addEventListener('click', () => this.playNext());

        // 音频事件监听
        this.audio.addEventListener('ended', () => this.playNext());
        this.audio.addEventListener('play', () => {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            disc.classList.add('rotating');
            this.isPlaying = true;
        });
        this.audio.addEventListener('pause', () => {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            disc.classList.remove('rotating');
            this.isPlaying = false;
        });

        // 添加拖拽功能
        this.setupDraggable(player);

        // 随机选择第一首歌并自动播放
        this.currentTrack = this.getRandomIndex();
        this.loadTrack(this.currentTrack);
        this.autoPlay();
    },

    setupDraggable(element) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        element.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            // 如果点击的是按钮，不启动拖拽
            if (e.target.closest('button')) {
                return;
            }

            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === element || element.contains(e.target)) {
                isDragging = true;
                element.classList.add('dragging');
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                setTranslate(currentX, currentY, element);
            }
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            element.classList.remove('dragging');

            // 确保播放器不会超出屏幕边界
            const rect = element.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;

            if (rect.left < 0) {
                xOffset = 0;
                setTranslate(0, currentY, element);
            } else if (rect.right > window.innerWidth) {
                xOffset = maxX;
                setTranslate(maxX, currentY, element);
            }

            if (rect.top < 0) {
                yOffset = 0;
                setTranslate(currentX, 0, element);
            } else if (rect.bottom > window.innerHeight) {
                yOffset = maxY;
                setTranslate(currentX, maxY, element);
            }
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        }
    },

    autoPlay() {
        // 尝试自动播放
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // 如果自动播放失败，添加点击事件监听器
                document.addEventListener('click', () => {
                    this.audio.play();
                }, { once: true });
            });
        }
    },

    loadTrack(index) {
        const track = this.playlist[index];
        this.audio.src = `../${track.file}`;
        const disc = document.querySelector('.disc');
        const title = document.querySelector('.music-info .title');
        const artist = document.querySelector('.music-info .artist');
        const band = document.querySelector('.music-info .band');
        
        disc.style.backgroundImage = `url('${track.image}')`;
        disc.style.backgroundSize = 'cover';
        disc.style.backgroundPosition = 'center';
        title.textContent = track.title;
        artist.textContent = track.artist;
        band.textContent = track.band;
    },

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
    },

    playNext() {
        this.currentTrack = this.getRandomIndex();
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.audio.play();
        }
    },

    playPrev() {
        this.currentTrack = this.getRandomIndex();
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.audio.play();
        }
    }
};

// 初始化音乐播放器
document.addEventListener('DOMContentLoaded', () => {
    musicPlayer.init();
}); 