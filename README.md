# 岸途 · 公考备考

面向公务员笔试的轻量备考 Web App（移动优先）。

## 国考三大科目

| 科目 | 说明 | 当前题库 |
|------|------|----------|
| **行测** | 行政职业能力测验（全员必考） | ~118 题 |
| **申论** | 申论材料与练笔 | 5 套 |
| **专业知识** | 部分岗位加试（公安、金融、法律、财会、计算机、外语等） | ~180 题 |

**客观题合计约 298 题**，支持 JSON 批量导入扩充至海量题库。

## 功能

- 行测五大模块 + 专业知识六大方向
- 每日一练、迷你模考、错题本
- 申论练笔（草稿 + 参考提纲）
- 每日提醒、考试倒计时
- **题库总览** + JSON 题包导入

## 扩充海量题库

### 1. 重新生成 seed 题包

```bash
npm run seed:bank
```

### 2. 导入自定义题包

1. 参考 `data/import/example-pack.json` 格式
2. 将 JSON 放入 `data/import/`
3. 运行：

```bash
npm run import:bank
```

题包会自动合并到 `src/data/bank/packs/`，App 重启后生效。

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 技术栈

Vite · React 19 · TypeScript · React Router · JSON 题包架构
