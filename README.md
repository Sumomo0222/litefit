# 轻练 LiteFit

手机端健身网页：户外减脂入门计划（零基础 · 每次 15–20 分钟）。

- 线上地址：https://sumomo0222.github.io/litefit/
- 三个页面：「今日训练」「训练打卡」「每周总结」
- 每天 07:27（北京时间）由 ZCode 定时任务更新计划；每周日 20:00 检查下周计划就绪
- 打卡数据保存在设备浏览器本地（localStorage），可用「同步码」在设备间迁移；周日晚由页面基于实际打卡自动生成周总结并存档

## 结构

- `index.html` — 单页应用（样式与逻辑内联）
- `data.js` — 自动生成的计划数据（`node scripts/generate.mjs`）
- `scripts/generate.mjs` — 计划生成器（阶段进阶规则）
- `PLAN_RULES.md` — 用户档案、进阶与调整规则、自动化说明

## 部署

推送到 `main` 分支后 GitHub Pages 自动发布（约 1–2 分钟）。
