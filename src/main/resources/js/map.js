// js/map.js —— 所有地图逻辑都在这里，干净解耦

// 定义放大状态
let isZoomed = false;
let currentCityCode = null; // 记录当前放大的城市代码

const map = L.map('map', {
    center: [25.0, 101.5], // 以昆明为中心
    zoom: 7,
    minZoom: 7,              // 固定最小缩放级别
    maxZoom: 18,
    zoomControl: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    dragging: false,         // 禁用拖拽
    keyboard: false,         // 禁用键盘操作
    touchZoom: false,        // 禁用触摸缩放
    boxZoom: false,          // 禁用框选缩放
    tap: false               // 禁用tap事件避免移动端双击放大
});

// 天地图矢量底图 + 中文注记
L.tileLayer(`https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=09f2e7d13d1a49b3d39e7e1218bee905`, {
    subdomains: '01234567',
    attribution: '© 天图',
    maxZoom: 18
}).addTo(map);

L.tileLayer(`https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=09f2e7d13d1a49b3d39e7e1218bee905`, {
    subdomains: '01234567',
    attribution: ''
}).addTo(map);

// 加载云南省行政边界
fetch('../../../data/530000_full.json')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, {
            style: {
                color: '#0066cc',
                weight: 2,
                fillOpacity: 0
            }
        }).addTo(map);
    });

// 加载市级行政边界
const cityLayers = {};
const cities = [
    { code: '530100', name: '昆明市' },
    { code: '532900', name: '大理州' },
    { code: '530300', name: '曲靖市' },
    { code: '530400', name: '玉溪市' },
    { code: '530500', name: '保山市' },
    { code: '530600', name: '昭通市' },
    { code: '530700', name: '丽江市' },
    { code: '530800', name: '普洱市' },
    { code: '530900', name: '临沧市' },
    { code: '532300', name: '楚雄州' },
    { code: '532500', name: '红河州' },
    { code: '532600', name: '文山州' },
    { code: '532800', name: '西双版纳州'},
    { code: '533100', name: '德宏州' },
    { code: '533300', name: '怒江州' },
    { code: '533400', name: '迪庆州' }
];

cities.forEach(city => {
    fetch(`../../../data/${city.code}_full.json`)
        .then(res => res.json())
        .then(data => {
            const layer = L.geoJSON(data, {
                style: {
                    color: '#0066cc',
                    weight: 1.5,
                    fillOpacity: 0
                }
            });

            // 绑定工具提示，显示市级行政区名称
            layer.bindTooltip(city.name, {
                permanent: false,
                direction: 'center',
                className: 'city-tooltip'
            });

            // 鼠标悬停时高亮显示市级区域
            layer.on('mouseover', function(e) {
                if (!isZoomed) {
                    e.target.setStyle({
                        color: '#ff0000',
                        weight: 2.5
                    });
                }
            });

            // 鼠标离开时恢复原状
            layer.on('mouseout', function(e) {
                if (!isZoomed) {
                    e.target.setStyle({
                        color: '#0066cc',
                        weight: 1.5
                    });
                }
            });

            // 点击市级区域进行放大
            layer.on('click', function(e) {
                if (!isZoomed) {
                    // 获取区域边界
                    const bounds = e.target.getBounds();
                    // 获取区域中心点
                    const center = bounds.getCenter();
                    // 设置地图中心到该区域中心，并适当调整缩放级别
                    map.setView(center, 9); // 缩放到10级，可根据需要调整

                    // 记录当前城市代码
                    currentCityCode = city.code;

                    // 加载该区域的坐标点
                    loadCityPoints(city.code);
                    isZoomed = true;
                }
            });

            cityLayers[city.code] = layer;
            layer.addTo(map);
        });
});

// 右键缩小到原始状态
map.on('contextmenu', function(e) {
    if (isZoomed) {
        // 右键缩小到初始状态
        map.setView([25.0, 101.5], 7);

        // 移除所有坐标点
        clearAllMarkers();
        currentCityCode = null;
        isZoomed = false;
    }
    // 阻止默认右键菜单
    L.DomEvent.preventDefault(e.originalEvent);
});

// 存储所有标记以便清除
let markers = [];

// 按市级加载坐标点
function loadCityPoints(cityCode) {
    fetch('../addr.json')
        .then(res => res.json())
        .then(addr => {
            // 清除现有标记
            clearAllMarkers();

            addr.forEach(c => {
                const marker = L.marker([c.lat, c.lng]).addTo(map);
                markers.push(marker);

                const popupContent = `
                    <div class="company-card">
                        <img src="${c.logo}" alt="${c.name}" class="company-logo"
                             onerror="this.src='https://via.placeholder.com/260x120/0066cc/ffffff?text=${encodeURIComponent(c.name)}'">
                        <div class="company-name">${c.name}</div>
                        <div class="company-address">地址：${c.addr}</div>
                        <a href="${c.url}" target="_blank">点击跳转官网</a>
                    </div>
                `;

                marker.bindPopup(popupContent, {
                    className: 'custom-popup',
                    offset: [0, -5]
                });

                // 鼠标悬停显示气泡
                marker.on('mouseover', () => marker.openPopup());
                marker.on('mouseout', () => {
                    setTimeout(() => {
                        const popup = marker.getPopup();
                        if (popup && !popup._container.matches(':hover')) {
                            marker.closePopup();
                        }
                    }, 100);
                });

                marker.on('popupopen', function() {
                    const popupContainer = marker.getPopup()._container;
                    if (popupContainer) {
                        popupContainer.addEventListener('mouseleave', () => {
                            marker.closePopup();
                        });
                        popupContainer.addEventListener('mouseenter', () => {
                            // 鼠标进入弹窗时保持打开状态
                        });
                    }
                });
            });
        })
        .catch(err => {
            console.error('加载城市坐标数据失败：', err);
        });
}

// 清除所有标记
function clearAllMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
}

// 设置地图边界以防止拖动超出云南省范围
const yunnanBounds = L.latLngBounds(
    L.latLng(21.4, 97.4),  // 西南角
    L.latLng(29.4, 105.4)  // 东北角
);

// 添加边界限制
map.setMaxBounds(yunnanBounds);
map.on('drag', function() {
    map.panInsideBounds(yunnanBounds, { animate: false });
});







