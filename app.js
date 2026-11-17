/* 心安 · 数字资产（界面复刻演示版） —— 纯本地存储，无联网请求 */
(function () {
'use strict';

const KEY = 'xinan_v1';
const $  = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => Array.prototype.slice.call((p || document).querySelectorAll(s));
const CATS = ['负债', '固定资产', '流动资产', '投资资产'];
const ASSET_CATS = ['固定资产', '流动资产', '投资资产'];
const CLS = { '负债':'sc-liab', '固定资产':'sc-fixed', '流动资产':'sc-flow', '投资资产':'sc-invest' };
const COLOR = { '负债':'#A992F2', '固定资产':'#45A6CE', '流动资产':'#4C74DE', '投资资产':'#6E9BF5' };
const FOLDERS = ['个人档案', '账号与密码', '资产档案', '金融档案'];
const FOLDER_STYLE = { '个人档案':['f1','📁'], '账号与密码':['f2','📁'], '资产档案':['f3','📁'], '金融档案':['f4','📁'] };
const RATES = { CNY:1, USD:0.1402, HKD:1.0913, EUR:0.1294 };
const MARKETS = ['沪深京股市','香港股市','基金','贵金属','加密货币'];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '0.00';
  return Number(n).toLocaleString('zh-CN', { minimumFractionDigits:2, maximumFractionDigits:2 });
}
function short(n) {
  const a = Math.abs(n);
  if (a >= 1e8) return (n/1e8).toFixed(2) + ' 亿';
  if (a >= 1e4) return (n/1e4).toFixed(2) + ' 万';
  return fmt(n);
}
function esc(s) { return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------------- 演示数据 ---------------- */
function demo() {
  return {
    profile: { name:'留芳庄主', level:'A8', title:'心安·数字资产', currency:'CNY', hide:false, useValuation:true },
    base: {
      total: 19487843.42,
      cats: { '负债':5165242.75, '固定资产':9969400.00, '流动资产':8638941.05, '投资资产':1794502.37 }
    },
    assets: [],
    docs: [
      {id:uid(), folder:'个人档案', name:'身份证', note:'正反面照片已归档', date:'2026-08-12'},
      {id:uid(), folder:'个人档案', name:'港澳通行证', note:'有效期至 2029-05', date:'2026-08-12'},
      {id:uid(), folder:'个人档案', name:'机动车驾驶证', note:'', date:'2026-08-13'},
      {id:uid(), folder:'个人档案', name:'毕业证', note:'', date:'2026-08-13'},
      {id:uid(), folder:'账号与密码', name:'常用账号清单', note:'仅本机保存', date:'2026-09-01'},
      {id:uid(), folder:'账号与密码', name:'邮箱与手机账号', note:'', date:'2026-09-01'},
      {id:uid(), folder:'资产档案', name:'房产证', note:'青岛市城阳区', date:'2026-07-20'},
      {id:uid(), folder:'资产档案', name:'购车发票', note:'宝马5系', date:'2026-07-20'},
      {id:uid(), folder:'资产档案', name:'购买凭证 / 保修卡', note:'', date:'2026-07-22'},
      {id:uid(), folder:'资产档案', name:'保单与维修记录', note:'', date:'2026-07-22'},
      {id:uid(), folder:'金融档案', name:'银行卡清单', note:'工资卡 / 储蓄卡', date:'2026-08-02'},
      {id:uid(), folder:'金融档案', name:'证券账户', note:'沪深京股市', date:'2026-08-02'},
      {id:uid(), folder:'金融档案', name:'公积金账户', note:'', date:'2026-08-02'}
    ],
    shared: {
      out: [
        {id:uid(), name:'家庭资产清单', note:'发给家人 · 邮箱共享', date:'2026-10-02'},
        {id:uid(), name:'房产证与保单', note:'发给配偶', date:'2026-10-05'},
        {id:uid(), name:'重要账号索引', note:'仅含位置说明', date:'2026-10-11'}
      ],
      in: [
        {id:uid(), name:'父母的存折信息', note:'来自 妈妈', date:'2026-09-28'},
        {id:uid(), name:'家庭保单汇总', note:'来自 爸爸', date:'2026-10-01'},
        {id:uid(), name:'车辆资料', note:'来自 配偶', date:'2026-10-08'}
      ]
    },
    items: [
      {id:uid(), name:'特斯拉 Model Y', emoji:'🚗', photo:'', price:20000, value:280000, date:'2025-10-22', note:'个人 · 持有 360 天', docs:4},
      {id:uid(), name:'Mini M... 手提包', emoji:'👜', photo:'', price:32000, value:32000, date:'2026-09-10', note:'个人 · 持有 68 天', docs:0},
      {id:uid(), name:'黄地粉彩镂空开光转心瓶', emoji:'🏺', photo:'', price:23000, value:23000, date:'2026-10-18', note:'收藏 · 持有 30 天', docs:1},
      {id:uid(), name:'老铺黄金黄金饰', emoji:'🧿', photo:'', price:8000, value:8000, date:'2023-06-15', note:'收藏 · 持有 1250 天', docs:0},
      {id:uid(), name:'卡西欧手表', emoji:'⌚', photo:'', price:800, value:800, date:'2026-10-18', note:'个人 · 持有 30 天', docs:0},
      {id:uid(), name:'Louis Vuitton OnTheGo', emoji:'👜', photo:'', price:320000, value:320000, date:'2025-12-31', note:'个人 · 持有 320 天', docs:2},
      {id:uid(), name:'Bottaga Veneeta 手袋', emoji:'👝', photo:'', price:8800, value:8800, date:'2026-08-08', note:'个人 · 已附发票证书', docs:3}
    ],
    holdings: [
      {id:uid(), market:'沪深京股市', name:'招商中证白酒', code:'161725', value:128560.32, pnl:0, date:today()},
      {id:uid(), market:'沪深京股市', name:'宁德时代', code:'300750', value:62500.00, pnl:0, date:today()},
      {id:uid(), market:'沪深京股市', name:'贵州茅台', code:'600519', value:39724.68, pnl:0, date:today()},
      {id:uid(), market:'基金', name:'沪深300ETF', code:'510300', value:86000.00, pnl:0, date:today()},
      {id:uid(), market:'加密货币', name:'BTC / USDT', code:'BTCUSDT', value:45800.00, pnl:0, date:today()},
      {id:uid(), market:'香港股市', name:'腾讯控股', code:'00700', value:57800.00, pnl:0, date:today()},
      {id:uid(), market:'贵金属', name:'积存金', code:'AU', value:30200.00, pnl:0, date:today()}
    ],
    pnl: { 15:-5535, 16:2593, 19:-350, 20:149, 21:-3112, 22:-1126, 23:2679 },
    goals: [ {id:uid(), name:'买车基金', target:300000, saved:86000} ],
    reminders: [
      {id:uid(), text:'宝马5系：每月15日还款 5880.69 元'},
      {id:uid(), text:'宝马5系交强险保单将于 2026-09-16 到期'},
      {id:uid(), text:'建议每月发工资后更新一次银行卡余额'}
    ],
    holdingShot: '',
    stackActive: '投资资产',
    range: 30,
    market: '沪深京股市',
    shareTab: 'out',
    folder: '个人档案',
    itemId: null,
    updated: today(),
    lastBackup: null,
    backupHash: '',
    remindBackup: true,
    touched: false
  };
}

let S;
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.base) {
        if ('net' in d.base) delete d.base.net;
        const merged = Object.assign(demo(), d);
        // 旧版本升级：从未做过备份的老账本，提醒一次先备份
        if (!('lastBackup' in d)) merged.touched = true;
        return merged;
      }
    }
  } catch (e) { console.warn('读取本地数据失败', e); }
  return demo();
}
let lastHash = null;
function save() {
  try {
    const h = dataHash();
    if (lastHash !== null && h !== lastHash) S.touched = true;
    lastHash = h;
    localStorage.setItem(KEY, JSON.stringify(S));
  }
  catch (e) { toast('存储空间不足，建议删除部分图片'); }
}
S = load();
lastHash = dataHash();

/* ---------------- 备份防丢失 ---------------- */
// 只给「账本内容」算指纹，切换页面/币种等 UI 状态不会误判成"未备份"
function dataHash() {
  const core = { profile:S.profile, base:S.base, assets:S.assets, docs:S.docs,
    shared:S.shared, items:S.items, holdings:S.holdings, pnl:S.pnl,
    goals:S.goals, reminders:S.reminders, holdingShot:S.holdingShot };
  const str = JSON.stringify(core);
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return String(h);
}
function daysSince(d) {
  if (!d) return null;
  const a = new Date(d + 'T00:00:00'), b = new Date(today() + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}
function backupState() {
  const dirty = !S.backupHash || S.backupHash !== dataHash();
  const days = daysSince(S.lastBackup);
  let need = false;
  if (S.remindBackup) {
    if (!S.lastBackup) need = !!S.touched;                    // 从未备份：开始记账后才提醒
    else need = dirty && days !== null && days >= 7;          // 备份过：有改动且超过 7 天
  }
  return { dirty:dirty, days:days, need:need, never:!S.lastBackup, touched:!!S.touched };
}
function markBackedUp() {
  S.lastBackup = today(); S.backupHash = dataHash(); save();
}
// 备份文件自身带上备份日期与数据指纹，导入后可直接判定为"已备份"
function backupText() {
  const snap = Object.assign({}, S, { lastBackup: today(), backupHash: dataHash() });
  return JSON.stringify(snap, null, 2);
}
function backupName() { return '心安资产备份_' + today() + '.json'; }
function downloadBackup(txt, name) {
  const blob = new Blob([txt], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function backupNow() {
  const txt = backupText(), name = backupName();
  try {
    const file = new File([txt], name, {type:'application/json'});
    if (navigator.canShare && navigator.canShare({files:[file]})) {
      await navigator.share({files:[file], title:'心安资产备份', text:'心安账本备份 · ' + today()});
      markBackedUp(); renderAll(); toast('已分享，请保存到微信收藏或「文件」App'); return;
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  downloadBackup(txt, name); markBackedUp(); renderAll();
  toast('备份已下载，请移出浏览器下载目录保存');
}
async function copyBackup() {
  const txt = backupText();
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; }
  catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      ok = document.execCommand('copy'); document.body.removeChild(ta);
    } catch (e2) { ok = false; }
  }
  if (ok) { markBackedUp(); renderAll(); toast('备份已复制，粘贴到微信 / 备忘录保存'); }
  else toast('复制失败，请改用「一键备份」下载文件');
}

let storageInfo = { persisted:null, usage:0, quota:0 };
async function initStorage() {
  try {
    if (navigator.storage && navigator.storage.persisted)
      storageInfo.persisted = await navigator.storage.persisted();
    if (storageInfo.persisted === false && navigator.storage && navigator.storage.persist)
      storageInfo.persisted = await navigator.storage.persist();
    if (navigator.storage && navigator.storage.estimate) {
      const e = await navigator.storage.estimate();
      storageInfo.usage = e.usage || 0; storageInfo.quota = e.quota || 0;
    }
  } catch (e) {}
  renderBackupCard();
}
function renderBackupCard() {
  const el = $('#backupStatus'); if (!el) return;
  const st = backupState();
  let bar, title, sub;
  if (st.never) {
    bar = '#E8892B'; title = st.touched ? '还没备份过' : '尚未备份';
    sub = '把账本存到浏览器之外，清缓存才不会丢';
  } else if (st.dirty) {
    bar = '#E8892B'; title = '有未备份的改动';
    sub = '上次备份 ' + S.lastBackup + ' · 已过 ' + st.days + ' 天';
  } else {
    bar = '#2BA56B'; title = '已是最新备份';
    sub = '上次备份 ' + S.lastBackup + '（' + st.days + ' 天前）';
  }
  el.innerHTML = '<div class="bkbar" style="background:'+bar+'"></div>' +
    '<div style="display:flex;align-items:center;gap:8px;flex:1"><span style="font-size:18px">'+(st.dirty?'⚠️':'✅')+'</span>' +
    '<div><b style="font-size:13.5px">'+title+'</b><div class="sub" style="margin-top:2px">'+sub+'</div></div></div>';
  const sw = $('#setRemind'); if (sw) sw.classList.toggle('on', !!S.remindBackup);
  const info = $('#persistInfo');
  if (info) {
    let s;
    if (storageInfo.persisted === true) s = '✅ 已开启持久化存储：浏览器不会因空间不足自动清除本站数据。';
    else if (storageInfo.persisted === false) s = '⚠️ 浏览器未授予持久化存储，请务必定期备份。';
    else s = '存储状态检测中…';
    if (storageInfo.usage) s += ' 当前占用约 ' + (storageInfo.usage/1024).toFixed(0) + ' KB。';
    s += ' 注意：手动「清除浏览数据 / Cookie 及网站数据」仍会清掉本地数据，只有存到浏览器之外的备份不受影响。';
    info.textContent = s;
  }
}

/* ---------------- 计算 ---------------- */
function rate() { return RATES[S.profile.currency] || 1; }
function conv(n) { return n * rate(); }
function disp(n, sign) {
  if (S.profile.hide) return '••••••';
  return (sign ? (n > 0 ? '+' : '') : '') + fmt(conv(n));
}
function catVal(c) {
  let v = (S.base.cats[c] || 0);
  S.assets.forEach(a => { if (a.cat === c) v += Number(a.amount) || 0; });
  if (c === '固定资产' && !S.profile.useValuation) v *= 0.88;
  return v;
}
function totals() {
  // 演示底账沿用公开截图口径：总资产与四类之和不完全相等；
  // 用户新增的资产按增量累加，保证编辑后各数字同步变化。
  const delta = S.assets.filter(a => ASSET_CATS.indexOf(a.cat) >= 0)
                        .reduce((s,a) => s + (Number(a.amount) || 0), 0);
  const asset = (S.base.total || 0) + delta;
  const liab = catVal('负债');
  return { asset, liab, net: asset - liab };
}
function pct(c) { const t = totals(); const base = t.asset || 1; return Math.round(catVal(c) / base * 100); }

/* ---------------- 通用 UI ---------------- */
let toastTimer;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), 1900);
}
function openSheet(html) { $('#sheet').innerHTML = '<div class="bar"></div>' + html; $('#modal').classList.add('on'); }
function closeSheet() { $('#modal').classList.remove('on'); }
function go(view) {
  $$('.view').forEach(v => v.classList.remove('on'));
  const el = $('#v-' + view); if (el) el.classList.add('on');
  $$('#tabbar [data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === view));
  window.scrollTo(0, 0);
  render(view);
}
function head(title, desc) {
  return '<h2>' + esc(title) + '</h2>' + (desc ? '<div class="desc">' + esc(desc) + '</div>' : '');
}
function actions(okLabel, okAct, cancel) {
  return '<div class="actions"><button class="btn-ghost" data-act="close">' + (cancel || '取消') + '</button>' +
         '<button class="btn-main" data-act="' + okAct + '">' + esc(okLabel) + '</button></div>';
}
function sparkSVG(vals, w, h, color) {
  if (!vals || !vals.length) return '';
  const min = Math.min.apply(null, vals), max = Math.max.apply(null, vals), rg = (max - min) || 1;
  const pts = vals.map((v,i) => [ (i/(vals.length-1))*w, h - 8 - ((v-min)/rg)*(h-18) ]);
  const d = pts.map((p,i) => (i?'L':'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ' L' + w + ' ' + h + ' L0 ' + h + ' Z';
  return '<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+color+'" stop-opacity=".3"/><stop offset="1" stop-color="'+color+'" stop-opacity="0"/></linearGradient></defs>' +
    '<path d="'+area+'" fill="url(#tg)"/><path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
}

/* ---------------- 首页 ---------------- */
function renderStack() {
  const order = CATS.filter(c => c !== S.stackActive).concat([S.stackActive]);
  let html = '';
  order.forEach((c, i) => {
    const active = (c === S.stackActive);
    const v = catVal(c);
    if (active) {
      const sub = c === '投资资产' ? '今日收益：0.00' :
                  c === '固定资产' ? '市场估值：' + short(catVal(c)) :
                  c === '负债' ? '负债净资产比：' + (totals().net ? Math.round(catVal('负债')/totals().net*100) : 0) + '%' :
                  '资金分布一目了然';
      const en = { '投资资产':'INVESTMENT ASSETS', '固定资产':'FIXED ASSETS', '流动资产':'CURRENT ASSETS', '负债':'LIABILITIES' }[c];
      html += '<div class="scard expanded ' + CLS[c] + '" style="top:' + (i*31) + 'px;z-index:' + (20+i) + '" data-cat="' + c + '">' +
        '<div class="sc-en">' + en + '</div>' +
        '<div class="sc-name">' + c + '</div>' +
        '<div class="sc-amt">' + disp(v) + '</div>' +
        '<div class="sc-sub">' + sub + '</div>' +
        '<div class="sc-foot">' + (c === '投资资产' ? '🟢 今日盈亏 +0.00' : '点击查看分类明细') + '</div>' +
        '<div class="sc-pct">' + pct(c) + '%</div></div>';
    } else {
      html += '<div class="scard small ' + CLS[c] + '" style="top:' + (i*31) + 'px;z-index:' + (10+i) + '" data-cat="' + c + '">' +
        '<span>' + c + '</span><span class="amt">' + disp(v) + '</span></div>';
    }
  });
  $('#stack').innerHTML = html;
}
function renderHome() {
  const t = totals();
  $('#appTitle').textContent = S.profile.title;
  $('#badgeName').textContent = S.profile.name;
  $('#badgeLevel').textContent = S.profile.level;
  $('#currLabel').textContent = S.profile.currency;
  $('#netVal').textContent = disp(t.net);
  $('#totalVal').textContent = disp(t.asset);
  const st = backupState();
  const nt = $('#homeNotice');
  if (nt) {
    if (st.need) {
      nt.dataset.act = 'backup-now'; nt.classList.add('warn');
      const ic = nt.querySelector('.nic'); if (ic) ic.textContent = '⚠️';
      $('#noticeTxt').textContent = st.never
        ? '还没备份过，点这里把账本存到微信 / 文件，清缓存也不怕'
        : '距上次备份已 ' + st.days + ' 天且有新记录，建议重新备份';
    } else {
      nt.dataset.act = 'open-remind'; nt.classList.remove('warn');
      const ic = nt.querySelector('.nic'); if (ic) ic.textContent = '🔔';
      $('#noticeTxt').textContent = (S.reminders[0] && S.reminders[0].text) || '暂无提醒';
    }
  } else {
    $('#noticeTxt').textContent = (S.reminders[0] && S.reminders[0].text) || '暂无提醒';
  }
  $('#valSw').classList.toggle('on', S.profile.useValuation);
  const eye = $('.eye svg use'); if (eye) eye.setAttribute('href', S.profile.hide ? '#i-eyeoff' : '#i-eye');
  renderStack();
  const g = S.goals[0];
  $('#goalRow').innerHTML = g
    ? '<div class="g-ic">🚗</div><div class="g-name">' + esc(g.name) + ' · 已存 ' + (S.profile.hide?'••••':short(g.saved)) + ' / ' + (S.profile.hide?'••••':short(g.target)) + '</div><div class="g-arrow">›</div>'
    : '<div class="g-ic">✨</div><div class="g-name">还没有目标，点这里添加一个</div><div class="g-arrow">›</div>';
}

/* ---------------- 资产纵览 ---------------- */
function renderOverview() {
  const t = totals();
  $('#ovDate').textContent = '截至 ' + S.updated;
  $$('#rangeSeg button').forEach(b => b.classList.toggle('on', Number(b.dataset.r) === S.range));
  const rows = [
    ['负债', catVal('负债'), '#A992F2'],
    ['净资产', t.net, '#6E9BF5'],
    ['流动资金', catVal('流动资产'), '#4FBFD8'],
    ['投资理财', catVal('投资资产'), '#7C6BF0'],
    ['固定资产', catVal('固定资产'), '#45A6CE']
  ];
  const max = Math.max.apply(null, rows.map(r => Math.abs(r[1]))) || 1;
  $('#bars').innerHTML = rows.map(r =>
    '<div class="barrow"><div class="bl"><span>' + r[0] + '</span><b>' + (S.profile.hide?'••••••':short(r[1])) + '</b></div>' +
    '<div class="bartrack"><div class="barfill" style="width:' + Math.max(3, Math.abs(r[1])/max*100) + '%;background:' + r[2] + '"></div></div></div>'
  ).join('');
  // 环形图
  const parts = ASSET_CATS.map(c => ({ c, v: catVal(c), col: COLOR[c] }));
  const sum = parts.reduce((s,p) => s + Math.max(0,p.v), 0) || 1;
  let acc = 0, R = 44, C = 2 * Math.PI * R;
  let donut = '<circle cx="59" cy="59" r="'+R+'" fill="none" stroke="#F0F4FB" stroke-width="15"/>';
  parts.forEach(p => {
    const frac = Math.max(0,p.v)/sum, len = frac*C;
    donut += '<circle cx="59" cy="59" r="'+R+'" fill="none" stroke="'+p.col+'" stroke-width="15" stroke-dasharray="'+len.toFixed(2)+' '+(C-len).toFixed(2)+'" stroke-dashoffset="'+(-acc).toFixed(2)+'" transform="rotate(-90 59 59)"/>';
    acc += len;
  });
  donut += '<text x="59" y="55" text-anchor="middle" font-size="11" fill="#8D9AB2">四类合计</text>';
  donut += '<text x="59" y="72" text-anchor="middle" font-size="13" font-weight="800" fill="#202B48">' + (S.profile.hide?'••••':short(sum)) + '</text>';
  $('#donut').innerHTML = donut;
  $('#legend').innerHTML = parts.map(p =>
    '<div><i style="background:'+p.col+'"></i><span>'+p.c+'</span><b>'+(S.profile.hide?'••':Math.round(Math.max(0,p.v)/sum*100)+'%')+'</b></div>'
  ).join('') +
    '<div style="border-top:1px dashed #E6ECF6;padding-top:7px;margin-top:2px"><i style="background:#A992F2"></i><span>负债率</span><b>' +
    (S.profile.hide?'••':(t.liab/(t.asset||1)*100).toFixed(1)+'%') + '</b></div>';
  // 走势
  const seed = CATS.length + S.range + Math.round(t.net/1e6);
  const vals = []; let v = 0.78;
  for (let i=0;i<24;i++) { v += (Math.sin(i*1.7+seed)*0.045) + 0.012; vals.push(v); }
  $('#trendChart').innerHTML = sparkSVG(vals, 360, 120, '#6E9BF5');
  $('#trendTag').textContent = ({7:'近 7 天',30:'最近 30 天',90:'近 90 天',365:'近一年'})[S.range];
  $('#catList').innerHTML = CATS.map(c =>
    '<div class="setrow" data-act="cat-detail" data-cat="'+c+'"><span class="k"><span style="display:inline-block;width:8px;height:8px;border-radius:3px;background:'+COLOR[c]+';margin-right:8px"></span>'+c+'</span><span class="v">'+disp(catVal(c))+' ›</span></div>'
  ).join('');
}

/* ---------------- 报告 ---------------- */
function renderReport() {
  const t = totals();
  $('#rpDate').textContent = S.updated;
  $('#rpNet').textContent = disp(t.net);
  $('#rpSub').textContent = '总资产 ' + disp(t.asset) + ' · 负债 ' + disp(t.liab) + ' · 共 ' + (S.assets.length + S.items.length + S.holdings.length + 21) + ' 项记录';
  const ratio = t.asset ? (t.liab/t.asset*100) : 0;
  const kpis = [
    ['总资产', disp(t.asset)], ['净资产', disp(t.net)], ['总负债', disp(t.liab)],
    ['负债率', ratio.toFixed(1) + '%'], ['资产类别', ASSET_CATS.length + ' 类'], ['文档资料', S.docs.length + ' 份']
  ];
  $('#rpKpi').innerHTML = '<div class="folders" style="grid-template-columns:1fr 1fr;gap:8px">' + kpis.map(k =>
    '<div style="background:#F5F8FE;border-radius:12px;padding:11px"><div class="sub">'+k[0]+'</div><div style="font-size:15px;font-weight:800;margin-top:5px">'+k[1]+'</div></div>'
  ).join('') + '</div>';
  const max = Math.max.apply(null, ASSET_CATS.map(c=>catVal(c))) || 1;
  $('#rpBars').innerHTML = ASSET_CATS.map(c =>
    '<div class="barrow"><div class="bl"><span>'+c+'</span><b>'+(S.profile.hide?'••••':short(catVal(c)))+'</b></div><div class="bartrack"><div class="barfill" style="width:'+(catVal(c)/max*100)+'%;background:'+COLOR[c]+'"></div></div></div>'
  ).join('');
  const all = [];
  ASSET_CATS.forEach(c => all.push({name:c, v:catVal(c), note:'分类汇总'}));
  S.assets.forEach(a => all.push({name:a.name, v:Number(a.amount)||0, note:a.cat}));
  S.items.forEach(i => all.push({name:i.name, v:Number(i.value)||0, note:'物品'}));
  all.sort((a,b)=>b.v-a.v);
  $('#rpTop').innerHTML = all.slice(0,5).map((x,i) =>
    '<div class="lrow"><span class="lic">'+(i+1)+'</span><div class="lt"><b>'+esc(x.name)+'</b><small>'+esc(x.note)+'</small></div><div class="lv">'+disp(x.v)+'</div></div>'
  ).join('');
  $('#rpAdvice').textContent = ratio > 60
    ? '当前负债率 '+ratio.toFixed(1)+'%，偏高。建议优先梳理还款计划，把「负债」卡片里的项目逐条核对，再考虑新增投资。'
    : ratio > 30
    ? '当前负债率 '+ratio.toFixed(1)+'%，处于常见区间。固定资产占比 '+Math.round(catVal('固定资产')/(t.asset||1)*100)+'%，流动性偏低时可保留一部分流动资金备用。'
    : '当前负债率 '+ratio.toFixed(1)+'%，结构稳健。投资资产占比 '+Math.round(catVal('投资资产')/(t.asset||1)*100)+'%，可以按月更新市值，观察净值变化。';
}

/* ---------------- 档案 ---------------- */
function renderArchive() {
  $('#sharedOut').textContent = S.shared.out.length + ' 个文档';
  $('#folders').innerHTML = FOLDERS.map(f => {
    const st = FOLDER_STYLE[f], n = S.docs.filter(d => d.folder === f).length;
    return '<div class="folder '+st[0]+'" data-act="open-folder" data-folder="'+f+'"><div class="fart">'+st[1]+'</div><b>'+f+'</b><small>'+n+' 份资料</small><span class="farr">›</span></div>';
  }).join('');
}
function renderFolder() {
  $('#folderTitle').textContent = S.folder;
  $('#folderDesc').textContent = '妥善保存人生最重要资料，随时可查';
  const list = S.docs.filter(d => d.folder === S.folder);
  $('#folderCount').textContent = list.length + ' 份资料';
  $('#docList').innerHTML = list.length ? list.map(d =>
    '<div class="lrow" data-act="doc-detail" data-id="'+d.id+'"><span class="lic">📄</span><div class="lt"><b>'+esc(d.name)+'</b><small>'+esc(d.note || d.date)+'</small></div><span class="arr">›</span></div>'
  ).join('') : '<div class="empty">这个文件夹还没有资料<br>点右上角 + 添加</div>';
}
function renderShare() {
  $$('#shareSeg button').forEach(b => b.classList.toggle('on', b.dataset.s === S.shareTab));
  const list = S.shared[S.shareTab];
  $('#shareList').innerHTML = list.length ? list.map(d =>
    '<div class="lrow"><span class="lic">'+(S.shareTab==='out'?'📤':'📥')+'</span><div class="lt"><b>'+esc(d.name)+'</b><small>'+esc(d.note)+' · '+d.date+'</small></div><span class="arr">›</span></div>'
  ).join('') : '<div class="empty">暂无共享资料</div>';
}

/* ---------------- 物品 ---------------- */
function renderItems() {
  const total = S.items.reduce((s,i)=>s+(Number(i.value)||0),0);
  $('#itemTotal').textContent = disp(total);
  $('#itemCount').textContent = '共 ' + S.items.length + ' 件物品 · 拍照录入，发票证书跟着物品整理';
  $('#itemGrid').innerHTML = S.items.map(i =>
    '<div class="itemcard" data-act="open-item" data-id="'+i.id+'"><div class="iphoto">' +
      (i.photo ? '<img src="'+i.photo+'" alt="">' : (i.emoji||'📦')) + '</div>' +
      '<div class="itxt"><b>'+esc(i.name)+'</b><div class="pr">¥ '+disp(i.value)+'</div><small>'+esc(i.note||'')+'</small></div></div>'
  ).join('') || '<div class="empty" style="grid-column:1/-1">还没有物品，点下方按钮拍照录入</div>';
}
function renderItemDetail() {
  const i = S.items.find(x => x.id === S.itemId);
  if (!i) { go('items'); return; }
  $('#itemTitle').textContent = i.name;
  $('#itemPhoto').innerHTML = i.photo ? '<img src="'+i.photo+'" alt="">' : (i.emoji || '📦');
  const days = Math.max(0, Math.round((Date.now() - new Date(i.date).getTime())/86400000));
  $('#itemMeta').textContent = '¥ ' + disp(i.price) + ' | 持有 ' + days + ' 天 | 个人';
  $('#itemValue').textContent = '¥ ' + disp(i.value);
  $('#itemUpdate').textContent = '估值更新于 ' + S.updated + ' 13:00:00';
  $('#itemDocs').textContent = (i.docs||0) + ' 份资料';
  $('#itemInfo').innerHTML =
    '<div class="lrow"><span class="lic">🏷️</span><div class="lt"><b>购买价格</b><small>录入时填写</small></div><div class="lv">¥ '+disp(i.price)+'</div></div>' +
    '<div class="lrow"><span class="lic">📅</span><div class="lt"><b>购买日期</b><small>'+esc(i.date)+'</small></div><div class="lv">'+days+' 天</div></div>' +
    '<div class="lrow"><span class="lic">📝</span><div class="lt"><b>备注</b><small>'+esc(i.note||'无')+'</small></div></div>' +
    '<div class="lrow" data-act="add-doc"><span class="lic">📎</span><div class="lt"><b>关联文档</b><small>发票 / 证书 / 保修凭证</small></div><span class="arr">＋</span></div>';
}

/* ---------------- 投资资产 ---------------- */
function renderInvest() {
  $$('#marketTab button').forEach(b => b.classList.toggle('on', b.dataset.m === S.market));
  const hs = S.holdings.filter(h => h.market === S.market);
  const total = hs.reduce((s,h)=>s+(Number(h.value)||0),0);
  const pnlToday = hs.reduce((s,h)=>s+(Number(h.pnl)||0),0);
  $('#mCurrency').textContent = S.profile.currency;
  $('#investTotal').textContent = disp(total);
  $('#investUpdate').textContent = '更新时间：' + S.updated + ' 15:00';
  const el = $('#investToday'); el.textContent = (pnlToday>=0?'+':'') + disp(pnlToday); el.className = pnlToday>=0 ? 'pos':'neg';
  $('#holdingList').innerHTML = hs.length ? hs.map(h =>
    '<div class="lrow" data-act="edit-holding" data-id="'+h.id+'"><span class="lic">📈</span><div class="lt"><b>'+esc(h.name)+'</b><small>'+esc(h.code||'')+' · '+esc(h.date)+'</small></div><div class="lv">'+disp(h.value)+'</div></div>'
  ).join('') : '<div class="empty">该市场暂无持仓，点右上角 + 添加</div>';
  // 日历（当前月）
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  $('#calTitle').textContent = y + ' 年 ' + (m+1) + ' 月';
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m+1, 0).getDate();
  let html = ['日','一','二','三','四','五','六'].map(w => '<div class="wd">'+w+'</div>').join('');
  for (let k=0;k<first;k++) html += '<div class="calcell blank"></div>';
  for (let d=1;d<=days;d++) {
    const wd = new Date(y,m,d).getDay(), rest = (wd===0||wd===6);
    const p = S.pnl[d];
    let cls = 'calcell', txt = '';
    if (p !== undefined) { cls += p>=0 ? ' plus':' minus'; txt = '<span class="pnl">'+(p>0?'+':'')+p.toFixed(2)+'</span>'; }
    else if (rest) { cls += ' rest'; txt = '<span class="pnl">休市日</span>'; }
    else { txt = '<span class="pnl" style="color:#C6CFDF">0.00</span>'; }
    html += '<div class="'+cls+'"><span class="d">'+d+'</span>'+txt+'</div>';
  }
  $('#calGrid').innerHTML = html;
}

/* ---------------- 我的 / 搜索 ---------------- */
function renderMine() {
  $('#mineAvatar').textContent = (S.profile.name||'心')[0];
  $('#mineName').textContent = S.profile.name;
  $('#mineLevel').textContent = S.profile.level + ' · 心安会员';
  $('#setNick').textContent = S.profile.name + ' / ' + S.profile.level + ' ›';
  $('#setCurr').textContent = S.profile.currency + ' ›';
  $('#setHide').classList.toggle('on', S.profile.hide);
  $('#setVal').classList.toggle('on', S.profile.useValuation);
  renderBackupCard();
}
function renderSearch() {
  const q = ($('#searchInput').value || '').trim().toLowerCase();
  if (!q) { $('#searchResult').innerHTML = ''; $('#searchHint').textContent = '输入关键词，实时查找全部记录'; return; }
  const out = [];
  CATS.forEach(c => { if (c.includes(q)) out.push({n:c, s:'资产分类', v:disp(catVal(c)), act:'cat-detail', cat:c}); });
  S.assets.forEach(a => { if ((a.name+a.note+a.cat).toLowerCase().includes(q)) out.push({n:a.name, s:a.cat, v:disp(Number(a.amount)||0), act:'noop'}); });
  S.docs.forEach(d => { if ((d.name+d.note+d.folder).toLowerCase().includes(q)) out.push({n:d.name, s:d.folder, v:esc(d.note||''), act:'open-folder', folder:d.folder}); });
  S.items.forEach(i => { if ((i.name+i.note).toLowerCase().includes(q)) out.push({n:i.name, s:'我的物品', v:disp(i.value), act:'open-item', id:i.id}); });
  S.holdings.forEach(h => { if ((h.name+h.code+h.market).toLowerCase().includes(q)) out.push({n:h.name, s:h.market, v:disp(h.value), act:'edit-holding', id:h.id}); });
  $('#searchHint').textContent = '找到 ' + out.length + ' 条记录';
  $('#searchResult').innerHTML = out.length ? out.map(x =>
    '<div class="lrow" data-act="'+x.act+'"'+(x.id?' data-id="'+x.id+'"':'')+(x.cat?' data-cat="'+x.cat+'"':'')+(x.folder?' data-folder="'+x.folder+'"':'')+'>' +
    '<span class="lic">🔎</span><div class="lt"><b>'+esc(x.n)+'</b><small>'+esc(x.s)+'</small></div><div class="lv" style="font-size:12px">'+x.v+'</div></div>'
  ).join('') : '<div class="empty">没有找到相关记录</div>';
}

function render(view) {
  const map = { home:renderHome, overview:renderOverview, report:renderReport,
    butler:renderButlerTips, archive:renderArchive, folder:renderFolder, share:renderShare,
    items:renderItems, itemdetail:renderItemDetail, invest:renderInvest,
    mine:renderMine, search:renderSearch };
  if (map[view]) map[view]();
}
function renderButlerTips() {
  $('#butlerTips').innerHTML = S.reminders.map(r =>
    '<div class="lrow"><span class="lic">🔔</span><div class="lt"><b>'+esc(r.text)+'</b><small>智能提醒</small></div></div>'
  ).join('') || '<div class="empty">暂无提醒</div>';
}
function renderAll() {
  const cur = ($('.view.on') || {}).id || 'v-home';
  render(cur.replace('v-',''));
  renderHome();
  renderBackupCard();
}

/* ---------------- 表单弹窗 ---------------- */
function formAddAsset(cat) {
  cat = cat || '流动资产';
  openSheet(head('添加资产', '记录真正重要的变化，不必每天记账') +
    '<div class="field"><label>资产类别</label><div class="chips" id="fCat">' +
      CATS.map(c => '<button data-c="'+c+'" class="'+(c===cat?'on':'')+'">'+c+'</button>').join('') + '</div></div>' +
    '<div class="field"><label>名称</label><input id="fName" placeholder="如：招商银行卡 / 城阳区房产"></div>' +
    '<div class="field"><label>金额（元）</label><input id="fAmt" type="number" inputmode="decimal" placeholder="0.00"></div>' +
    '<div class="field"><label>备注（选填）</label><input id="fNote" placeholder="如：工资卡、每月更新"></div>' +
    '<div class="field"><label>日期</label><input id="fDate" type="date" value="'+today()+'"></div>' +
    actions('保存资产','save-asset'));
  $('#fCat').addEventListener('click', e => {
    const b = e.target.closest('button[data-c]'); if (!b) return;
    $$('#fCat button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  });
}
function saveAsset() {
  const cat = ($('#fCat .on') || {}).dataset ? $('#fCat .on').dataset.c : '流动资产';
  const name = $('#fName').value.trim(), amt = Number($('#fAmt').value);
  if (!name) return toast('请填写资产名称');
  if (!amt || amt <= 0) return toast('请填写有效金额');
  S.assets.push({ id:uid(), cat, name, amount:amt, note:$('#fNote').value.trim(), date:$('#fDate').value || today() });
  save(); closeSheet(); renderAll(); toast('已添加「' + name + '」');
}
function formAddDoc() {
  openSheet(head('添加资料', '资料只保存在本机，不会上传') +
    '<div class="field"><label>所属文件夹</label><div class="chips" id="fFolder">' +
      FOLDERS.map(f => '<button data-f="'+f+'" class="'+(f===S.folder?'on':'')+'">'+f+'</button>').join('') + '</div></div>' +
    '<div class="field"><label>资料名称</label><input id="fName" placeholder="如：身份证 / 房产证 / 保修卡"></div>' +
    '<div class="field"><label>备注</label><input id="fNote" placeholder="选填"></div>' +
    actions('保存资料','save-doc'));
  $('#fFolder').addEventListener('click', e => {
    const b = e.target.closest('button[data-f]'); if (!b) return;
    $$('#fFolder button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  });
}
function saveDoc() {
  const folder = ($('#fFolder .on')||{}).dataset ? $('#fFolder .on').dataset.f : S.folder;
  const name = $('#fName').value.trim();
  if (!name) return toast('请填写资料名称');
  S.docs.push({ id:uid(), folder, name, note:$('#fNote').value.trim(), date:today() });
  S.folder = folder; save(); closeSheet(); renderAll(); toast('资料已保存');
}
function formAddItem() {
  openSheet(head('拍照录入物品', '拍下心头好，发票证书一起收好') +
    '<div class="field"><label>物品照片</label><button class="linebtn" style="width:100%;text-align:center" data-act="pick-photo">📷 选择 / 拍摄照片</button>' +
      '<div id="photoPrev" style="margin-top:10px"></div></div>' +
    '<div class="field"><label>物品名称</label><input id="fName" placeholder="如：新入手的耳机"></div>' +
    '<div class="field"><label>购买价格（元）</label><input id="fPrice" type="number" inputmode="decimal" placeholder="0.00"></div>' +
    '<div class="field"><label>当前估值（元）</label><input id="fValue" type="number" inputmode="decimal" placeholder="留空则按购买价"></div>' +
    '<div class="field"><label>购买日期</label><input id="fDate" type="date" value="'+today()+'"></div>' +
    '<div class="field"><label>备注</label><input id="fNote" placeholder="选填"></div>' +
    actions('保存物品','save-item'));
}
let pendingPhoto = '';
function saveItem() {
  const name = $('#fName').value.trim(), price = Number($('#fPrice').value);
  if (!name) return toast('请填写物品名称');
  if (!price || price < 0) return toast('请填写购买价格');
  const val = Number($('#fValue').value) || price;
  S.items.unshift({ id:uid(), name, emoji:'📦', photo:pendingPhoto, price, value:val,
    date:$('#fDate').value || today(), note:$('#fNote').value.trim() || '个人 · 新录入', docs:0 });
  pendingPhoto = ''; save(); closeSheet(); renderAll(); toast('物品已录入');
}
function formAddHolding() {
  openSheet(head('添加持仓', '演示版需手动填写数值，不接入券商接口') +
    '<div class="field"><label>市场</label><div class="chips" id="fMarket">' +
      MARKETS.map(m => '<button data-m="'+m+'" class="'+(m===S.market?'on':'')+'">'+m+'</button>').join('') + '</div></div>' +
    '<div class="field"><label>名称</label><input id="fName" placeholder="如：招商中证白酒"></div>' +
    '<div class="field"><label>代码（选填）</label><input id="fCode" placeholder="161725"></div>' +
    '<div class="field"><label>持仓金额（元）</label><input id="fAmt" type="number" inputmode="decimal" placeholder="0.00"></div>' +
    '<div class="field"><label>今日盈亏（元，可负）</label><input id="fPnl" type="number" inputmode="decimal" placeholder="0.00"></div>' +
    actions('保存持仓','save-holding'));
  $('#fMarket').addEventListener('click', e => {
    const b = e.target.closest('button[data-m]'); if (!b) return;
    $$('#fMarket button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  });
}
function saveHolding() {
  const market = ($('#fMarket .on')||{}).dataset ? $('#fMarket .on').dataset.m : S.market;
  const name = $('#fName').value.trim(), amt = Number($('#fAmt').value);
  if (!name) return toast('请填写持仓名称');
  if (!amt) return toast('请填写持仓金额');
  S.holdings.push({ id:uid(), market, name, code:$('#fCode').value.trim(), value:amt,
    pnl:Number($('#fPnl').value)||0, date:today() });
  S.market = market; save(); closeSheet(); renderAll(); toast('持仓已保存');
}
function formCatDetail(cat) {
  const list = S.assets.filter(a => a.cat === cat);
  openSheet(head(cat, '当前合计 ' + disp(catVal(c)) + ' · 占总资产约 ' + pct(cat) + '%') +
    (list.length ? '<div class="list" style="margin-bottom:12px">' + list.map(a =>
      '<div class="lrow"><span class="lic">💠</span><div class="lt"><b>'+esc(a.name)+'</b><small>'+esc(a.note||a.date)+'</small></div>' +
      '<div class="lv">'+disp(Number(a.amount))+'</div><button class="arr" data-act="del-asset" data-id="'+a.id+'">✕</button></div>'
    ).join('') + '</div>' : '<div class="empty">该分类目前只有演示底账，没有自定义明细</div>') +
    '<button class="bluebtn" style="width:100%" data-act="add-asset" data-cat="'+cat+'">＋ 添加一条' + cat + '</button>' +
    actions('关闭','close','返回'));
}
function formCurrency() {
  openSheet(head('显示币种', '演示汇率为固定示意值，仅用于展示换算') +
    '<div class="chips" id="fCurr">' + Object.keys(RATES).map(c =>
      '<button data-c="'+c+'" class="'+(c===S.profile.currency?'on':'')+'">'+c+'</button>').join('') + '</div>' +
    actions('确定','save-currency'));
  $('#fCurr').addEventListener('click', e => {
    const b = e.target.closest('button[data-c]'); if (!b) return;
    $$('#fCurr button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  });
}
function formRename() {
  openSheet(head('昵称与等级', '显示在首页标题下方') +
    '<div class="field"><label>昵称</label><input id="fName" value="'+esc(S.profile.name)+'"></div>' +
    '<div class="field"><label>等级标签</label><input id="fLevel" value="'+esc(S.profile.level)+'"></div>' +
    '<div class="field"><label>首页标题</label><input id="fTitle" value="'+esc(S.profile.title)+'"></div>' +
    actions('保存','save-rename'));
}
function formGoal() {
  const g = S.goals[0] || {name:'', target:0, saved:0};
  openSheet(head('我的梦想', '把梦想，慢慢存好') +
    '<div class="field"><label>目标名称</label><input id="fName" value="'+esc(g.name)+'" placeholder="买车基金"></div>' +
    '<div class="field"><label>目标金额（元）</label><input id="fTarget" type="number" value="'+(g.target||'')+'"></div>' +
    '<div class="field"><label>已存金额（元）</label><input id="fSaved" type="number" value="'+(g.saved||'')+'"></div>' +
    actions('保存','save-goal'));
}
function formRemind() {
  openSheet(head('智能提醒', '还款节点、保单到期、更新余额') +
    '<div class="list" style="margin-bottom:12px">' + S.reminders.map(r =>
      '<div class="lrow"><span class="lic">🔔</span><div class="lt"><b>'+esc(r.text)+'</b></div><button class="arr" data-act="del-remind" data-id="'+r.id+'">✕</button></div>'
    ).join('') + '</div>' +
    '<div class="field"><label>新增提醒</label><input id="fName" placeholder="如：每月15日还款"></div>' +
    actions('添加提醒','save-remind'));
}

/* ---------------- 导入导出 / 图片 ---------------- */
function exportData() {
  downloadBackup(backupText(), backupName());
  markBackedUp(); renderAll();
  toast('备份已导出，请妥善保存');
}
function importData(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || !d.base) throw new Error('格式不符');
      S = Object.assign(demo(), d);
      lastHash = dataHash();
      markBackedUp(); renderAll(); toast('备份已导入，可从这里继续记账');
    } catch (e) { toast('导入失败：不是有效的心安备份文件'); }
  };
  r.readAsText(file);
}
function readImage(file, cb) {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 720, k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width*k); cv.height = Math.round(img.height*k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      cb(cv.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => toast('图片读取失败');
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

/* ---------------- 事件 ---------------- */
const ACTS = {
  'go': el => go(el.dataset.view),
  'close': closeSheet,
  'noop': () => {},
  'add-asset': el => formAddAsset(el.dataset.cat),
  'save-asset': saveAsset,
  'del-asset': el => { S.assets = S.assets.filter(a => a.id !== el.dataset.id); save(); closeSheet(); renderAll(); toast('已删除'); },
  'cat-detail': el => formCatDetail(el.dataset.cat),
  'toggle-hide': () => { S.profile.hide = !S.profile.hide; save(); renderAll(); toast(S.profile.hide?'金额已隐藏':'金额已显示'); },
  'toggle-val': () => { S.profile.useValuation = !S.profile.useValuation; save(); renderAll(); toast(S.profile.useValuation?'固定资产按估值算':'固定资产按购买成本估算'); },
  'pick-currency': formCurrency,
  'save-currency': () => { const b = $('#fCurr .on'); if (b) S.profile.currency = b.dataset.c; save(); closeSheet(); renderAll(); toast('已切换为 ' + S.profile.currency); },
  'rename': formRename,
  'save-rename': () => { S.profile.name = $('#fName').value.trim() || S.profile.name; S.profile.level = $('#fLevel').value.trim() || S.profile.level; S.profile.title = $('#fTitle').value.trim() || S.profile.title; save(); closeSheet(); renderAll(); toast('已保存'); },
  'open-goals': formGoal,
  'save-goal': () => { const n = $('#fName').value.trim(); if (!n) return toast('请填写目标名称'); S.goals = [{id:uid(), name:n, target:Number($('#fTarget').value)||0, saved:Number($('#fSaved').value)||0}]; save(); closeSheet(); renderAll(); toast('目标已保存'); },
  'open-remind': formRemind,
  'save-remind': () => { const n = $('#fName').value.trim(); if (!n) return toast('请填写提醒内容'); S.reminders.push({id:uid(), text:n}); save(); closeSheet(); renderAll(); toast('提醒已添加'); },
  'del-remind': el => { S.reminders = S.reminders.filter(r=>r.id!==el.dataset.id); save(); closeSheet(); formRemind(); renderAll(); },
  'add-doc': formAddDoc,
  'save-doc': saveDoc,
  'open-folder': el => { S.folder = el.dataset.folder; save(); go('folder'); },
  'doc-detail': el => { const d = S.docs.find(x=>x.id===el.dataset.id); if (d) openSheet(head(d.name, d.folder + ' · ' + d.date) +
      '<div class="card" style="background:#F6F9FE;margin-bottom:12px"><div class="sub">备注</div><div style="font-size:14px;margin-top:6px">' + esc(d.note || '无') + '</div></div>' +
      actions('关闭','close','返回')); },
  'share-doc': () => { S.shared.out.unshift({id:uid(), name:'资产资料清单', note:'本机生成 · ' + today(), date:today()}); save(); renderAll(); toast('已生成共享清单'); },
  'share-text': () => {
    const i = S.items.find(x=>x.id===S.itemId); if (!i) return;
    const txt = '【心安 · 物品资料】' + i.name + '，当前估值 ¥' + fmt(i.value) + '，购于 ' + i.date;
    if (navigator.share) navigator.share({title:i.name, text:txt}).catch(()=>{});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>toast('资料已复制'));
    else toast(txt);
  },
  'add-item': formAddItem,
  'pick-photo': () => { $('#imgInput').dataset.mode = ''; $('#imgInput').click(); },
  'save-item': saveItem,
  'open-item': el => { S.itemId = el.dataset.id; save(); go('itemdetail'); },
  'delete-item': () => { S.items = S.items.filter(i=>i.id!==S.itemId); save(); go('items'); renderAll(); toast('物品已删除'); },
  'revalue': () => {
    const i = S.items.find(x=>x.id===S.itemId); if (!i) return;
    openSheet(head('估值说明', '演示版按购买价与持有时间做粗略估算，不构成真实估值') +
      '<div class="card" style="background:#F6F9FE;margin-bottom:12px"><div class="sub">购买价格 ¥'+fmt(i.price)+' · 当前录入估值 ¥'+fmt(i.value)+'</div>' +
      '<div style="font-size:22px;font-weight:800;color:var(--blue);margin-top:8px">¥ '+fmt(i.value)+'</div></div>' +
      '<div class="field"><label>手动更新估值（元）</label><input id="fValue2" type="number" value="'+i.value+'"></div>' +
      actions('更新估值','save-revalue'));
  },
  'save-revalue': () => { const i=S.items.find(x=>x.id===S.itemId); if(i){ i.value=Number($('#fValue2').value)||i.value; save(); closeSheet(); renderAll(); toast('估值已更新'); } },
  'add-holding': formAddHolding,
  'save-holding': saveHolding,
  'edit-holding': el => {
    const h = S.holdings.find(x=>x.id===el.dataset.id); if (!h) return;
    openSheet(head(h.name, h.market + ' · ' + (h.code||'')) +
      '<div class="field"><label>持仓金额（元）</label><input id="fAmt2" type="number" value="'+h.value+'"></div>' +
      '<div class="field"><label>今日盈亏（元）</label><input id="fPnl2" type="number" value="'+h.pnl+'"></div>' +
      '<div class="actions"><button class="btn-ghost" data-act="del-holding" data-id="'+h.id+'">删除</button><button class="btn-main" data-act="save-holding-edit" data-id="'+h.id+'">保存</button></div>');
  },
  'save-holding-edit': el => { const h=S.holdings.find(x=>x.id===el.dataset.id); if(h){h.value=Number($('#fAmt2').value)||0;h.pnl=Number($('#fPnl2').value)||0;save();closeSheet();renderAll();toast('持仓已更新');} },
  'del-holding': el => { S.holdings=S.holdings.filter(h=>h.id!==el.dataset.id);save();closeSheet();renderAll();toast('已删除'); },
  'import-holding': () => { $('#imgInput').dataset.mode = 'holding'; $('#imgInput').click(); },
  'export': exportData,
  'import': () => $('#fileInput').click(),
  'backup-now': backupNow,
  'copy-backup': copyBackup,
  'toggle-remind': () => { S.remindBackup = !S.remindBackup; save(); renderAll(); toast(S.remindBackup?'已开启备份提醒':'已关闭备份提醒'); },
  'backup-help': () => openSheet(
    head('清缓存为什么会丢数据', '以及怎么让它真的丢不了') +
    '<div class="card" style="background:#F6F9FE;margin-bottom:12px"><p class="sub" style="margin:0">账本存在浏览器的「站点数据」里。清理时如果勾选了「Cookie 及网站数据 / 清除浏览数据」，这份数据会被一起删掉。这是浏览器自身的设计，任何纯本地网页都无法阻止用户手动清除。</p></div>' +
    '<div class="card" style="margin-bottom:12px"><b class="sec-title">真正有效的做法</b><div class="sub" style="margin-top:10px;line-height:1.75">' +
      '① 点「一键备份」，把 JSON 分享到微信收藏、文件传输助手或手机「文件」App。文件在浏览器之外，清缓存不影响它。<br>' +
      '② 万一数据被清了：重新打开 App，用「导入备份」选中那份文件即可完整恢复。<br>' +
      '③ 建议每月更新余额后顺手备份一次；重要资料另外单独存一份。</div></div>' +
    '<div class="card" style="margin-bottom:12px"><b class="sec-title">已经做的加固</b><div class="sub" style="margin-top:10px;line-height:1.75">' +
      '· 已申请持久化存储，避免浏览器因空间不足自动清除<br>' +
      '· 添加到主屏幕（PWA）后数据更稳定<br>' +
      '· 有改动且超过 7 天未备份，会在首页和这里提醒<br><br>' +
      '注意：这些只能防「自动清理」，防不住手动清除浏览数据。</div></div>' +
    actions('知道了','close')),
  'clear-demo': () => {
    openSheet(head('清空演示数据','将移除内置演示底账、示例档案、物品与持仓，只保留你后来自己添加的资产明细。建议先导出备份。') +
      actions('确认清空','do-clear'));
  },
  'do-clear': () => {
    const mine = S.assets.slice();
    S.base = {total:0, cats:{'负债':0,'固定资产':0,'流动资产':0,'投资资产':0}};
    S.assets = mine;
    S.docs = []; S.items = []; S.holdings = [];
    S.shared = {out:[], in:[]}; S.goals = []; S.reminders = [];
    save(); closeSheet(); renderAll(); toast('演示数据已清空');
  },
  'reset': () => openSheet(head('恢复演示数据','将覆盖当前所有本地数据，请先导出备份') + actions('确认恢复','do-reset')),
  'do-reset': () => { S = demo(); save(); closeSheet(); renderAll(); toast('已恢复初始数据'); }
};

document.addEventListener('click', e => {
  const actEl = e.target.closest('[data-act]');
  if (actEl) {
    const fn = ACTS[actEl.dataset.act];
    if (fn) { fn(actEl); return; }
  }
  const viewEl = e.target.closest('#tabbar [data-view], [data-view]');
  if (viewEl && !actEl) { go(viewEl.dataset.view); return; }
});
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeSheet(); });

$('#stack').addEventListener('click', e => {
  const c = e.target.closest('.scard[data-cat]');
  if (c && c.dataset.cat !== S.stackActive) { S.stackActive = c.dataset.cat; save(); renderStack(); }
});

$('#rangeSeg').addEventListener('click', e => {
  const b = e.target.closest('button[data-r]'); if (!b) return;
  S.range = Number(b.dataset.r); save(); renderOverview();
});
$('#marketTab').addEventListener('click', e => {
  const b = e.target.closest('button[data-m]'); if (!b) return;
  S.market = b.dataset.m; save(); renderInvest();
});
$('#shareSeg').addEventListener('click', e => {
  const b = e.target.closest('button[data-s]'); if (!b) return;
  S.shareTab = b.dataset.s; save(); renderShare();
});
$('#searchInput').addEventListener('input', renderSearch);
$('#fileInput').addEventListener('change', e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value=''; });
$('#imgInput').addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) readImage(f, data => {
    if ($('#imgInput').dataset.mode === 'holding') {
      S.holdingShot = data; save(); toast('截图已保存到本机，请手动填写持仓数值'); formAddHolding();
    } else {
      pendingPhoto = data;
      const p = $('#photoPrev'); if (p) p.innerHTML = '<img src="'+data+'" style="width:100%;max-height:160px;object-fit:cover;border-radius:12px">';
      toast('照片已添加');
    }
  });
  $('#imgInput').dataset.mode = ''; e.target.value = '';
});

/* 时钟 */
function tick() {
  const d = new Date();
  $('#clock').textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
}
tick(); setInterval(tick, 30000);

renderAll();
initStorage();
})();
