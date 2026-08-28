#!/usr/bin/env node
/**
 * 生成题库 JSON 包（原创模板题，可重复运行覆盖 seed 文件）
 * 用法: node scripts/seed-bank.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dir, '../src/data/bank/packs')

mkdirSync(outDir, { recursive: true })

const LETTERS = ['A', 'B', 'C', 'D']

function mcq(stem, correct, distractors, explanation, difficulty = 2) {
  const opts = [correct, ...distractors].sort(() => Math.random() - 0.5)
  return {
    stem,
    options: opts.map((t, i) => `${LETTERS[i]}. ${t}`),
    answer: opts.indexOf(correct),
    explanation,
    difficulty,
  }
}

function writePack(meta, questions) {
  const full = questions.map((q, i) => ({
    id: `${meta.category}-${String(i + 1).padStart(3, '0')}`,
    ...q,
  }))
  writeFileSync(
    join(outDir, `${meta.id}.json`),
    JSON.stringify({ meta, questions: full }, null, 2),
    'utf8',
  )
  console.log(`  ✓ ${meta.id}.json — ${full.length} 题`)
}

// ── 行测扩充包（每模块 20 题模板） ──
const xingceTemplates = {
  yuyan: [
    (n) =>
      mcq(
        `第 ${n} 题：下列成语填入横线最恰当的是：\n\n面对困难，我们更需要保持战略______，不急于求成。`,
        '定力',
        ['动力', '压力', '张力'],
        '“战略定力”为固定搭配，强调在复杂局面下保持稳定方向。',
      ),
    (n) =>
      mcq(
        `第 ${n} 题：这段文字主要强调的是：\n\n推进数字政府建设，关键不在系统建得多大，而在数据能否跨部门共享、服务能否真正便民。`,
        '数字政府建设应突出共享与便民实效',
        ['应加大硬件投入', '部门壁垒无法打破', '系统越大越好'],
        '文段转折后强调共享与便民，而非建设规模。',
      ),
  ],
  shuliang: [
    (n) =>
      mcq(
        `第 ${n} 题：某班 ${40 + n} 人，男生占 60%。若再来 4 名女生，男生占比变为 50%。原男生人数为：`,
        `${Math.floor((40 + n) * 0.6)} 人`,
        [`${Math.floor((40 + n) * 0.5)} 人`, `${20 + n} 人`, `${24 + n} 人`],
        '设原男生 x，列方程 (x+0)/(40+n+4)=0.5 并结合原占比求解。',
        2,
      ),
    (n) =>
      mcq(
        `第 ${n} 题：商品原价 ${100 + n * 5} 元，先降 10% 再打 8 折，现价为：`,
        `${Math.round((100 + n * 5) * 0.9 * 0.8)} 元`,
        [`${Math.round((100 + n * 5) * 0.72)} 元`, `${100 + n * 5 - 20} 元`, `${Math.round((100 + n * 5) * 0.8)} 元`],
        '连乘折扣：原价 × 0.9 × 0.8。',
      ),
  ],
  panduan: [
    (n) =>
      mcq(
        `第 ${n} 题：“授权性规范”指规定可为或可为一定行为的法律规范。下列属于授权性规范的是：`,
        '公民可以依照法律规定立遗嘱',
        ['一切机关必须依法行使职权', '禁止任何组织个人侵占公物', '盗窃公私财物数额较大的处刑罚'],
        '授权性规范赋予主体权利，“可以”为典型标志。',
      ),
    (n) =>
      mcq(
        `第 ${n} 题：医生 ∶ 医院　相当于`,
        '教师 ∶ 学校',
        ['学生 ∶ 课本', '演员 ∶ 观众', '司机 ∶ 道路'],
        '职业与其主要工作场所的对应关系。',
      ),
  ],
  ziliao: [
    (n) =>
      mcq(
        `第 ${n} 题：2024 年某市 GDP ${2000 + n * 50} 亿元，增长 ${5 + (n % 3)}%。则 2023 年 GDP 约为：`,
        `${Math.round((2000 + n * 50) / (1 + (5 + (n % 3)) / 100))} 亿元`,
        [`${1900 + n * 40} 亿元`, `${2100 + n * 50} 亿元`, `${2000 + n * 50} 亿元`],
        '基期 = 现期 / (1 + 增长率)。',
      ),
  ],
  changshi: [
    (n) =>
      mcq(
        `第 ${n} 题：下列属于全国人民代表大会职权的是：`,
        '修改宪法，监督宪法的实施',
        ['解释法律', '发布行政命令', '领导全国武装力量日常事务'],
        '修宪与监督宪法实施属全国人大职权；解释法律属全国人大常委会。',
      ),
    (n) =>
      mcq(
        `第 ${n} 题：我国实行社会主义市场经济，市场在资源配置中起：`,
        '决定性作用',
        ['基础性作用', '辅助性作用', '完全主导作用'],
        '党的十八届三中全会明确市场在资源配置中起决定性作用。',
      ),
  ],
}

for (const [cat, templates] of Object.entries(xingceTemplates)) {
  const qs = []
  for (let i = 0; i < 20; i++) {
    qs.push(templates[i % templates.length](i + 1))
  }
  writePack(
    {
      id: `xingce-${cat}-seed`,
      subject: 'xingce',
      category: cat,
      name: `行测·${cat}扩充`,
      description: '模板生成的扩充练习题',
      version: 1,
    },
    qs,
  )
}

// ── 专业知识六大类（每类 30 题） ──
const zhuanyeSeeds = {
  falv: {
    name: '法律专业知识',
    desc: '宪法、行政法、民法、刑法等（适用司法行政、法治类岗位）',
    topics: [
      ['行政处罚遵循的原则不包括', '一事不再罚', ['一事两罚', '过罚相当', '处罚法定'], '一事不再罚是原则，非“不包括”。'],
      ['下列属于具体行政行为的是', '某市市场监管局对某公司作出罚款决定', ['制定地方性法规', '发布政策白皮书', '法院判决民事案件'], '具体行政行为针对特定对象。'],
      ['行政复议申请的一般期限为知道该行为之日起', '60 日', ['30 日', '90 日', '15 日'], '《行政复议法》规定一般为 60 日。'],
      ['民法典规定，自然人的民事权利能力', '始于出生、终于死亡', ['始于成年', '始于登记', '可随意放弃'], '民事权利能力一律平等，始于出生。'],
      ['犯罪构成要件不包括', '犯罪结果必然发生', ['犯罪主体', '犯罪主观方面', '犯罪客体'], '结果并非所有犯罪必备要件。'],
    ],
  },
  kuaiji: {
    name: '财会审计专业知识',
    desc: '会计、审计、财务管理（适用审计署、财政金融监管类岗位）',
    topics: [
      ['资产负债表中，下列属于流动资产的是', '应收账款', ['固定资产', '无形资产', '长期股权投资'], '应收账款预期一年内变现，属流动资产。'],
      ['借贷记账法下，资产增加应记', '借方', ['贷方', '借贷均可', '视科目而定'], '资产类账户增加记借方。'],
      ['审计报告类型不包括', '内部审计报告（对外法定披露）', ['无保留意见', '保留意见', '否定意见'], '对外法定审计报告为注册会计师出具的四类意见。'],
      ['增值税一般纳税人基本税率（货物销售）为', '13%', ['6%', '9%', '3%'], '现行一般货物销售税率为 13%。'],
      ['权责发生制下，收入确认应以', '权利取得时确认', ['收到现金时', '开票时', '发货时'], '权责发生制以权利义务发生为准。'],
    ],
  },
  jisuanji: {
    name: '计算机专业知识',
    desc: '网络、数据库、信息安全（适用网信、信息化类岗位）',
    topics: [
      ['TCP/IP 模型中，HTTP 位于', '应用层', ['传输层', '网络层', '数据链路层'], 'HTTP 是应用层协议。'],
      ['关系数据库中，用于保证实体完整性的约束是', '主键约束', ['外键约束', '检查约束', '唯一索引'], '主键保证实体完整性。'],
      ['下列属于对称加密算法的是', 'AES', ['RSA', 'ECC', 'DSA'], 'AES 为对称加密；RSA 等为非对称。'],
      ['SQL 中用于去重的是', 'SELECT DISTINCT', ['SELECT UNIQUE ALL', 'SELECT GROUP', 'SELECT ONLY'], 'DISTINCT 去重。'],
      ['HTTPS 在 HTTP 基础上增加了', 'TLS/SSL 加密', ['FTP 传输', 'DNS 解析', 'ICMP 控制'], 'HTTPS = HTTP + TLS。'],
    ],
  },
  jinrong: {
    name: '金融监管专业知识',
    desc: '银行、证券、保险监管（适用金融监管总局、证监会类岗位）',
    topics: [
      ['我国货币政策最终目标不包括', '固定汇率', ['物价稳定', '充分就业', '经济增长'], '汇率属开放经济目标，非传统最终目标唯一表述。'],
      ['商业银行资本充足率监管要求体现', '审慎监管原则', ['自由竞争原则', '存款保险原则', '窗口指导原则'], '资本充足率是审慎监管核心指标。'],
      ['证券发行注册制强调', '信息披露为中心', ['政府审批定价', '额度管理', '隐形担保'], '注册制以信息披露为核心。'],
      ['保险法上的最大诚信原则要求', '双方如实告知重要情况', ['保险公司单方免责', '投保人无需告知', '默示即可'], '最大诚信强调告知义务。'],
      ['宏观审慎政策关注', '系统性金融风险', ['单一企业利润', '个别账户安全', '短期汇率波动'], '宏观审慎防系统性风险。'],
    ],
  },
  gongan: {
    name: '公安基础专业知识',
    desc: '警种基础、执法规范（适用公安机关人民警察职位加试）',
    topics: [
      ['人民警察的根本宗旨是', '全心全意为人民服务', ['打击犯罪唯一', '维护内部秩序', '完成上级命令'], '宗旨是全心全意为人民服务。'],
      ['使用警械和武器的前提之一是', '存在法定情形且经警告无效', ['任意时间可用', '无需警告', '仅口头制止'], '需符合法定情形并通常先警告。'],
      ['治安管理处罚种类不包括', '拘役', ['警告', '罚款', '行政拘留'], '拘役属于刑罚，非治安处罚。'],
      ['盘查公民时应当', '出示证件并说明理由', ['秘密进行', '无需表明身份', '可单独夜间入户'], '盘查应表明身份并说明理由。'],
      ['公安机关办理刑事案件第一程序是', '立案', ['侦查终结', '起诉', '审判'], '刑事诉讼一般从立案开始。'],
    ],
  },
  waiyu: {
    name: '外语专业知识',
    desc: '英语阅读与翻译（适用外交部、商务外语类岗位）',
    topics: [
      ['Choose the best translation:\n"Governance lies in addressing concerns."', '治政之道，在于安民', ['治理在于开会', '管理在于监督', '政治在于演讲'], 'addressing concerns 意指回应关切、安民。'],
      ['The phrase "due diligence" in finance means', '尽职调查', ['延迟付款', '尽职免责', '尽职加班'], 'due diligence 译为尽职调查。'],
      ['"Notwithstanding" 在法律文本中通常表示', '尽管、不论', ['因此', '然而', '并且'], 'notwithstanding = despite。'],
      ['Passive voice: "The policy was implemented." 强调', '政策被实施（动作承受者）', ['施动者未知', '将来时', '虚拟语气'], '被动语态强调承受者或施动者省略。'],
      ['"Public procurement" refers to', '政府采购', ['公开采购私人财产', '公共采购员', '采购公开化流程'], 'public procurement 即政府采购。'],
    ],
  },
}

for (const [cat, cfg] of Object.entries(zhuanyeSeeds)) {
  const qs = []
  for (let i = 0; i < 30; i++) {
    const t = cfg.topics[i % cfg.topics.length]
    qs.push(mcq(`【${cfg.name}】${t[0]}`, t[1], t[2], t[3], 1 + (i % 3)))
  }
  writePack(
    {
      id: `zhuanye-${cat}-seed`,
      subject: 'zhuanye',
      category: cat,
      name: cfg.name,
      description: cfg.desc,
      version: 1,
    },
    qs,
  )
}

console.log('\n题库 seed 生成完成。')
