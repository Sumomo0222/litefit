#!/usr/bin/env node
// 生成 data.js：按 PLAN_RULES.md 的阶段进阶规则，生成训练计划窗口（默认至未来 28 天）。
// 用法：node scripts/generate.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ===== 用户档案（修改计划前先改这里）=====
const profile = {
  goal: '减脂塑形',
  level: '零基础（基本不运动）',
  sessionMinutes: '15–20 分钟',
  venue: '户外为主（快走/慢跑 + 徒手）',
  startDate: '2026-11-25',
  weeklyTarget: 4,
};

const DAY = 24 * 60 * 60 * 1000;
const pad = n => (n < 10 ? '0' : '') + n;
const dkey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parse = s => new Date(s + 'T00:00:00');
const addD = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = d => { const x = new Date(d); return addD(x, -((x.getDay() + 6) % 7)); };
const WD = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// ===== 四个阶段（第 1–2 / 3–4 / 5–6 / 7+ 周）=====
const PHASES = [
  { name: '阶段 A · 适应期（第 1–2 周）', walk: 120, run: 60, rounds: 3, squat: 10, squatSets: 3, bridge: 12, calf: 15, plank: 20, plankSets: 2, deadbug: 8, circuitRounds: 2, pushup: 8, lunge: 8, mountain: 20, walkLong: 14, mMon: 19, mWed: 18, mFri: 16 },
  { name: '阶段 B · 建立期（第 3–4 周）', walk: 90, run: 120, rounds: 3, squat: 12, squatSets: 3, bridge: 15, calf: 20, plank: 25, plankSets: 2, deadbug: 10, circuitRounds: 2, pushup: 10, lunge: 10, mountain: 25, walkLong: 15, mMon: 19, mWed: 19, mFri: 16 },
  { name: '阶段 C · 提升期（第 5–6 周）', walk: 90, run: 180, rounds: 2, squat: 15, squatSets: 3, bridge: 15, calf: 20, plank: 30, plankSets: 2, deadbug: 10, circuitRounds: 3, pushup: 12, lunge: 12, mountain: 30, walkLong: 16, mMon: 19, mWed: 19, mFri: 18 },
  { name: '阶段 D · 稳定进阶（第 7 周起）', walk: 60, run: 240, rounds: 2, squat: 15, squatSets: 4, bridge: 20, calf: 25, plank: 35, plankSets: 3, deadbug: 12, circuitRounds: 3, pushup: 14, lunge: 14, mountain: 30, walkLong: 16, mMon: 20, mWed: 20, mFri: 18 },
];

function phaseOf(d) {
  const w1 = mondayOf(parse(profile.startDate)).getTime();
  const week = Math.floor((mondayOf(d).getTime() - w1) / (7 * DAY)) + 1;
  const idx = week <= 2 ? 0 : week <= 4 ? 1 : week <= 6 ? 2 : 3;
  return { week, ph: PHASES[idx] };
}

const warmWalk = t => [
  { name: '快走热身', detail: '2 分钟', tip: '比平常走路稍快，能正常说话' },
  t === 'mon' ? { name: '弓步转体', detail: '每侧 8 次', tip: '动作放慢，感受髋部打开' }
    : t === 'wed' ? { name: '轻松开合跳', detail: '20 秒 × 2 组', tip: '落地要轻；膝盖不适就跳过，改为原地踏步' }
    : { name: '原地徒手深蹲（慢）', detail: '8 次', tip: '用慢速度找动作感觉' },
  t === 'mon' ? { name: '侧摆腿', detail: '每侧 10 次', tip: '扶墙保持平衡' }
    : t === 'wed' ? { name: '高抬腿', detail: '20 秒', tip: '幅度不用大，激活即可' }
    : { name: '手臂大绕环', detail: '正反各 10 次' },
];

const coolRun = [
  { name: '小腿拉伸', detail: '每侧 30 秒', tip: '脚跟踩实地面' },
  { name: '大腿后侧拉伸', detail: '每侧 30 秒' },
  { name: '深呼吸放松', detail: '1 分钟', tip: '鼻吸 4 秒、嘴呼 6 秒' },
];
const coolLeg = [
  { name: '大腿前侧拉伸', detail: '每侧 30 秒', tip: '扶墙，膝盖指向地面' },
  { name: '大腿后侧拉伸', detail: '每侧 30 秒' },
  { name: '深呼吸放松', detail: '1 分钟' },
];

const buildMon = (d, ph) => ({
  type: '下肢力量 · 快走', totalMinutes: ph.mMon,
  warmup: warmWalk('mon'),
  main: [
    { name: '徒手深蹲', detail: `${ph.squat} 次 × ${ph.squatSets} 组`, rest: '组间休息 60 秒', tip: '膝盖对准脚尖方向，下蹲到大腿约与地面平行' },
    { name: '臀桥', detail: `${ph.bridge} 次 × 3 组`, rest: '组间休息 60 秒', tip: '顶起时夹紧臀部停 2 秒' },
    { name: '提踵', detail: `${ph.calf} 次 × 2 组`, rest: '组间休息 45 秒', tip: '扶墙完成，缓慢下落' },
  ],
  cooldown: coolLeg,
  notes: '力量日看重动作质量而不是速度；练完第二天大腿酸是正常的。',
});

const buildWed = (d, ph) => {
  const items = [
    { name: '走跑交替', detail: `快走 ${ph.walk / 60} 分钟 + 慢跑 ${ph.run / 60} 分钟 × ${ph.rounds} 轮（共约 ${(ph.walk + ph.run) * ph.rounds / 60} 分钟）`, rest: '快走的阶段就是恢复，不要停', tip: '强度以能边跑边说话为准；全程快走也完全可以' },
    { name: '跪姿平板支撑', detail: `${ph.plank} 秒 × ${ph.plankSets} 组`, rest: '组间休息 30 秒', tip: '腰背平直，不塌腰不撅臀' },
  ];
  if (ph.deadbug) items.push({ name: '死虫式', detail: `每侧 ${ph.deadbug} 次 × 2 组`, rest: '组间休息 30 秒', tip: '下背贴地，动作缓慢' });
  return {
    type: '走跑交替 · 核心', totalMinutes: ph.mWed,
    warmup: warmWalk('wed'), main: items, cooldown: coolRun,
    notes: '心肺日重节奏不重速度。跑步路线选平坦路面，穿缓冲好一点的鞋。',
  };
};

const buildFri = (d, ph) => {
  const plan = {
    type: '全身徒手循环', totalMinutes: ph.mFri,
    warmup: warmWalk('fri'),
    main: [
      { name: '全身循环', detail: `每轮：徒手深蹲 ${ph.squat} 次 + 跪姿（或靠墙）俯卧撑 ${ph.pushup} 次 + 反向弓步 每侧 ${ph.lunge} 次 + 登山者（慢速）${ph.mountain} 秒，共 ${ph.circuitRounds} 轮`, rest: '每轮之间休息 90 秒', tip: '俯卧撑做不了就扶墙/扶台阶；轮间可以多休息' },
    ],
    cooldown: [
      { name: '肩胸拉伸', detail: '30 秒' },
      { name: '大腿前侧拉伸', detail: '每侧 30 秒' },
      { name: '深呼吸放松', detail: '1 分钟' },
    ],
    notes: '循环训练是减脂利器：慢一点、做标准，比抢速度有效得多。',
  };
  if (ph.circuitRounds === 2) plan.main.push({ name: '跪姿平板支撑', detail: '20 秒 × 2 组', rest: '组间休息 30 秒' });
  return plan;
};

const buildSat = (d, ph) => ({
  type: '长快走 · 放松', totalMinutes: ph.walkLong + 4,
  warmup: [{ name: '慢走起步', detail: '2 分钟', tip: '从日常步速开始慢慢加速' }],
  main: [{ name: '快走', detail: `${ph.walkLong} 分钟`, rest: '全程保持能说话的节奏', tip: '途中可以加速 2 次 × 30 秒，量力而行' }],
  cooldown: [
    { name: '小腿拉伸', detail: '每侧 30 秒' },
    { name: '髋部拉伸', detail: '每侧 30 秒' },
    { name: '深呼吸放松', detail: '1 分钟' },
  ],
  notes: '长快走是减脂的主力课，别小看它。选条舒服的路线，当散步加练。',
});

const buildRest = (d, ph, sunday) => ({
  type: sunday ? '休息日 · 周小结' : '休息日', isRest: true, totalMinutes: 0,
  recovery: sunday
    ? '完全休息。晚上 20:00 在「每周总结」页看看本周总结和下周建议；页面打开着就会自动生成。'
    : '身体是在休息中变强的。今天不安排跑步和力量，散散步、拉伸一下就很好。',
  optional: [
    { name: '轻松散步', detail: '10 分钟（可选）', tip: '小区或公园慢节奏' },
    { name: '全身拉伸', detail: '5 分钟（可选）', tip: '重点：小腿、大腿、髋部' },
  ],
});

const BUILDERS = [buildMon, (d, ph, w) => buildRest(d, ph, false), buildWed, (d, ph, w) => buildRest(d, ph, false), buildFri, buildSat, (d, ph, w) => buildRest(d, ph, true)];

const now = new Date();
const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const start = parse(profile.startDate);
const from = start.getTime() < addD(today0, -1).getTime() ? start : addD(today0, -1);
const to = addD(today0, 27);

const plans = {};
for (let d = new Date(from); d.getTime() <= to.getTime(); d = addD(d, 1)) {
  const ds = dkey(d);
  const { week, ph } = phaseOf(d);
  const plan = BUILDERS[(d.getDay() + 6) % 7](d, ph, week);
  plans[ds] = Object.assign({ date: ds, weekday: WD[d.getDay()], phase: ph.name }, plan);
}

const payload = { version: 2, generatedAt: new Date().toISOString(), generator: 'scripts/generate.mjs', profile, plans };
writeFileSync(path.join(ROOT, 'data.js'),
  '/* 自动生成：node scripts/generate.mjs（每天 07:27 定时任务维护，勿手改） */\nwindow.__FIT_DATA__ = ' + JSON.stringify(payload, null, 1) + ';\n');
console.log('生成计划', Object.keys(plans).length, '天：', dkey(from), '→', dkey(to), '；阶段：', phaseOf(today0).ph.name);
