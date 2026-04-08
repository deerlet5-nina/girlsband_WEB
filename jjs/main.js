/**
 * 原神风格网站主JavaScript文件
 * 包含导航栏交互、主题切换、时钟等功能
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 导航栏效果
    setupNavigation();
    
    // 页面滚动效果
    setupScrollEffects();
    
    // 时钟更新
    updateClock();
    setInterval(updateClock, 1000);
    
    // 主题切换
    setupThemeToggle();
    
    // 显示欢迎弹窗（只在第一次访问时显示）
    showWelcomePopup();
});

// 欢迎弹窗功能
function showWelcomePopup() {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisitedBefore) {
        // 创建弹窗元素
        const popup = document.createElement('div');
        popup.className = 'welcome-popup glass-effect';
        popup.innerHTML = `
            <h2>欢迎来到提瓦特大陆！</h2>
            <p>这是一个原神主题的网站示例，希望你喜欢。</p>
            <button id="close-popup" class="btn-primary">开始探索</button>
        `;
        
        // 添加到body
        document.body.appendChild(popup);
        
        // 添加关闭按钮事件
        document.getElementById('close-popup').addEventListener('click', function() {
            popup.classList.add('fade-out');
            
            setTimeout(function() {
                document.body.removeChild(popup);
            }, 500);
            
            // 记录用户已经访问过
            localStorage.setItem('hasVisitedBefore', 'true');
        });
        
        // 弹窗动画
        setTimeout(function() {
            popup.classList.add('show');
        }, 1000);
    }
}

// 导航栏滑动效果
function setupNavigation() {
    // 导航栏滑动效果
    $("#nav a").on("click", function () {
        var position = $(this).parent().position();
        var width = $(this).parent().width();
        $("#nav .slide1").css({ opacity: 1, left: +position.left, width: width});
    });

    $("#nav a").on("mouseover", function () {
        var position = $(this).parent().position();
        var width = $(this).parent().width();
        // 调整slide2的位置，使其稍微上移1-2px
        $("#nav .slide2").css({ 
            opacity: 1, 
            left: +position.left, 
            width: width
        }).addClass("squeeze");
    });

    $("#nav a").on("mouseout", function () {
        $("#nav .slide2").css({ opacity: 0}).removeClass("squeeze");
    });
    
    // 设置默认活动项
    setTimeout(function() {
        let activeLink = $("#nav li a.active");
        if(activeLink.length) {
            var position = activeLink.parent().position();
            var width = activeLink.parent().width();
            $("#nav .slide1").css({ left: +position.left, width: width});
        } else {
            // 默认选中第一项
            var position = $("#nav li:nth-of-type(3)").position();
            var width = $("#nav li:nth-of-type(3)").width();
            $("#nav .slide1").css({ left: +position.left, width: width});
        }
    }, 100);
    
    // 移动端菜单切换
    $('.hamburger').on('click', function() {
        $('#nav').toggleClass('active');
        $(this).toggleClass('active');
    });
}

// 主题切换功能
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        // 检查本地存储中的主题设置
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '切换至日间模式';
        }
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            // 保存主题设置到本地存储
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = '切换至日间模式';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.textContent = '切换至夜间模式';
            }
        });
    }
}

// 页面滚动效果
function setupScrollEffects() {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            document.getElementById('main-header').classList.add('scrolled');
        } else {
            document.getElementById('main-header').classList.remove('scrolled');
        }
    });
}

// 更新时钟
function updateClock() {
    const now = new Date();
    const date = document.getElementById('date');
    const time = document.getElementById('time');
    
    if (date && time) {
        date.textContent = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        
        time.textContent = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }
}

// 检查元素是否在视口中
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 滚动时显示动画
function checkScroll() {
    const elements = document.querySelectorAll('.fade-in');
    
    elements.forEach(element => {
        if (isInViewport(element) && !element.classList.contains('visible')) {
            element.classList.add('visible');
        }
    });
}

// 初始检查
checkScroll();

// 滚动时检查
window.addEventListener('scroll', checkScroll); 