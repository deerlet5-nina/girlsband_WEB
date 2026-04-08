// 主题切换功能
const themeManager = {
    init() {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        // 从 localStorage 获取保存的主题
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateIcon(icon, savedTheme);

        // 添加点击事件监听器
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateIcon(icon, newTheme);
        });
    },

    updateIcon(icon, theme) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
};

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
}); 