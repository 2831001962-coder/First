/** 顶部样本标识：确认设计满意后再进入 App Store 打包阶段 */
export function SampleBadge() {
  return (
    <div className="sample-badge" aria-label="当前为样本预览版">
      <span className="sample-badge-dot" />
      样本预览 · 确认满意后再上架
    </div>
  )
}
