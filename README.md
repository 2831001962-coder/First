# 词元工厂

把电力与数据炼成可计量智能词元的演示 Web App（移动优先）。

## 功能

- **生产台**：选择产线、投递提示词，观看输入/输出词元沿输送带出炉
- **产线目录**：青焰 / 星河 / 炉焰 / 九州四条模拟产线（速率、单价、时延不同）
- **生产台账**：批次记录、词元与费用累计（本地存储）
- **切词演示**：中英混合文本的教育向词元切分（非真实大模型分词器）

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

Vite · React 19 · TypeScript · React Router
