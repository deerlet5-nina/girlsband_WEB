/**
 * 百度地图功能
 * 初始化地图、获取当前位置并在地图上显示
 */
document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    // 创建百度地图实例
    function initMap() {
        // 创建地图实例
        const map = new BMap.Map('map-container');
        
        // 创建点坐标（默认北京）
        const defaultPoint = new BMap.Point(116.404, 39.915);
        
        // 初始化地图，设置中心点坐标和地图级别
        map.centerAndZoom(defaultPoint, 15);
        
        // 开启鼠标滚轮缩放
        map.enableScrollWheelZoom(true);
        
        // 添加地图控件
        map.addControl(new BMap.NavigationControl());  // 添加平移缩放控件
        map.addControl(new BMap.ScaleControl());       // 添加比例尺控件
        map.addControl(new BMap.OverviewMapControl()); // 添加缩略地图控件
        map.addControl(new BMap.MapTypeControl());     // 添加地图类型控件
        
        // 获取定位
        getLocation(map);
    }
    
    // 获取并显示当前位置
    function getLocation(map) {
        // 创建地理位置实例
        const geolocation = new BMap.Geolocation();
        
        // 获取当前位置
        geolocation.getCurrentPosition(function(result) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                // 成功获取位置
                const userPoint = result.point;
                
                // 设置地图中心为用户位置
                map.centerAndZoom(userPoint, 15);
                
                // 添加带有自定义图标的标记
                const marker = new BMap.Marker(userPoint, {
                    icon: new BMap.Icon('images/marker.png', new BMap.Size(30, 30), {
                        imageOffset: new BMap.Size(0, 0)
                    })
                });
                map.addOverlay(marker);
                
                // 创建信息窗口
                const infoWindow = new BMap.InfoWindow('您的当前位置', {
                    width: 200,
                    height: 60,
                    title: '位置信息',
                    enableMessage: false
                });
                
                // 点击标记时打开信息窗口
                marker.addEventListener('click', function() {
                    map.openInfoWindow(infoWindow, userPoint);
                });
                
                // 自动打开信息窗口
                map.openInfoWindow(infoWindow, userPoint);
                
                // 创建圆形范围覆盖物
                const circle = new BMap.Circle(userPoint, 500, {
                    strokeColor: 'rgba(22, 93, 255, 0.5)',
                    strokeWeight: 2,
                    strokeOpacity: 0.8,
                    fillColor: 'rgba(22, 93, 255, 0.1)',
                    fillOpacity: 0.6
                });
                map.addOverlay(circle);
                
            } else {
                // 定位失败，显示错误消息
                const errorMsg = '定位失败，错误代码：' + this.getStatus();
                console.error(errorMsg);
                
                // 创建错误信息窗口
                const errorInfoWindow = new BMap.InfoWindow(errorMsg, {
                    width: 250,
                    height: 80,
                    title: '定位失败',
                    enableMessage: false
                });
                
                map.openInfoWindow(errorInfoWindow, map.getCenter());
            }
        }, {
            enableHighAccuracy: true // 高精度定位
        });
    }
    
    // 加载超时处理
    let mapLoadTimeout = setTimeout(function() {
        // 如果百度地图API加载超时
        if (typeof BMap === 'undefined') {
            mapContainer.innerHTML = '<div class="map-error">地图加载失败，请检查网络连接并刷新页面重试</div>';
        }
    }, 5000);
    
    // 检查百度地图API是否已加载
    function checkBMapLoaded() {
        if (typeof BMap !== 'undefined') {
            clearTimeout(mapLoadTimeout);
            initMap();
        } else {
            setTimeout(checkBMapLoaded, 100);
        }
    }
    
    // 开始检查
    checkBMapLoaded();
}); 