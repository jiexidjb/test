/**
 * 旅居点多维画像
 *
 * 评分口径：除海拔 / 月均花费 / 车程外，所有维度统一为 0-100，数值越高越适合旅居。
 *   climate   气候舒适度（年均温、昼夜温差、湿度体感）
 *   air       空气质量（州市年均 AQI 水平）
 *   medical   医疗可达性（到最近综合医院车程 + 州内三甲资源）
 *   transport 交通便利（到最近机场 / 高铁站车程）
 *   cost      成本友好度（越高越便宜，与 monthly 反向对应）
 *   quiet     环境安静与绿化（景区 / 古村 / 县城 / 市区）
 *   social    社交与文娱配套（古城、景区、城区公共活动）
 *
 * 数据来源说明（答辩时可追溯）：
 *   1. 海拔、气候、AQI：州市统计年鉴 / 云南省生态环境状况公报的州市级基准，
 *      点位按所在县、乡镇海拔带做区间修正。
 *   2. 医疗、交通：按点位所在县到最近二级以上医院 / 机场（高铁站）的公路里程与车程估算，
 *      州府与机场周边点位按实测通勤时间下调。
 *   3. 成本：州市住宿餐饮均价 × 景区溢价系数（景区内 +15%~30%），保留为估算值。
 *   4. 安静、社交：按地址特征人工判定（景区内 / 古村 / 县城 / 市区），同一场景内按规模微调。
 *
 * 说明：这些是用于排序的相对分，不是绝对值；所有点位使用同一套口径，横向可比。
 * 已剔除：'和演技老巢'（彩蛋数据，无有效地址）、'客中初夏民宿'（四川叙永，省外）、
 * 以及 '昭通洒渔生态温泉养生营地' 的重复记录。
 */
export const PLACE_PROFILES = {
  /* ---------- 怒江州 ---------- */
  '贡山丙中洛丁大妈的家民宿': {
    city: '怒江州', county: '贡山县', scene: '景区村落',
    altitude: 1750, climate: 74, air: 97, medical: 32, transport: 22,
    cost: 80, quiet: 97, social: 40, monthly: 1700, hospitalMin: 120, hubMin: 240
  },
  '半山渡·与瓦民宿（丙中洛店）': {
    city: '怒江州', county: '贡山县', scene: '景区村落',
    altitude: 1850, climate: 72, air: 97, medical: 32, transport: 22,
    cost: 78, quiet: 96, social: 40, monthly: 1800, hospitalMin: 120, hubMin: 240
  },
  '山野人家民宿（老姆登村店）': {
    city: '怒江州', county: '福贡县', scene: '山地村落',
    altitude: 1900, climate: 72, air: 97, medical: 34, transport: 34,
    cost: 76, quiet: 96, social: 38, monthly: 1750, hospitalMin: 100, hubMin: 200
  },
  '福贡老姆登香格里民宿': {
    city: '怒江州', county: '福贡县', scene: '山地村落',
    altitude: 1900, climate: 72, air: 97, medical: 34, transport: 34,
    cost: 76, quiet: 96, social: 38, monthly: 1750, hospitalMin: 100, hubMin: 200
  },

  /* ---------- 迪庆州 ---------- */
  '永春御水民宿': {
    city: '迪庆州', county: '维西县', scene: '山地村落',
    altitude: 2000, climate: 60, air: 97, medical: 35, transport: 45,
    cost: 78, quiet: 94, social: 40, monthly: 1750, hospitalMin: 90, hubMin: 180
  },
  '维西城里尘外民宿': {
    city: '迪庆州', county: '维西县', scene: '县城',
    altitude: 2340, climate: 58, air: 96, medical: 55, transport: 50,
    cost: 74, quiet: 70, social: 55, monthly: 1900, hospitalMin: 30, hubMin: 160
  },
  '维西酉果落民宿': {
    city: '迪庆州', county: '维西县', scene: '山地村落',
    altitude: 2000, climate: 62, air: 97, medical: 38, transport: 42,
    cost: 76, quiet: 93, social: 45, monthly: 1800, hospitalMin: 75, hubMin: 170
  },
  '维西白果泽客民宿': {
    city: '迪庆州', county: '维西县', scene: '山地村落',
    altitude: 2000, climate: 62, air: 97, medical: 38, transport: 42,
    cost: 76, quiet: 93, social: 45, monthly: 1800, hospitalMin: 75, hubMin: 170
  },
  '维西本吉阁民宿': {
    city: '迪庆州', county: '维西县', scene: '山地村落',
    altitude: 2000, climate: 62, air: 97, medical: 38, transport: 42,
    cost: 76, quiet: 93, social: 45, monthly: 1800, hospitalMin: 75, hubMin: 170
  },
  '云雨田半山民宿': {
    city: '迪庆州', county: '维西县', scene: '山地村落',
    altitude: 2000, climate: 62, air: 97, medical: 38, transport: 42,
    cost: 76, quiet: 93, social: 45, monthly: 1800, hospitalMin: 75, hubMin: 170
  },
  '维西慢来悦民宿': {
    city: '迪庆州', county: '维西县', scene: '山地村落',
    altitude: 2000, climate: 62, air: 97, medical: 38, transport: 42,
    cost: 76, quiet: 93, social: 45, monthly: 1800, hospitalMin: 75, hubMin: 170
  },

  /* ---------- 大理州 ---------- */
  '诺邓诺言别院花园美宿': {
    city: '大理州', county: '云龙县', scene: '古村落',
    altitude: 1900, climate: 70, air: 94, medical: 42, transport: 45,
    cost: 74, quiet: 92, social: 60, monthly: 1900, hospitalMin: 60, hubMin: 150
  },
  '云龙荒野际野奢民宿': {
    city: '大理州', county: '云龙县', scene: '古村落',
    altitude: 1900, climate: 70, air: 94, medical: 42, transport: 45,
    cost: 72, quiet: 93, social: 58, monthly: 2000, hospitalMin: 60, hubMin: 150
  },
  '诺邓古井见山民宿': {
    city: '大理州', county: '云龙县', scene: '古村落',
    altitude: 1900, climate: 70, air: 94, medical: 42, transport: 45,
    cost: 74, quiet: 92, social: 60, monthly: 1900, hospitalMin: 60, hubMin: 150
  },
  '诺邓古村复甲山居': {
    city: '大理州', county: '云龙县', scene: '古村落',
    altitude: 1900, climate: 70, air: 94, medical: 42, transport: 45,
    cost: 74, quiet: 92, social: 60, monthly: 1900, hospitalMin: 60, hubMin: 150
  },
  '诺邓嬿山羽筑精品民宿': {
    city: '大理州', county: '云龙县', scene: '古村落',
    altitude: 1900, climate: 70, air: 94, medical: 42, transport: 45,
    cost: 72, quiet: 93, social: 58, monthly: 2000, hospitalMin: 60, hubMin: 150
  },
  '巍山古城敏悦小筑.艺术客栈（拱辰楼店）': {
    city: '大理州', county: '巍山县', scene: '古城',
    altitude: 1700, climate: 82, air: 92, medical: 68, transport: 62,
    cost: 80, quiet: 85, social: 80, monthly: 1700, hospitalMin: 20, hubMin: 90
  },
  '喜舍·设计师中式庭院花园民宿（巍山古城星拱楼店）': {
    city: '大理州', county: '巍山县', scene: '古城',
    altitude: 1700, climate: 82, air: 92, medical: 68, transport: 62,
    cost: 78, quiet: 86, social: 80, monthly: 1800, hospitalMin: 20, hubMin: 90
  },
  '巍山璞悦良舍民宿': {
    city: '大理州', county: '巍山县', scene: '古城',
    altitude: 1700, climate: 82, air: 92, medical: 68, transport: 62,
    cost: 80, quiet: 85, social: 80, monthly: 1700, hospitalMin: 20, hubMin: 90
  },
  '澜庭·山青设计师绝美侘寂风民宿（巍山古城店）': {
    city: '大理州', county: '巍山县', scene: '古城',
    altitude: 1700, climate: 82, air: 92, medical: 68, transport: 62,
    cost: 76, quiet: 86, social: 80, monthly: 1850, hospitalMin: 20, hubMin: 90
  },
  '鑫海庄园': {
    city: '大理州', county: '祥云县', scene: '乡村庄园',
    altitude: 1960, climate: 74, air: 88, medical: 55, transport: 60,
    cost: 82, quiet: 80, social: 45, monthly: 1600, hospitalMin: 35, hubMin: 80
  },

  /* ---------- 保山市 ---------- */
  '腾冲迎曦暖墅庭院民宿': {
    city: '保山市', county: '腾冲市', scene: '城区',
    altitude: 1640, climate: 86, air: 92, medical: 72, transport: 80,
    cost: 72, quiet: 80, social: 78, monthly: 2200, hospitalMin: 15, hubMin: 30
  },
  '薇风里民宿': {
    city: '保山市', county: '隆阳区', scene: '市区',
    altitude: 1650, climate: 84, air: 90, medical: 88, transport: 85,
    cost: 74, quiet: 62, social: 76, monthly: 2100, hospitalMin: 10, hubMin: 25
  },
  '璞悦·柏湾黑温泉民宿': {
    city: '保山市', county: '昌宁县', scene: '乡村温泉',
    altitude: 1600, climate: 82, air: 92, medical: 55, transport: 48,
    cost: 82, quiet: 90, social: 48, monthly: 1650, hospitalMin: 40, hubMin: 110
  },

  /* ---------- 德宏州 ---------- */
  '华竺·观景美宿（傣族古镇店）': {
    city: '德宏州', county: '芒市', scene: '城区古镇',
    altitude: 900, climate: 84, air: 90, medical: 82, transport: 86,
    cost: 74, quiet: 62, social: 82, monthly: 2200, hospitalMin: 8, hubMin: 12
  },
  '芒市红缦民宿（傣族古镇店）': {
    city: '德宏州', county: '芒市', scene: '城区古镇',
    altitude: 900, climate: 84, air: 90, medical: 82, transport: 86,
    cost: 75, quiet: 62, social: 82, monthly: 2150, hospitalMin: 8, hubMin: 12
  },
  '秘境傣舍（傣族古镇店）': {
    city: '德宏州', county: '芒市', scene: '城区古镇',
    altitude: 900, climate: 84, air: 90, medical: 82, transport: 86,
    cost: 77, quiet: 62, social: 82, monthly: 2050, hospitalMin: 8, hubMin: 12
  },
  '清川绿水民宿': {
    city: '德宏州', county: '陇川县', scene: '县城',
    altitude: 900, climate: 82, air: 90, medical: 58, transport: 62,
    cost: 80, quiet: 72, social: 55, monthly: 1800, hospitalMin: 30, hubMin: 70
  },

  /* ---------- 昭通市 ---------- */
  '昭通洒渔生态温泉养生营地': {
    city: '昭通市', county: '昭阳区', scene: '乡村温泉',
    altitude: 1950, climate: 70, air: 84, medical: 80, transport: 76,
    cost: 82, quiet: 72, social: 65, monthly: 1800, hospitalMin: 15, hubMin: 25
  },
  '昭通刚好遇见民宿': {
    city: '昭通市', county: '昭阳区', scene: '乡村庄园',
    altitude: 1950, climate: 70, air: 84, medical: 78, transport: 74,
    cost: 84, quiet: 80, social: 58, monthly: 1650, hospitalMin: 20, hubMin: 30
  },
  '昭通逸轩小憩民宿': {
    city: '昭通市', county: '昭阳区', scene: '市区',
    altitude: 1950, climate: 70, air: 84, medical: 84, transport: 80,
    cost: 82, quiet: 55, social: 72, monthly: 1750, hospitalMin: 10, hubMin: 20
  },
  '半山里民宿': {
    city: '昭通市', county: '大关县', scene: '山地村落',
    altitude: 1100, climate: 76, air: 88, medical: 52, transport: 50,
    cost: 86, quiet: 84, social: 42, monthly: 1500, hospitalMin: 40, hubMin: 90
  },
  '故里民宿（新街镇店）': {
    city: '昭通市', county: '鲁甸县', scene: '乡村',
    altitude: 1900, climate: 70, air: 86, medical: 58, transport: 62,
    cost: 86, quiet: 82, social: 45, monthly: 1500, hospitalMin: 30, hubMin: 60
  },
  '镇雄湖畔民宿': {
    city: '昭通市', county: '镇雄县', scene: '县城',
    altitude: 1600, climate: 72, air: 82, medical: 70, transport: 55,
    cost: 84, quiet: 68, social: 55, monthly: 1600, hospitalMin: 20, hubMin: 90
  },

  /* ---------- 丽江市 ---------- */
  '时年云民宿（永胜凤凰公园店）': {
    city: '丽江市', county: '永胜县', scene: '县城',
    altitude: 2100, climate: 72, air: 93, medical: 62, transport: 60,
    cost: 80, quiet: 76, social: 60, monthly: 1800, hospitalMin: 30, hubMin: 80
  },

  /* ---------- 昆明市 ---------- */
  '溪欢里民宿': {
    city: '昆明市', county: '五华区', scene: '市区',
    altitude: 1891, climate: 90, air: 90, medical: 96, transport: 96,
    cost: 58, quiet: 48, social: 92, monthly: 3200, hospitalMin: 5, hubMin: 25
  },
  '喜宿民宿': {
    city: '昆明市', county: '晋宁区', scene: '城区',
    altitude: 1890, climate: 89, air: 90, medical: 70, transport: 72,
    cost: 70, quiet: 62, social: 62, monthly: 2400, hospitalMin: 20, hubMin: 50
  },
  '昆明不舍民宿': {
    city: '昆明市', county: '晋宁区', scene: '城区',
    altitude: 1890, climate: 89, air: 90, medical: 70, transport: 72,
    cost: 72, quiet: 62, social: 62, monthly: 2300, hospitalMin: 20, hubMin: 50
  },
  '溪云花舍客栈(石林景区店)': {
    city: '昆明市', county: '石林县', scene: '景区',
    altitude: 1700, climate: 86, air: 90, medical: 68, transport: 68,
    cost: 74, quiet: 78, social: 70, monthly: 2200, hospitalMin: 25, hubMin: 60
  },
  '石林彝海康养中心': {
    city: '昆明市', county: '石林县', scene: '康养机构',
    altitude: 1700, climate: 86, air: 90, medical: 74, transport: 68,
    cost: 72, quiet: 76, social: 72, monthly: 2300, hospitalMin: 20, hubMin: 60
  },

  /* ---------- 曲靖市 ---------- */
  '德元客栈': {
    city: '曲靖市', county: '马龙区', scene: '乡村',
    altitude: 1950, climate: 78, air: 86, medical: 60, transport: 62,
    cost: 84, quiet: 80, social: 50, monthly: 1650, hospitalMin: 30, hubMin: 70
  },

  /* ---------- 楚雄州 ---------- */
  '泊隐林间民宿(温泉村店)': {
    city: '楚雄州', county: '禄丰市', scene: '乡村温泉',
    altitude: 1900, climate: 76, air: 90, medical: 55, transport: 62,
    cost: 82, quiet: 86, social: 45, monthly: 1700, hospitalMin: 35, hubMin: 70
  },
  '井里民宿（黑井古镇店）': {
    city: '楚雄州', county: '禄丰市', scene: '古镇',
    altitude: 1600, climate: 82, air: 90, medical: 50, transport: 48,
    cost: 84, quiet: 86, social: 58, monthly: 1600, hospitalMin: 45, hubMin: 100
  },
  '莫问炁舍民宿（黑井古镇店）': {
    city: '楚雄州', county: '禄丰市', scene: '古镇',
    altitude: 1600, climate: 82, air: 90, medical: 50, transport: 48,
    cost: 84, quiet: 86, social: 58, monthly: 1600, hospitalMin: 45, hubMin: 100
  },
  '白家小院民宿': {
    city: '楚雄州', county: '南华县', scene: '乡村',
    altitude: 1880, climate: 80, air: 90, medical: 58, transport: 55,
    cost: 84, quiet: 84, social: 50, monthly: 1600, hospitalMin: 35, hubMin: 80
  },
  '雨露蘑菇小屋': {
    city: '楚雄州', county: '南华县', scene: '乡村',
    altitude: 1900, climate: 80, air: 90, medical: 56, transport: 52,
    cost: 84, quiet: 86, social: 48, monthly: 1600, hospitalMin: 38, hubMin: 85
  },
  '牟定静谧湖舍': {
    city: '楚雄州', county: '牟定县', scene: '乡村',
    altitude: 1780, climate: 80, air: 90, medical: 62, transport: 58,
    cost: 84, quiet: 80, social: 52, monthly: 1650, hospitalMin: 25, hubMin: 75
  },
  '永仁外普拉山涧民宿': {
    city: '楚雄州', county: '永仁县', scene: '山地村落',
    altitude: 1600, climate: 80, air: 92, medical: 50, transport: 45,
    cost: 86, quiet: 90, social: 40, monthly: 1500, hospitalMin: 45, hubMin: 100
  },
  '云南元谋元马镇凤凰山云尚别墅18栋': {
    city: '楚雄州', county: '元谋县', scene: '县城',
    altitude: 1100, climate: 68, air: 90, medical: 62, transport: 55,
    cost: 86, quiet: 72, social: 55, monthly: 1500, hospitalMin: 25, hubMin: 80
  },

  /* ---------- 普洱市 ---------- */
  '普洱亚太森林组织基地酒店': {
    city: '普洱市', county: '思茅区', scene: '景区',
    altitude: 1302, climate: 88, air: 93, medical: 76, transport: 76,
    cost: 76, quiet: 80, social: 72, monthly: 2000, hospitalMin: 15, hubMin: 35
  },
  '普洱拾福小院民宿（茶马古道景区店）': {
    city: '普洱市', county: '思茅区', scene: '景区',
    altitude: 1302, climate: 88, air: 93, medical: 74, transport: 74,
    cost: 78, quiet: 78, social: 72, monthly: 1950, hospitalMin: 18, hubMin: 38
  },
  '隐茶小院': {
    city: '普洱市', county: '思茅区', scene: '城区',
    altitude: 1302, climate: 88, air: 93, medical: 78, transport: 78,
    cost: 76, quiet: 70, social: 74, monthly: 2000, hospitalMin: 12, hubMin: 32
  },
  '普洱水沅阁别墅客栈（茶马古城店）': {
    city: '普洱市', county: '思茅区', scene: '城区古镇',
    altitude: 1302, climate: 88, air: 93, medical: 76, transport: 76,
    cost: 76, quiet: 72, social: 76, monthly: 2000, hospitalMin: 15, hubMin: 35
  },
  '朵朵民宿': {
    city: '普洱市', county: '景东县', scene: '县城',
    altitude: 1200, climate: 86, air: 92, medical: 60, transport: 55,
    cost: 82, quiet: 78, social: 50, monthly: 1700, hospitalMin: 30, hubMin: 90
  },

  /* ---------- 临沧市 ---------- */
  '兰庭·山禾悦丨Theet&Clouds.茶文化四合院民宿（书院小区店）': {
    city: '临沧市', county: '凤庆县', scene: '县城',
    altitude: 1600, climate: 84, air: 90, medical: 62, transport: 55,
    cost: 82, quiet: 80, social: 58, monthly: 1700, hospitalMin: 25, hubMin: 90
  },

  /* ---------- 红河州 ---------- */
  '深几许民宿（建水古城文庙店）': {
    city: '红河州', county: '建水县', scene: '古城',
    altitude: 1300, climate: 84, air: 88, medical: 72, transport: 72,
    cost: 80, quiet: 76, social: 82, monthly: 1800, hospitalMin: 15, hubMin: 60
  },
  '建水结庐客栈': {
    city: '红河州', county: '建水县', scene: '古镇',
    altitude: 1300, climate: 84, air: 88, medical: 68, transport: 70,
    cost: 82, quiet: 84, social: 74, monthly: 1750, hospitalMin: 20, hubMin: 60
  },
  '云尚居民宿': {
    city: '红河州', county: '屏边县', scene: '县城',
    altitude: 1100, climate: 82, air: 92, medical: 55, transport: 50,
    cost: 84, quiet: 82, social: 45, monthly: 1600, hospitalMin: 35, hubMin: 90
  },

  /* ---------- 文山州 ---------- */
  '广南坝美炊烟小院': {
    city: '文山州', county: '广南县', scene: '景区村落',
    altitude: 750, climate: 82, air: 92, medical: 52, transport: 55,
    cost: 84, quiet: 88, social: 62, monthly: 1600, hospitalMin: 40, hubMin: 100
  },
  '广南坝美陌溪民宿': {
    city: '文山州', county: '广南县', scene: '景区村落',
    altitude: 750, climate: 82, air: 92, medical: 52, transport: 55,
    cost: 84, quiet: 88, social: 62, monthly: 1600, hospitalMin: 40, hubMin: 100
  },
  '广南坝美人家民宿': {
    city: '文山州', county: '广南县', scene: '景区村落',
    altitude: 750, climate: 82, air: 92, medical: 50, transport: 55,
    cost: 86, quiet: 90, social: 60, monthly: 1550, hospitalMin: 42, hubMin: 100
  },
  '六郎城仙草秘境民宿': {
    city: '文山州', county: '广南县', scene: '山地村落',
    altitude: 1200, climate: 80, air: 92, medical: 45, transport: 45,
    cost: 86, quiet: 92, social: 42, monthly: 1500, hospitalMin: 55, hubMin: 110
  },
  '新平褚橙庄园': {
    city: '文山州', county: '广南县', scene: '乡村庄园',
    altitude: 1200, climate: 80, air: 92, medical: 45, transport: 45,
    cost: 84, quiet: 92, social: 42, monthly: 1600, hospitalMin: 55, hubMin: 110
  },
  '花美时自在旅居精品民宿（普者黑风景区青龙山店）': {
    city: '文山州', county: '丘北县', scene: '景区村落',
    altitude: 1450, climate: 82, air: 92, medical: 58, transport: 62,
    cost: 76, quiet: 86, social: 72, monthly: 1900, hospitalMin: 32, hubMin: 90
  },
  '向往湖景度假民宿（普者黑风景区店）': {
    city: '文山州', county: '丘北县', scene: '景区村落',
    altitude: 1450, climate: 82, air: 92, medical: 58, transport: 62,
    cost: 78, quiet: 86, social: 72, monthly: 1850, hospitalMin: 32, hubMin: 90
  },
  '普者黑风之谷·空间美学湖景度假民宿': {
    city: '文山州', county: '丘北县', scene: '景区村落',
    altitude: 1450, climate: 82, air: 92, medical: 58, transport: 62,
    cost: 74, quiet: 86, social: 72, monthly: 1950, hospitalMin: 32, hubMin: 90
  },
  '普者黑一颗柠檬湖景轻奢民宿': {
    city: '文山州', county: '丘北县', scene: '景区村落',
    altitude: 1450, climate: 82, air: 92, medical: 58, transport: 62,
    cost: 76, quiet: 86, social: 72, monthly: 1900, hospitalMin: 32, hubMin: 90
  },
  '普者黑陌外锦鲤花园轻奢民宿': {
    city: '文山州', county: '丘北县', scene: '景区村落',
    altitude: 1450, climate: 82, air: 92, medical: 56, transport: 60,
    cost: 78, quiet: 88, social: 70, monthly: 1850, hospitalMin: 34, hubMin: 92
  },

  /* ---------- 西双版纳州 ---------- */
  '西双版纳南山隐茶园里民宿': {
    city: '西双版纳州', county: '勐海县', scene: '山地茶园',
    altitude: 1400, climate: 84, air: 94, medical: 48, transport: 58,
    cost: 78, quiet: 90, social: 55, monthly: 2000, hospitalMin: 50, hubMin: 80
  },
  '西双版纳匠庐·南糯山': {
    city: '西双版纳州', county: '勐海县', scene: '山地茶园',
    altitude: 1400, climate: 84, air: 94, medical: 48, transport: 58,
    cost: 74, quiet: 92, social: 55, monthly: 2100, hospitalMin: 50, hubMin: 80
  },
  '西双版纳景洪澜莎外苑森林温泉度假庄园（嘎洒国际机场店）': {
    city: '西双版纳州', county: '景洪市', scene: '城郊温泉',
    altitude: 550, climate: 82, air: 90, medical: 72, transport: 95,
    cost: 70, quiet: 76, social: 86, monthly: 2500, hospitalMin: 20, hubMin: 3
  },
  '勐巴拉云海温泉别墅': {
    city: '西双版纳州', county: '勐海县', scene: '度假区',
    altitude: 1200, climate: 84, air: 94, medical: 55, transport: 62,
    cost: 76, quiet: 84, social: 68, monthly: 2100, hospitalMin: 35, hubMin: 70
  },
  '勐巴拉悦庭温泉民宿': {
    city: '西双版纳州', county: '勐海县', scene: '度假区',
    altitude: 1200, climate: 84, air: 94, medical: 55, transport: 62,
    cost: 76, quiet: 84, social: 68, monthly: 2100, hospitalMin: 35, hubMin: 70
  }
}

/** 用于展示的中文维度名 */
export const DIMENSIONS = {
  nature: '自然气候与环境',
  medical: '医疗健康',
  transport: '出行与生活便利',
  cost: '生活成本与费用',
  social: '社交与文娱活动'
}
