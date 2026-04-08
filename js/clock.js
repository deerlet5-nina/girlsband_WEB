// 更新时钟显示
function updateClock() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const clockElement = document.querySelector('.clock');
    if (clockElement) {
        clockElement.innerHTML = `
            <div class="date">${year}年${month}月${day}日</div>
            <div class="time">${hours}:${minutes}:${seconds}</div>
        `;
    }
}

// 初始化时钟
function initClock() {
    // 立即更新一次
    updateClock();
    // 每秒更新一次
    setInterval(updateClock, 1000);
}

// 页面加载完成后初始化时钟
document.addEventListener('DOMContentLoaded', initClock); 