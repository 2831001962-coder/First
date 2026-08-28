import type { FigureId } from '../components/figures/PatternFigures'

export type CategoryId =
  | 'yuyan'
  | 'shuliang'
  | 'panduan'
  | 'ziliao'
  | 'changshi'

export type Question = {
  id: string
  category: CategoryId
  stem: string
  options: string[]
  answer: number
  explanation: string
  difficulty: 1 | 2 | 3
  /** 题干配图（图形推理等） */
  figure?: FigureId
  /** 选项配图，与 options 一一对应 */
  optionFigures?: FigureId[]
}

export const CATEGORIES: Record<
  CategoryId,
  { name: string; short: string; color: string; tip: string }
> = {
  yuyan: {
    name: '言语理解与表达',
    short: '言语',
    color: 'var(--cat-yuyan)',
    tip: '抓主旨、看逻辑、辨语境',
  },
  shuliang: {
    name: '数量关系',
    short: '数量',
    color: 'var(--cat-shuliang)',
    tip: '方程、比例、特值优先',
  },
  panduan: {
    name: '判断推理',
    short: '判断',
    color: 'var(--cat-panduan)',
    tip: '图形规律、定义、类比、逻辑',
  },
  ziliao: {
    name: '资料分析',
    short: '资料',
    color: 'var(--cat-ziliao)',
    tip: '速算、增长率、比重、平均数',
  },
  changshi: {
    name: '常识判断',
    short: '常识',
    color: 'var(--cat-changshi)',
    tip: '时政、法律、科技、人文地理',
  },
}

export const QUESTIONS: Question[] = [
  {
    id: 'yy-1',
    category: 'yuyan',
    stem: '填入画横线部分最恰当的一项是：\n\n在信息爆炸的时代，人们更容易被碎片化内容________，真正深入阅读的时间被不断挤压，思辨能力也因此逐渐________。',
    options: [
      'A. 裹挟　退化',
      'B. 吸引　提升',
      'C. 干扰　稳固',
      'D. 诱惑　成熟',
    ],
    answer: 0,
    explanation:
      '第一空强调被动卷入信息洪流，“裹挟”最贴切；第二空与思辨能力下降对应，“退化”符合语境。',
    difficulty: 2,
  },
  {
    id: 'yy-2',
    category: 'yuyan',
    stem: '这段文字意在说明：\n\n基层治理的关键，不在于制度文本写得多完善，而在于政策能否落到“最后一公里”。许多好政策卡在执行环节，往往是因为缺少对真实场景的体察，以及与群众需求的对接。',
    options: [
      'A. 制度完善是基层治理的前提',
      'B. 政策落地比文本设计更关键',
      'C. 群众需求难以被准确把握',
      'D. 基层干部执行能力有待提高',
    ],
    answer: 1,
    explanation:
      '文段强调“最后一公里”与落地执行，主旨是政策落地比文本完善更关键。',
    difficulty: 1,
  },
  {
    id: 'yy-3',
    category: 'yuyan',
    stem: '下列句子中，没有语病的一项是：',
    options: [
      'A. 通过这次专项整治，使当地营商环境得到明显改善。',
      'B. 能否坚持学习，是提高公考成绩的关键。',
      'C. 各地要统筹推进乡村振兴与新型城镇化建设。',
      'D. 大约有将近三分之一的考生选择了行政执法类岗位。',
    ],
    answer: 2,
    explanation:
      'A 缺主语；B “能否”与单面表述不对应；D “大约”与“将近”重复；C 正确。',
    difficulty: 2,
  },
  {
    id: 'sl-1',
    category: 'shuliang',
    stem: '某市招录公务员 120 人，其中行政岗与执法岗人数比为 3∶2。若行政岗再招 12 人，则两类岗位人数比为多少？',
    options: ['A. 5∶3', 'B. 4∶3', 'C. 7∶4', 'D. 9∶5'],
    answer: 2,
    explanation:
      '行政∶执法 = 3∶2，总数 120，行政 72，执法 48。再招 12 后行政 84，84∶48 = 7∶4。',
    difficulty: 1,
  },
  {
    id: 'sl-2',
    category: 'shuliang',
    stem: '甲乙两人同时从 A 地出发去 B 地，甲速度为 60 km/h，乙速度为 40 km/h。甲到达后立即返回，在距 B 地 20 km 处与乙相遇。则 A、B 两地距离为：',
    options: ['A. 80 km', 'B. 100 km', 'C. 120 km', 'D. 140 km'],
    answer: 1,
    explanation:
      '设距离为 s。相遇时甲走了 s+(s-20)，乙走了 s-20，时间相同：\n[2s-20]/60 = (s-20)/40 → 2(2s-20)=3(s-20) → 4s-40=3s-60 → s=100。',
    difficulty: 3,
  },
  {
    id: 'sl-3',
    category: 'shuliang',
    stem: '一项工程，甲独做需 12 天，乙独做需 18 天。两人合作 4 天后，剩下的由乙单独完成，还需要几天？',
    options: ['A. 6 天', 'B. 8 天', 'C. 9 天', 'D. 10 天'],
    answer: 1,
    explanation:
      '甲效率 1/12，乙 1/18。合作 4 天完成 4(1/12+1/18)=4(5/36)=5/9，剩余 4/9。乙需 (4/9)/(1/18)=8 天。',
    difficulty: 2,
  },
  {
    id: 'pd-1',
    category: 'panduan',
    stem: '从所给四个选项中，选择最合适的一个填入问号处，使之呈现一定规律性：',
    figure: 'seq-lines-123q',
    options: ['A', 'B', 'C', 'D'],
    optionFigures: [
      'circle-4-lines',
      'circle-2-curves',
      'circle-full',
      'triangle-3-lines',
    ],
    answer: 0,
    explanation: '直线数量递增：1、2、3、4，故选 A（被四条直线分割的圆）。',
    difficulty: 1,
  },
  {
    id: 'pd-2',
    category: 'panduan',
    stem: '“行政协议”是指行政机关为了实现行政管理或公共服务目标，与公民、法人或其他组织协商订立的具有行政法上权利义务内容的协议。\n\n根据上述定义，下列属于行政协议的是：',
    options: [
      'A. 某市与企业签订的产业扶持合作协议',
      'B. 两家公司之间的房屋租赁合同',
      'C. 居民小区业主委员会内部管理公约',
      'D. 考生与培训机构签订的辅导服务合同',
    ],
    answer: 0,
    explanation:
      '行政协议须有行政机关一方，且以实现行政管理或公共服务为目标。A 符合；其余均为平等民事主体协议。',
    difficulty: 2,
  },
  {
    id: 'pd-3',
    category: 'panduan',
    stem: '钢笔 ∶ 书写　相当于',
    options: [
      'A. 渔网 ∶ 编织',
      'B. 船只 ∶ 航行',
      'C. 斧头 ∶ 砍伐',
      'D. 眼镜 ∶ 眼睛',
    ],
    answer: 2,
    explanation: '工具与其主要功能：钢笔用于书写，斧头用于砍伐。B 是载体与活动，对应不如 C 准确。',
    difficulty: 2,
  },
  {
    id: 'zl-1',
    category: 'ziliao',
    stem: '2023 年某省一般公共预算收入 2400 亿元，同比增长 8%。则 2022 年该省一般公共预算收入约为：',
    options: ['A. 2100 亿元', 'B. 2222 亿元', 'C. 2280 亿元', 'D. 2320 亿元'],
    answer: 1,
    explanation: '基期 = 现期 / (1+r) = 2400 / 1.08 ≈ 2222 亿元。',
    difficulty: 1,
  },
  {
    id: 'zl-2',
    category: 'ziliao',
    stem: '某市进出口总额 500 亿美元，其中出口 320 亿美元。出口额占进出口总额的比重约为：',
    options: ['A. 56%', 'B. 60%', 'C. 64%', 'D. 68%'],
    answer: 2,
    explanation: '320 / 500 = 0.64 = 64%。',
    difficulty: 1,
  },
  {
    id: 'zl-3',
    category: 'ziliao',
    stem: '2024 年一季度，甲地 GDP 增长 5.2%，乙地增长 6.8%。若两地基期 GDP 相同，则一季度甲乙两地 GDP 之比为：',
    options: ['A. 105.2∶106.8', 'B. 5.2∶6.8', 'C. 1∶1', 'D. 52∶68'],
    answer: 0,
    explanation:
      '基期相同设为 100，则现期分别为 105.2 与 106.8，之比即 105.2∶106.8。',
    difficulty: 2,
  },
  {
    id: 'cs-1',
    category: 'changshi',
    stem: '下列关于《中华人民共和国宪法》的表述，正确的是：',
    options: [
      'A. 全国人大常委会有权修改宪法',
      'B. 宪法的修改由全国人大常委会提议',
      'C. 宪法修改由全国人大以全体代表的三分之二以上多数通过',
      'D. 地方各级人大有权解释宪法',
    ],
    answer: 2,
    explanation:
      '宪法由全国人大修改，须经全体代表三分之二以上多数通过。常委会无权修改或解释宪法。',
    difficulty: 2,
  },
  {
    id: 'cs-2',
    category: 'changshi',
    stem: '下列属于货币政策工具的是：',
    options: [
      'A. 调整存款准备金率',
      'B. 提高个人所得税起征点',
      'C. 发行地方政府专项债券',
      'D. 加大财政转移支付力度',
    ],
    answer: 0,
    explanation: '存款准备金率是典型货币政策工具；其余属于财政政策范畴。',
    difficulty: 1,
  },
  {
    id: 'cs-3',
    category: 'changshi',
    stem: '“十四五”规划纲要提出，坚持创新在我国现代化建设全局中的：',
    options: ['A. 基础地位', 'B. 核心地位', 'C. 主导地位', 'D. 关键地位'],
    answer: 1,
    explanation: '坚持创新在我国现代化建设全局中的核心地位。',
    difficulty: 1,
  },
  {
    id: 'yy-4',
    category: 'yuyan',
    stem: '依次填入画横线部分最恰当的一项是：\n\n面对复杂国际形势，我们既要保持战略________，又要增强忧患意识，做到________、未雨绸缪。',
    options: [
      'A. 定力　居安思危',
      'B. 耐心　见微知著',
      'C. 自信　防微杜渐',
      'D. 韧性　防患未然',
    ],
    answer: 0,
    explanation:
      '“战略定力”为常见搭配；后文“未雨绸缪”与“居安思危”形成并列递进，语境最顺。',
    difficulty: 2,
  },
  {
    id: 'pd-4',
    category: 'panduan',
    stem: '所有参加笔试的考生都买了行测教材。有些买了行测教材的考生也买了申论教材。所以：',
    options: [
      'A. 所有参加笔试的考生都买了申论教材',
      'B. 有些参加笔试的考生买了申论教材',
      'C. 有些买了申论教材的考生参加了笔试',
      'D. 以上都不必然成立',
    ],
    answer: 3,
    explanation:
      '“有些买行测的也买申论”未必与“参加笔试者”有交集，故 A、B、C 均不必然成立。',
    difficulty: 3,
  },
  {
    id: 'sl-4',
    category: 'shuliang',
    stem: '一个两位数，十位数字比个位数字大 3。若将该数个位与十位对调，新数比原数小 27。则原数为：',
    options: ['A. 52', 'B. 63', 'C. 74', 'D. 85'],
    answer: 1,
    explanation:
      '设十位 a、个位 b，a=b+3，10a+b - (10b+a)=27 → 9a-9b=27 → a-b=3，与条件一致。验证：63→36，差 27。',
    difficulty: 2,
  },
]

export function getQuestionsByCategory(category: CategoryId | 'all'): Question[] {
  if (category === 'all') return QUESTIONS
  return QUESTIONS.filter((q) => q.category === category)
}

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id)
}
