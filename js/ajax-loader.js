// AJAX页面加载器
$(document).ready(function() {
    // 处理所有导航链接的点击事件
    $('nav a').click(function(e) {
        e.preventDefault();
        const href = $(this).attr('href');
        loadPage(href);
    });

    // 处理返回按钮的点击事件
    $('.back-btn').click(function(e) {
        e.preventDefault();
        const href = $(this).attr('href');
        loadPage(href);
    });

    // 页面加载函数
    function loadPage(url) {
        // 添加退出动画
        $('.page-transition').removeClass('active');
        
        // 延迟加载新页面
        setTimeout(() => {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    // 解析响应内容
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response, 'text/html');
                    
                    // 获取新页面的主要内容
                    const newContent = $(doc).find('.page-transition').html();
                    
                    // 更新当前页面的内容
                    $('.page-transition').html(newContent);
                    
                    // 更新导航栏的激活状态
                    $('nav a').removeClass('active');
                    $(`nav a[href="${url}"]`).addClass('active');
                    
                    // 更新页面标题
                    document.title = $(doc).find('title').text();
                    
                    // 添加进入动画
                    setTimeout(() => {
                        $('.page-transition').addClass('active');
                    }, 50);

                    // 更新浏览器历史记录
                    history.pushState({}, '', url);
                },
                error: function(xhr, status, error) {
                    console.error('页面加载失败:', error);
                    // 如果AJAX加载失败，回退到传统页面跳转
                    window.location.href = url;
                }
            });
        }, 300);
    }

    // 处理浏览器的前进/后退按钮
    window.addEventListener('popstate', function() {
        loadPage(window.location.pathname);
    });
}); 