/**
 * 调查问卷定义（与《祖父母健康与旅居需求调查》20 题一致）
 *
 * type:
 *   single     单选
 *   multi      多选
 *   rank       排序（q10 的选项由 q9 的选中项动态决定）
 *   number     数值输入
 *   slider     0-100 滑块
 *   text       填空
 *
 * recommend: true 表示该题参与推荐计算
 */
export const SURVEY = [
  {
    id: 'q1',
    no: 1,
    type: 'multi',
    title: '您本次协助哪位长辈填写问卷？',
    hint: '可多选',
    options: [
      { value: 'paternal', label: '祖父母（父系长辈）' },
      { value: 'maternal', label: '外祖父母（母系长辈）' },
      { value: 'relative', label: '家族内其他亲属长辈（父母、姑姨、舅父、婶母等）' },
      { value: 'nonElder', label: '非长辈身份填写（亲友、晚辈等）' }
    ]
  },
  {
    id: 'q2',
    no: 2,
    type: 'single',
    title: '这位长辈的年龄是？',
    recommend: true,
    options: [
      { value: 'lt55', label: '55 岁以下' },
      { value: '55_64', label: '55-64 岁' },
      { value: '65_74', label: '65-74 岁' },
      { value: 'ge75', label: '75 岁及以上' }
    ]
  },
  {
    id: 'q3',
    no: 3,
    type: 'single',
    title: '在过去 12 个月内，这位长辈是否有过在云南省内旅居（停留 1 周以上）的经历或计划？',
    recommend: true,
    options: [
      { value: 'yes', label: '是（有云南省内旅居经历）' },
      { value: 'plan', label: '否（有省内旅居计划）' },
      { value: 'none', label: '否（暂无省内旅居计划）' },
      { value: 'local', label: '否（云南本省人，计划去省内/省外其他城市旅居）' }
    ]
  },
  {
    id: 'q4',
    no: 4,
    type: 'single',
    title: '您与这位长辈的亲属关系是？',
    options: [
      { value: 'grandson', label: '孙子/孙女' },
      { value: 'granddaughter', label: '外孙/外孙女' },
      { value: 'child', label: '儿子/女儿' },
      { value: 'inlaw', label: '儿媳/女婿/侄辈等' },
      { value: 'other', label: '其他' }
    ]
  },
  {
    id: 'q5',
    no: 5,
    type: 'single',
    title: '您平时协助这位长辈使用互联网平台（如微信、购物、挂号等）的频率是？',
    options: [
      { value: 'daily', label: '几乎每天' },
      { value: 'weekly', label: '每周几次' },
      { value: 'monthly', label: '每月几次' },
      { value: 'rarely', label: '很少或从不' }
    ]
  },
  {
    id: 'q6',
    no: 6,
    type: 'multi',
    title: '这位长辈目前患有哪些慢性疾病？',
    hint: '可多选，无则选"无上述慢性疾病"',
    recommend: true,
    options: [
      { value: 'hypertension', label: '高血压' },
      { value: 'diabetes', label: '糖尿病' },
      { value: 'heart', label: '心脏病（冠心病、心律失常等）' },
      { value: 'respiratory', label: '慢性呼吸系统疾病（哮喘、慢阻肺等）' },
      { value: 'arthritis', label: '关节炎/风湿' },
      { value: 'other', label: '其他' },
      { value: 'none', label: '无上述慢性疾病' }
    ]
  },
  {
    id: 'q7',
    no: 7,
    type: 'single',
    title: '对于上述疾病，这位长辈目前的整体控制情况如何？',
    recommend: true,
    options: [
      { value: 'good', label: '控制良好，无明显症状' },
      { value: 'stable', label: '基本稳定，偶尔有不适' },
      { value: 'fair', label: '控制一般，常有不适' },
      { value: 'poor', label: '控制较差，症状明显' },
      { value: 'na', label: '不适用（无慢性疾病）' }
    ]
  },
  {
    id: 'q8',
    no: 8,
    type: 'single',
    title: '这位长辈对自身体能状况的评价是？',
    hint: '请根据日常观察选择',
    recommend: true,
    options: [
      { value: 'active', label: '行动自如，能轻松进行长距离步行' },
      { value: 'tired', label: '行动正常，但易疲劳' },
      { value: 'aid', label: '需借助拐杖等辅助工具' },
      { value: 'bedridden', label: '行动不便，需他人照料' }
    ]
  },
  {
    id: 'q9',
    no: 9,
    type: 'multi',
    title: '这位长辈在选择旅居目的地时，最关注的因素有哪些？',
    hint: '可多选',
    recommend: true,
    options: [
      { value: 'climate', label: '气候温和（温度适宜、昼夜温差小）' },
      { value: 'altitude', label: '海拔较低（避免高原反应）' },
      { value: 'air', label: '空气质量好（AQI 常年优良）' },
      { value: 'medical', label: '周边有优质医疗资源（三甲医院或社区医院近）' },
      { value: 'quiet', label: '环境安静、绿化好' },
      { value: 'transport', label: '交通便利（距机场/车站、公共交通）' },
      { value: 'cost', label: '生活成本适中（住宿、餐饮、日常消费）' }
    ]
  },
  {
    id: 'q10',
    no: 10,
    type: 'rank',
    title: '请对您刚才选中的最看重的因素按重要程度从高到低排序',
    hint: '最上面 = 最重要，用 ↑ ↓ 调整顺序',
    recommend: true,
    optionSource: 'q9'
  },
  {
    id: 'q11',
    no: 11,
    type: 'rank',
    title: '选择云南旅居目的地时，请按重要程度对以下各项资源排序',
    hint: '最上面 = 最重要，顺序直接决定推荐权重',
    recommend: true,
    options: [
      { value: 'nature', label: '自然气候与环境（气候温和、空气、海拔、绿化）' },
      { value: 'medical', label: '医疗健康（周边医疗资源可及）' },
      { value: 'transport', label: '出行与生活便利（交通、生活配套）' },
      { value: 'cost', label: '生活成本与费用（食宿及日常开销）' },
      { value: 'social', label: '社交与文娱活动（交流、休闲）' }
    ]
  },
  {
    id: 'q12',
    no: 12,
    type: 'single',
    title: '您长辈期望的旅居时长是？',
    recommend: true,
    options: [
      { value: '1_2w', label: '1-2 周' },
      { value: '1_3m', label: '1-3 个月' },
      { value: '3m_plus', label: '3 个月以上' },
      { value: 'depends', label: '视情况而定' }
    ]
  },
  {
    id: 'q13',
    no: 13,
    type: 'number',
    title: '您/长辈能接受的旅居月均总花费（含住宿、餐饮、日常开销）大约是？',
    hint: '单位：元/月',
    recommend: true,
    min: 800,
    max: 12000,
    step: 100,
    default: 2500
  },
  {
    id: 'q14',
    no: 14,
    type: 'slider',
    title: '您/长辈对"气候环境"的敏感度',
    hint: '0 分 = 完全不挑，100 分 = 极其挑剔',
    recommend: true,
    min: 0,
    max: 100,
    step: 5,
    default: 60
  },
  {
    id: 'q15',
    no: 15,
    type: 'single',
    title: '您长辈对住宿周边"医疗可达性"的具体要求是？',
    recommend: true,
    options: [
      { value: 'm15', label: '15 分钟车程内必须有综合医院' },
      { value: 'm30', label: '30 分钟车程内有医院即可' },
      { value: 'clinic', label: '附近有诊所或社区卫生服务中心就行' },
      { value: 'none', label: '无特别要求' }
    ]
  },
  {
    id: 'q16',
    no: 16,
    type: 'single',
    title: '您是否使用过"云南省旅居养老服务可视化平台"为这位长辈查询信息或规划旅居？',
    options: [
      { value: 'yes', label: '是（继续答题）' },
      { value: 'no', label: '否（跳过后两题）' }
    ]
  },
  {
    id: 'q17',
    no: 17,
    type: 'single',
    title: '您使用该平台的频率大约是？',
    showIf: { id: 'q16', value: 'yes' },
    options: [
      { value: 'never', label: '几乎不用' },
      { value: '1_3', label: '1-3 次' },
      { value: '4_6', label: '4-6 次' },
      { value: '7plus', label: '7 次及以上' }
    ]
  },
  {
    id: 'q18',
    no: 18,
    type: 'single',
    title: '在使用平台的过程中，您是否注意到平台为长辈生成的"康养适宜度指数（HAI 评分）"？',
    showIf: { id: 'q16', value: 'yes' },
    options: [
      { value: 'yes_reasonable', label: '是，并且我认为评分合理' },
      { value: 'yes_inaccurate', label: '是，但我认为评分不够准确' },
      { value: 'no', label: '否，未注意到' }
    ]
  },
  {
    id: 'q19',
    no: 19,
    type: 'single',
    title: '您认为平台的适老化设计（大字体、简操作）对这位长辈独立使用平台的帮助程度是？',
    options: [
      { value: 'very', label: '非常有帮助，长辈能自己操作' },
      { value: 'some', label: '有帮助，但仍需我协助' },
      { value: 'little', label: '帮助不大，长辈仍依赖我' },
      { value: 'none', label: '长辈完全无法独立使用' }
    ]
  },
  {
    id: 'q20',
    no: 20,
    type: 'text',
    title: '您对"旅居云图——云南省旅居养老服务可视化平台"有哪些改进建议？',
    hint: '选填。特别是从家属/孙辈协助长辈的角度，您认为"代际协作"功能还能做些什么？',
    optional: true,
    maxlength: 500
  }
]

/** 题型的中文标签 */
export const TYPE_LABEL = {
  single: '单选',
  multi: '多选',
  rank: '排序',
  number: '填空',
  slider: '滑块',
  text: '填空'
}

/** 生成问卷初始答案 */
export function createAnswers() {
  const answers = {}
  SURVEY.forEach((q) => {
    if (q.type === 'multi') answers[q.id] = []
    else if (q.type === 'rank') answers[q.id] = q.options ? q.options.map((o) => o.value) : []
    else if (q.type === 'number' || q.type === 'slider') answers[q.id] = q.default
    else if (q.type === 'text') answers[q.id] = ''
    else answers[q.id] = ''
  })
  return answers
}
