// 轮播图功能
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.slider');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    if (slider && prevBtn && nextBtn) {
        const slides = document.querySelectorAll('.slide');
        let currentSlide = 0;
        const slideCount = slides.length;
        
        // 自动轮播
        let slideInterval = setInterval(nextSlide, 5000);
        
        // 轮播到下一张图片
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slideCount;
            updateSlider();
        }
        
        // 轮播到上一张图片
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slideCount) % slideCount;
            updateSlider();
        }
        
        // 更新轮播图位置
        function updateSlider() {
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        
        // 添加按钮事件监听
        prevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            prevSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        nextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            nextSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // 音乐播放器功能
    const musicItems = document.querySelectorAll('.music-item');
    const playPauseBtn = document.querySelector('.play-pause');
    const prevSongBtn = document.querySelector('.prev-song');
    const nextSongBtn = document.querySelector('.next-song');
    const likeBtn = document.querySelector('.like-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.querySelector('.progress-container');
    const nowPlayingTitle = document.querySelector('.now-playing h3');
    const nowPlayingArtist = document.querySelector('.now-playing p');
    
    if (musicItems.length > 0) {
        let currentSong = 0;
        let isPlaying = false;
        let audio = new Audio();
        let likedSongs = new Set();
        
        // 加载音乐
        function loadSong(index) {
            const songSrc = musicItems[index].getAttribute('data-src');
            const songTitle = musicItems[index].querySelector('.music-info h3').textContent;
            const songArtist = musicItems[index].querySelector('.music-info p').textContent;
            
            // 更新唱片图片
            const vinylImage = document.querySelector('.vinyl-image');
            const bandName = songArtist.trim();
            let imagePath = '';
            
            switch(bandName) {
                case '轻音少女':
                    imagePath = 'images/k-on_bilinili.webp';
                    break;
                case '孤独摇滚':
                    imagePath = 'images/bocchi_bilibili.webp';
                    break;
                case 'MYGO!!':
                    imagePath = 'images/mygo_bilibili.webp';
                    break;
                case 'Girls Band Cry':
                    imagePath = 'images/gbc_bilibili.webp';
                    break;
            }
            
            if (imagePath) {
                vinylImage.src = imagePath;
            }
            
            audio.src = songSrc;
            nowPlayingTitle.textContent = songTitle;
            nowPlayingArtist.textContent = songArtist;
            
            // 更新播放列表中的高亮
            musicItems.forEach(item => item.classList.remove('playing'));
            musicItems[index].classList.add('playing');
            
            // 更新喜欢按钮状态
            updateLikeButton();
        }
        
        // 更新喜欢按钮状态
        function updateLikeButton() {
            const currentSongTitle = nowPlayingTitle.textContent;
            if (likedSongs.has(currentSongTitle)) {
                likeBtn.classList.add('liked');
                likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
                likeBtn.classList.remove('liked');
                likeBtn.innerHTML = '<i class="far fa-heart"></i>';
            }
        }
        
        // 切换喜欢状态
        function toggleLike() {
            const currentSongTitle = nowPlayingTitle.textContent;
            if (likedSongs.has(currentSongTitle)) {
                likedSongs.delete(currentSongTitle);
            } else {
                likedSongs.add(currentSongTitle);
            }
            updateLikeButton();
        }
        
        // 播放/暂停音乐
        function togglePlay() {
            if (isPlaying) {
                audio.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                document.querySelector('.vinyl-container').classList.remove('playing');
            } else {
                audio.play();
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                document.querySelector('.vinyl-container').classList.add('playing');
            }
            isPlaying = !isPlaying;
        }
        
        // 下一首歌
        function nextSong() {
            currentSong = (currentSong + 1) % musicItems.length;
            loadSong(currentSong);
            if (isPlaying) {
                audio.play();
            }
        }
        
        // 上一首歌
        function prevSong() {
            currentSong = (currentSong - 1 + musicItems.length) % musicItems.length;
            loadSong(currentSong);
            if (isPlaying) {
                audio.play();
            }
        }
        
        // 更新进度条
        function updateProgress(e) {
            const { duration, currentTime } = e.srcElement;
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
        
        // 修改播放进度
        function setProgress(e) {
            const width = this.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX / width) * duration;
        }
        
        // 加载第一首歌
        loadSong(currentSong);
        
        // 事件监听
        playPauseBtn.addEventListener('click', togglePlay);
        prevSongBtn.addEventListener('click', prevSong);
        nextSongBtn.addEventListener('click', nextSong);
        likeBtn.addEventListener('click', toggleLike);
        audio.addEventListener('timeupdate', updateProgress);
        progressContainer.addEventListener('click', setProgress);
        audio.addEventListener('ended', nextSong);
        
        // 点击播放列表中的歌曲
        musicItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                if (currentSong === index && isPlaying) {
                    togglePlay();
                } else {
                    currentSong = index;
                    loadSong(currentSong);
                    if (!isPlaying) {
                        togglePlay();
                    } else {
                        audio.play();
                    }
                }
            });
        });
    }
});

// 乐队搭配游戏
document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.querySelector('.band-game');
    if (!gameContainer) return;

    let budget = 15;
    let selectedMembers = [];
    const memberCards = document.querySelectorAll('.game-member-card');
    const selectedMembersContainer = document.getElementById('selected-members');
    const remainingBudgetDisplay = document.getElementById('remaining-budget');
    const totalSkillDisplay = document.getElementById('total-skill');
    const totalChemistryDisplay = document.getElementById('total-chemistry');
    const finalScoreDisplay = document.getElementById('final-score');
    const resetBtn = document.getElementById('reset-btn');

    // 成员选择逻辑
    memberCards.forEach(card => {
        const selectBtn = card.querySelector('.select-btn');
        const cost = parseInt(card.dataset.cost);
        const role = card.dataset.role;
        const skill = parseInt(card.dataset.skill);
        const chemistry = parseInt(card.dataset.chemistry);

        selectBtn.addEventListener('click', () => {
            if (budget >= cost && !selectedMembers.some(member => member.role === role)) {
                budget -= cost;
                selectedMembers.push({ role, skill, chemistry });
                updateUI();
            }
        });
    });

    // 更新UI
    function updateUI() {
        remainingBudgetDisplay.textContent = budget;
        
        // 更新已选成员显示
        selectedMembersContainer.innerHTML = '';
        selectedMembers.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.className = 'game-member-card';
            memberCard.innerHTML = `
                <div class="member-details">
                    <h4>${getRoleName(member.role)}</h4>
                    <p>实力：${member.skill}/10</p>
                    <p>配合度：${member.chemistry}/10</p>
                </div>
            `;
            selectedMembersContainer.appendChild(memberCard);
        });

        // 更新分数
        const totalSkill = selectedMembers.reduce((sum, member) => sum + member.skill, 0);
        const totalChemistry = selectedMembers.reduce((sum, member) => sum + member.chemistry, 0);
        const finalScore = calculateFinalScore(totalSkill, totalChemistry);

        totalSkillDisplay.textContent = totalSkill;
        totalChemistryDisplay.textContent = totalChemistry;
        finalScoreDisplay.textContent = finalScore;

        // 更新按钮状态
        updateButtonStates();
    }

    // 计算最终得分
    function calculateFinalScore(skill, chemistry) {
        const baseScore = (skill + chemistry) * 1.25;
        const roleBonus = selectedMembers.length === 5 ? 20 : 0;
        return Math.min(100, Math.round(baseScore + roleBonus));
    }

    // 获取角色名称
    function getRoleName(role) {
        const roleNames = {
            vocal: '主唱',
            guitar: '吉他手',
            drum: '鼓手',
            keyboard: '键盘手',
            bass: '贝斯手'
        };
        return roleNames[role] || role;
    }

    // 更新按钮状态
    function updateButtonStates() {
        memberCards.forEach(card => {
            const selectBtn = card.querySelector('.select-btn');
            const cost = parseInt(card.dataset.cost);
            const role = card.dataset.role;
            
            if (budget < cost || selectedMembers.some(member => member.role === role)) {
                selectBtn.disabled = true;
            } else {
                selectBtn.disabled = false;
            }
        });
    }

    // 重置游戏
    resetBtn.addEventListener('click', () => {
        budget = 15;
        selectedMembers = [];
        updateUI();
    });

    // 初始化UI
    updateUI();
}); 

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 显示欢迎信息
    showWelcomeMessage();
    
    // 初始化防沉迷计时器
    initAntiAddictionTimer();
    
    // 初始化鼠标轨迹
    initMouseTrail();
    
    // 初始化文字点击变色功能
    initTextColorChange();
    
    // 初始化图片切换功能
    initImageSwitch();
    
    // 初始化主题切换按钮
    initThemeSwitcher();

    // 检查登录状态
    checkLoginStatus();
});

// 欢迎信息
function showWelcomeMessage() {
    // 只在主文件夹的index.html显示欢迎信息，且只显示一次
    const pathSegments = window.location.pathname.split('/').filter(segment => segment);
    const hasShownWelcome = localStorage.getItem('hasShownWelcome');
    
    if (!hasShownWelcome && pathSegments.length <= 1 && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/'))) {
        setTimeout(() => {
            alert('欢迎来到 Girls Band Animation！\n在这里，让我们一起感受音乐的魅力！');
            localStorage.setItem('hasShownWelcome', 'true');
        }, 1000);
    }
}

// 防沉迷计时器
function initAntiAddictionTimer() {
    let startTime = Date.now();
    let isLocked = false;
    
    function checkTime() {
        const elapsedTime = (Date.now() - startTime) / 1000 / 60; // 转换为分钟
        
        if (elapsedTime >= 60 && !isLocked) { // 1小时
            isLocked = true;
            lockPage();
        }
    }
    
    function lockPage() {
        const lockOverlay = document.createElement('div');
        lockOverlay.id = 'lock-overlay';
        lockOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        const message = document.createElement('h2');
        message.textContent = '您已经浏览了1小时，请休息一下！';
        message.style.marginBottom = '20px';
        
        const timer = document.createElement('div');
        timer.id = 'unlock-timer';
        timer.style.fontSize = '24px';
        
        lockOverlay.appendChild(message);
        lockOverlay.appendChild(timer);
        document.body.appendChild(lockOverlay);
        
        let countdown = 600; // 10分钟倒计时
        const countdownInterval = setInterval(() => {
            countdown--;
            const minutes = Math.floor(countdown / 60);
            const seconds = countdown % 60;
            timer.textContent = `解锁倒计时: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                document.body.removeChild(lockOverlay);
                isLocked = false;
                startTime = Date.now();
            }
        }, 1000);
    }
    
    setInterval(checkTime, 60000); // 每分钟检查一次
}

// 鼠标轨迹动画
function initMouseTrail() {
    const trailContainer = document.createElement('div');
    trailContainer.id = 'trail-container';
    trailContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(trailContainer);
    
    const trail = [];
    const trailLength = 20;
    
    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.className = 'trail-dot';
        dot.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
        `;
        trailContainer.appendChild(dot);
        trail.push({
            element: dot,
            x: 0,
            y: 0
        });
    }
    
    document.addEventListener('mousemove', (e) => {
        trail[0].x = e.clientX;
        trail[0].y = e.clientY;
        
        for (let i = trail.length - 1; i > 0; i--) {
            trail[i].x = trail[i-1].x;
            trail[i].y = trail[i-1].y;
        }
        
        trail.forEach((dot, index) => {
            dot.element.style.left = `${dot.x}px`;
            dot.element.style.top = `${dot.y}px`;
            dot.element.style.opacity = 1 - (index / trail.length);
            dot.element.style.transform = `translate(-50%, -50%) scale(${1 - (index / trail.length)})`;
        });
    });
}

// 文字点击变色功能
function initTextColorChange() {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    textElements.forEach(element => {
        element.addEventListener('click', function() {
            const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            this.style.color = randomColor;
        });
    });
}

// 图片切换功能
function initImageSwitch() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // 阻止图片的默认点击事件（跳转）
        const parentLink = img.closest('a');
        if (parentLink) {
            parentLink.addEventListener('click', function(e) {
                e.preventDefault(); // 阻止默认的链接跳转
            });
        }

        if (img.alt === '轻音少女') {
            img.addEventListener('click', function(e) {
                e.preventDefault(); // 阻止默认的链接跳转
                this.src = this.src.includes('k-on.cover') ? 
                    'images/k-on_bilinili.webp' : 'images/k-on.cover.avif';
            });
        } else if (img.alt === '孤独摇滚') {
            img.addEventListener('click', function(e) {
                e.preventDefault(); // 阻止默认的链接跳转
                this.src = this.src.includes('bocchi_cover') ? 
                    'images/bocchi_bilibili.webp' : 'images/bocchi_cover1.avif';
            });
        } else if (img.alt === 'MYGO!!') {
            img.addEventListener('click', function(e) {
                e.preventDefault(); // 阻止默认的链接跳转
                this.src = this.src.includes('mygo.cover') ? 
                    'images/mygo_bilibili.webp' : 'images/mygo.cover.avif';
            });
        } else if (img.alt === 'Girls Band Cry') {
            img.addEventListener('click', function(e) {
                e.preventDefault(); // 阻止默认的链接跳转
                this.src = this.src.includes('gbc_cover') ? 
                    'images/gbc_bilibili.webp' : 'images/gbc_cover1.avif';
            });
        }
    });
}

// 主题切换功能
function initThemeSwitcher() {
    const themeButton = document.createElement('button');
    themeButton.textContent = '切换主题';
    themeButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #6e8efb, #a777e3);
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        z-index: 1000;
        font-size: 16px;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    `;

    // 添加悬停效果
    themeButton.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
    });

    themeButton.addEventListener('mouseout', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    });
    
    let isDarkTheme = false;
    themeButton.addEventListener('click', function() {
        isDarkTheme = !isDarkTheme;
        
        // 更新主题按钮样式
        this.style.background = isDarkTheme ? 
            'linear-gradient(135deg, #2c3e50, #3498db)' : 
            'linear-gradient(135deg, #6e8efb, #a777e3)';
        
        if (isDarkTheme) {
            // 深色主题样式
            document.body.classList.add('dark-theme');
            
            // 更新页面背景
            document.body.style.backgroundColor = '#1a1a1a';
            
            // 更新文本颜色
            const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li');
            textElements.forEach(element => {
                element.style.color = '#e0e0e0';
            });
            
            // 更新链接颜色
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                link.style.color = '#6e8efb';
            });
            
            // 更新卡片背景
            const cards = document.querySelectorAll('.band-card, .slide, .music-item');
            cards.forEach(card => {
                card.style.backgroundColor = '#2d2d2d';
                card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            });
            
            // 更新导航栏样式
            const nav = document.querySelector('nav');
            if (nav) {
                nav.style.backgroundColor = '#2d2d2d';
                nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            }
            
            // 更新页脚样式
            const footer = document.querySelector('footer');
            if (footer) {
                footer.style.backgroundColor = '#2d2d2d';
                footer.style.color = '#e0e0e0';
            }
            
            // 更新按钮样式
            const buttons = document.querySelectorAll('.btn, .control-btn, .slider-btn');
            buttons.forEach(button => {
                button.style.backgroundColor = '#4a90e2';
                button.style.color = '#ffffff';
            });
            
            // 更新音乐播放器样式
            const playerContainer = document.querySelector('.player-container');
            if (playerContainer) {
                playerContainer.style.backgroundColor = '#2d2d2d';
                playerContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            }
            
            // 更新进度条样式
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.backgroundColor = '#4a90e2';
            }
        } else {
            // 恢复浅色主题（移除所有自定义样式）
            document.body.classList.remove('dark-theme');
            
            // 保存主题按钮的样式
            const buttonStyle = this.style.cssText;
            
            // 移除所有自定义样式
            const elements = document.querySelectorAll('*');
            elements.forEach(element => {
                if (element !== this) { // 排除主题按钮
                    element.removeAttribute('style');
                }
            });
            
            // 恢复主题按钮样式
            this.style.cssText = buttonStyle;
        }
    });
    
    document.body.appendChild(themeButton);
}

// 检查登录状态并更新UI
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPath = window.location.pathname;
    const isContentManagementPage = currentPath.includes('/content/') || 
                                  currentPath.includes('/editor.html') ||
                                  currentPath.includes('/tools/');

    // 更新导航栏显示
    const contentLinks = document.querySelectorAll('.content-management-link');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (isLoggedIn) {
        // 已登录状态
        contentLinks.forEach(link => link.style.display = 'block');
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        // 未登录状态
        contentLinks.forEach(link => link.style.display = 'none');
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';

        // 如果在内容管理页面，显示提示和登录选项
        if (isContentManagementPage) {
            const container = document.querySelector('.container') || document.body;
            // 检查是否已经存在登录提示，避免重复添加
            if (!container.querySelector('.login-prompt')) {
                const loginPrompt = document.createElement('div');
                loginPrompt.className = 'login-prompt';
                loginPrompt.innerHTML = `
                    <div class="login-prompt-content">
                        <h3>需要登录</h3>
                        <p>此页面需要登录后才能访问</p>
                        <div class="login-prompt-buttons">
                            <a href="login.html" class="login-btn">
                                <i class="fas fa-sign-in-alt"></i> 前往登录
                            </a>
                        </div>
                    </div>
                `;
                container.innerHTML = '';
                container.appendChild(loginPrompt);
            }
        }
    }
    return isLoggedIn;
}

// 登录功能
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('isLoggedIn', 'true');
        showToast('登录成功', 'success');
        
        // 更新UI状态
        checkLoginStatus();
    } else {
        showToast('用户名或密码错误', 'error');
    }
}

// 注销功能
function logout() {
    localStorage.removeItem('isLoggedIn');
    showToast('已成功注销', 'success');
    
    // 更新导航栏显示
    const contentLinks = document.querySelectorAll('.content-management-link');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    contentLinks.forEach(link => link.style.display = 'none');
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';

    // 如果在内容管理页面，显示登录提示
    const currentPath = window.location.pathname;
    const isContentManagementPage = currentPath.includes('/content/') || 
                                  currentPath.includes('/editor.html') ||
                                  currentPath.includes('/tools/');
    
    if (isContentManagementPage) {
        checkLoginStatus();
    }
}

// 添加样式
const style = document.createElement('style');
style.textContent = `
    .login-prompt {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 60vh;
        text-align: center;
    }

    .login-prompt-content {
        background: var(--card-bg);
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px var(--shadow-color);
    }

    .login-prompt h3 {
        color: #e85a8f;
        margin-bottom: 1rem;
    }

    .login-prompt p {
        color: var(--text-color);
        margin-bottom: 1.5rem;
    }

    .login-prompt-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }

    .login-btn {
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
        font-size: 1rem;
        border: none;
        text-decoration: none;
        display: inline-block;
        background-color: #e85a8f;
        color: white;
    }

    .login-btn:hover {
        background-color: #bd4f8c;
    }

    .content-management-link {
        transition: opacity 0.3s;
    }
`;
document.head.appendChild(style);

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

// 等待文档加载完成
$(document).ready(function() {
    // 1. 彩虹文字效果
    function initRainbowText() {
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        let colorIndex = 0;

        // 为所有段落添加彩虹效果
        $('p').each(function() {
            const $this = $(this);
            $this.css('transition', 'color 0.5s ease');
            
            // 点击时改变颜色
            $this.click(function() {
                colorIndex = (colorIndex + 1) % colors.length;
                $(this).css('color', colors[colorIndex]);
            });
        });

        // 自动循环改变颜色
        setInterval(function() {
            $('p').each(function() {
                colorIndex = (colorIndex + 1) % colors.length;
                $(this).css('color', colors[colorIndex]);
            });
        }, 2000);
    }

    // 2. 图片切换效果
    function initImageSwitch() {
        // 为每个乐队的图片创建图片数组
        const imageSets = {
            '轻音少女': [
                'images/k-on.cover.avif',
                'images/k-on_bilinili.webp',
                'images/k-on_bilinili.webp'
            ],
            '孤独摇滚': [
                'images/bocchi_cover1.avif',
                'images/bocchi_bilibili.webp',
                'images/bocchi_bilibili.webp'
            ],
            'MYGO!!': [
                'images/mygo.cover.avif',
                'images/mygo_bilibili.webp',
                'images/mygo_bilibili.webp'
            ],
            'Girls Band Cry': [
                'images/gbc_cover1.avif',
                'images/gbc_bilibili.webp',
                'images/gbc_bilibili.webp'
            ]
        };

        // 为每个图片添加点击事件
        $('img').each(function() {
            const $img = $(this);
            const alt = $img.attr('alt');
            
            if (imageSets[alt]) {
                let currentIndex = 0;
                
                // 阻止默认的链接跳转
                $img.parent('a').click(function(e) {
                    e.preventDefault();
                });
                
                $img.click(function() {
                    currentIndex = (currentIndex + 1) % imageSets[alt].length;
                    
                    // 使用 jQuery 的淡入淡出效果
                    $img.fadeOut(300, function() {
                        $(this).attr('src', imageSets[alt][currentIndex])
                               .fadeIn(300);
                    });
                });
            }
        });
    }

    // 3. 图文对象动画效果
    function initContentAnimation() {
        $('.band-card').each(function() {
            const $card = $(this);
            
            $card.click(function() {
                // 随机选择动画效果
                const animations = [
                    function() {
                        $card.animate({
                            'margin-left': '+=50px',
                            'margin-right': '-=50px'
                        }, 500).animate({
                            'margin-left': '-=50px',
                            'margin-right': '+=50px'
                        }, 500);
                    },
                    function() {
                        $card.animate({
                            'font-size': '+=5px'
                        }, 300).animate({
                            'font-size': '-=5px'
                        }, 300);
                    },
                    function() {
                        $card.animate({
                            'rotate': '+=10deg'
                        }, 300).animate({
                            'rotate': '-=10deg'
                        }, 300);
                    }
                ];
                
                const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
                randomAnimation();
            });
        });
    }

    // 4. 主题切换功能
    function initThemeSwitcher() {
        // 创建主题切换按钮
        const $themeButton = $('<button>')
            .text('切换主题')
            .css({
                'position': 'fixed',
                'bottom': '20px',
                'right': '20px',
                'padding': '12px 24px',
                'background': 'linear-gradient(135deg, #6e8efb, #a777e3)',
                'color': 'white',
                'border': 'none',
                'border-radius': '25px',
                'cursor': 'pointer',
                'z-index': '1000',
                'font-size': '16px',
                'font-weight': '500',
                'box-shadow': '0 4px 15px rgba(0, 0, 0, 0.2)',
                'transition': 'all 0.3s ease'
            });

        // 添加悬停效果
        $themeButton.hover(
            function() {
                $(this).css({
                    'transform': 'translateY(-2px)',
                    'box-shadow': '0 6px 20px rgba(0, 0, 0, 0.25)'
                });
            },
            function() {
                $(this).css({
                    'transform': 'translateY(0)',
                    'box-shadow': '0 4px 15px rgba(0, 0, 0, 0.2)'
                });
            }
        );

        let isDarkTheme = false;
        $themeButton.click(function() {
            isDarkTheme = !isDarkTheme;
            
            if (isDarkTheme) {
                // 深色主题
                $('body').css('background-color', '#1a1a1a');
                $('h1, h2, h3, h4, h5, h6, p, li').css('color', '#e0e0e0');
                $('a').css('color', '#6e8efb');
                $('.band-card, .slide, .music-item').css({
                    'background-color': '#2d2d2d',
                    'box-shadow': '0 4px 15px rgba(0, 0, 0, 0.3)'
                });
                $('nav').css({
                    'background-color': '#2d2d2d',
                    'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.3)'
                });
                $('footer').css({
                    'background-color': '#2d2d2d',
                    'color': '#e0e0e0'
                });
                $('.btn, .control-btn, .slider-btn').css({
                    'background-color': '#4a90e2',
                    'color': '#ffffff'
                });
                $('.player-container').css({
                    'background-color': '#2d2d2d',
                    'box-shadow': '0 4px 15px rgba(0, 0, 0, 0.3)'
                });
                $('.progress-bar').css('background-color', '#4a90e2');
            } else {
                // 恢复浅色主题
                $('body, h1, h2, h3, h4, h5, h6, p, li, a, .band-card, .slide, .music-item, nav, footer, .btn, .control-btn, .slider-btn')
                    .removeAttr('style');
            }
        });

        $('body').append($themeButton);
    }

    // 初始化所有功能
    initRainbowText();
    initImageSwitch();
    initContentAnimation();
    initThemeSwitcher();
}); 